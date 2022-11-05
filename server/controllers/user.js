const passport = require('passport');
const express = require('express');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../lib/constants');
const { argon2ConfirmHash, argon2Hash } = require('../lib/utilityFunctions');
const prisma = require('../lib/prismaClient');
const { authenticate } = require('passport');

/**
 * @swagger
 * tags:
 *    name: User
 *    description: The User managing route
 *
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - id
 *        - email
 *      properties:
 *        id:
 *          type: string
 *          description: Auto-generated id of the User
 *          readOnly: true
 *        email:
 *          type: string
 *          description: The unique email of the User.
 *        password:
 *          type: string
 *          description: The password of the user
 *          writeOnly: true
 *        fname:
 *          type: string
 *          description: The first name of the user
 *        lname:
 *          type: string
 *          description: The last name of the user
 *        streetAddress:
 *          type: string
 *          description: The street address of the user
 *        postalCode:
 *          type: string
 *          description: The Postal Code of the user
 *        city:
 *          type: string
 *          description: The City the user lives in
 *        latitude:
 *          type: number
 *          format: double
 *          description: The latitude coordinate of the User
 *        longitude:
 *          type: number
 *          format: double
 *          description: The Longitude coordinate of the User
 *        createdAt:
 *          type: string
 *          format: date
 *          description: The Time stamp that the user was created at
 *          readOnly: true
 *        updatedAt:
 *          type: string
 *          format: date
 *          description: The Time stamp that the user was last updated
 *          readOnly: true
 *        Role:
 *          type: string
 *          description: The Role designation of the user
 *          readOnly: true
 */



userRouter.get(
	'/test-secure',
	passport.authenticate('jwt', { session: false }),
	(req, res, next) => {
		res.json({
			message: "You made it to the secure route",
		});
	}
);


/**
 * @swagger
 * /user/me:
 *  get:
 *    summary: Retrieves current user authenticated by JWT
 *    tags: [User]
 *    description: Based on user JWT provided checks to see if JWT is valid and returns back a User object.
 *    parameters:
 *      - name: secret_token
 *        in: header
 *        description: an authorization header
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: The user logged in with JWT
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 * 			400:
 *        description: The user logged in with JWT
*/
userRouter.get(
	'/me',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const { id, email } = req.user;
			const foundUser = await prisma.user.findUnique({
				where: { id },
			});

			if (!foundUser) {
				return res.status(400).json({
					message: "User could not be found or does not exist in the database."
				});
			}

			const parsedUser = {
				...foundUser,
				password: null,
			};

			res.status(200);
			res.json({
        ...parsedUser
			});
		} catch (error) {
			res.status(400);
			res.json({
				message: error.message,
        details: {
        	errorMessage: error.message,
        	errorStack: error.stack,
        }
			})
		} finally {
			await prisma.$disconnect();
		}
	}
)
userRouter.get(
	'/email/:email',
	async (req, res, next) => {
		try {
			const { email } = req.params;
			const foundUser = await prisma.user.findUnique({
				where: { email:email }
			});

			if (!foundUser) {
				return res.status(201).json({
					message: "User could not be found or does not exist in the database."
				});
			}
			res.status(200);
			res.json({
				foundUser
			})
		} catch (error) {
			res.status(400);
			res.json({
				message: error.message,
        details: {
          	errorMessage: error.message,
          	errorStack: error.stack,
        }
			})
		} finally {
			await prisma.$disconnect();
		}
	}
)

userRouter.get(
	'/me-verbose',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const { id, email } = req.user;
			const foundUser = await prisma.user.findUnique({
				where: { id },
				include: {
					address: true,
					geo: true,
					userSegments: true
				}
			});

			if (!foundUser) {
				return res.status(400).json({
					message: "User could not be found or does not exist in the database."
				})
			}

			const parsedUser = {
				...foundUser,
				password: null,
			}

			res.status(200);
			res.json({
        ...parsedUser
			})
		} catch (error) {
			res.status(400);
			res.json({
				message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			})
		} finally {
			await prisma.$disconnect();
		}
	}
)

/**
 * Signs up a user with fields referenced in the User DB model.
 * At a minimum must have email and password to succeed.
 *
 * @route			POST /user/signup
 * @access		Public (No credentials required)
 * @returns		{{ User, JWT }}
 */

/**
 * @swagger
 * /user/signup:
 *  post:
 *    summary: Creates a user based on User Values
 *    tags: [User]
 *    description: Creates a user with desired properties
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      201:
 *        description: The user was succesfully created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  $ref: '#/components/schemas/User'
 *                token:
 *                  type: string
 * 			401:
 *        description: The user couldn't be created
*/
userRouter.post(
	'/signup',
	async (req, res, next) => {
		passport.authenticate('signup', (err, user, info) => {
			if (err) {
				res.status(500);
				res.json({
					message: err.message,
					stack: err.stack,
				});
				return;
			}

			if (!user) {
				console.log(info);
				res.status(401);
				res.json({
					message: info.message
				});
				return;
			}

			// Give valid token upon signup
			const tokenBody = { id: user.id, email: user.email };
			const token = jwt.sign({ user: tokenBody }, JWT_SECRET, {
				expiresIn: JWT_EXPIRY
			});

			res.status(201).json({
				user: {
          ...user,
          password: null,
        },
				token,
			});
		})(req, res, next);
	}
)

/**
 * @swagger
 * /user/login:
 *  post:
 *    summary: Login a User with email and password
 *    tags: [User]
 *    description: Login a user using email and password
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *      200:
 *        description: The user is succesfully logged in
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  $ref: '#/components/schemas/User'
 *                token:
 *                  type: string
 * 			400:
 *        description: The user could not be logged in
*/
userRouter.post(
	'/login',
	async (req, res, next) => {
		passport.authenticate(
			'login',
			async (err, user, info) => {
				try {
					if (err) {
						res.status(400);
						return res.json({
							error: err,
							message: "An Error occured."
						});
					}

					if (!user) {
						res.status(400);
						return res.json({
							message: info.message
						});
					}

					req.login(
						user,
						{ session: false },
						async (error) => {
							if (error) return next(error);

							const tokenBody = { id: user.id, email: user.email };
							const token = jwt.sign({ user: tokenBody }, JWT_SECRET, {
								expiresIn: JWT_EXPIRY
							});

							const parsedUser = {
								...user,
								password: null,
							}

							res.status(200);
							return res.json({
								user: parsedUser,
								token,
							})
						}
					)
				} catch (error) {
					res.status(400).json({
						message: "An error occured while trying to login a user.",
						details: {
							errorMessage: error.message,
							errorStack: error.stack,
						}
					});
				}
			}
		)(req, res, next);
	}
)

userRouter.post(
	'/reset-password',
	async (req, res, next) => {
		try {
			console.log(req.query);
			const paramPassCode = req.query.passCode;
			const { email, password, confirmPassword} = req.body;
			const foundUser = await prisma.user.findUnique({
				where: { email }
			});

			console.log(foundUser.passCode);
			console.log(paramPassCode);

			//const validPassword = await argon2ConfirmHash(originalPassword, foundUser.password);
			if (foundUser.passCode != paramPassCode) {
				throw new Error(`The confirmation code is incorrect `);
			}
			if (confirmPassword != password) {
				throw new Error('Passwords must match');
			}
			var id = foundUser.id;
			const updatedUser = await prisma.user.update({
				where: { id },
				data: {
					password: await argon2Hash(confirmPassword)
				}
			});

			const parsedUser = { ...updatedUser, password: null, passCode: null };

			res.status(200).json({
				message: "User succesfully updated",
				user: parsedUser//,
				//validPassword
			});
		} catch (error) {
			res.status(400).json({
        message: `An Error occured while trying to change the password for the email.`,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });
		} finally {
			await prisma.$disconnect();
		}
	}
)

/**
 * @swagger
 * /user/getall:
 *  get:
 *    summary: Grabs all the users in the database
 *    tags: [User]
 *    description: Retrieve all users without personal information
 *    responses:
 *      200:
 *        description: All the users were succesfully retrieved
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 * 			400:
 *        description: A set of users could not be fetched properly
*/
userRouter.get(
	'/getAll',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const {email,id} = req.user;

			const theUser = await prisma.user.findUnique({where:{id:id}});

			if(theUser.userType === 'ADMIN' || theUser.userType === 'MOD'){
				const allUsers = await prisma.user.findMany();

				res.json(allUsers);
			}else{
				res.status(401).json("You are not allowed to pull all users!");
			}
		} catch (error) {
			res.status(400).json({
        message: "An error occured while trying to fetch all the users.",
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });
		} finally {
			await prisma.$disconnect();
		}
	}
)

/**
 * @swagger
 * /user/password:
 *  put:
 *    summary: Updates user password
 *    tags: [User]
 *    description: Reset the password of the user who is logged in and updates it
 *    parameters:
 *      - name: secret_token
 *        in: header
 *        description: an authorization header
 *        required: true
 *        type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              originalPassword:
 *                type: string
 *              newPassword:
 *                type: string
 *    responses:
 *      204:
 *        description: The user's password was succesfully updated
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                user:
 *                  $ref: '#/components/schemas/User'
 *                validPassword:
 *                  type: boolean
 * 			400:
 *        description: The user's password failed to update
*/
userRouter.put(
	'/password',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const { id } = req.user;
			const { originalPassword, newPassword } = req.body;
			const foundUser = await prisma.user.findUnique({
				where: { id }
			});

			const validPassword = await argon2ConfirmHash(originalPassword, foundUser.password);

			if (!validPassword) {
				throw new Error('The provided password is not correct');
			}

			const updatedUser = await prisma.user.update({
				where: { id },
				data: {
					password: await argon2Hash(newPassword)
				}
			});

			const parsedUser = { ...updatedUser, password: null };

			res.status(200).json({
				message: "User succesfully updated",
				user: parsedUser,
				validPassword
			});
		} catch (error) {
			res.status(400).json({
        message: `An Error occured while trying to change the password for the email ${req.user.email}.`,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });
		} finally {
			await prisma.$disconnect();
		}
	}
)




userRouter.put(
	'/update-profile',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const { id, email } = req.user;
			const {
				fname,
				lname,
				address: {
					streetAddress,
					streetAddress2,
					city,
					country,
					postalCode,
				}
			} = req.body;

			// Conditional add params to update only fields passed in
			// https://dev.to/jfet97/the-shortest-way-to-conditional-insert-properties-into-an-object-literal-4ag7
			const updateData = {
				...fname && { fname },
				...lname && { lname },
			}

			const updateAddressData = {
				...streetAddress && { streetAddress },
				...streetAddress2 && { streetAddress2 },
				...city && { city },
				...country && { country },
				...postalCode && { postalCode },
			}

			const updatedUser = await prisma.user.update({
				where: { id:id },
				data: {
					...updateData,
					address: {
						update: updateAddressData
					}
				}
			});

			const parsedUser = { ...updatedUser, password: null };

			res.status(200).json({
				message: "User succesfully updated",
				user: parsedUser,
			});
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
				details: {
					errorMessage: error.message,
					errorStack: error.stack,
				}
			});
		} finally {
			await prisma.$disconnect();
		}
	}
);

userRouter.put(
	'/admin-update-profile',
	passport.authenticate('jwt', { session: false }),
	async(req,res) => {
		try{
			const {id , email} = req.user;

			const theUser = await prisma.user.findUnique({where:{id:id}});

			const userTypes = ['ADMIN',
				'MOD',
				'SEG_ADMIN',
				'SEG_MOD',
				'MUNICIPAL_SEG_ADMIN',
				'BUSINESS',
				'RESIDENTIAL',
				'MUNICIPAL',
				'WORKER',
				'ASSOCIATE',
				'DEVELOPER'
			];

			if(theUser.userType==='ADMIN'){
				console.log(req.body.banned);

				const {
					id,
					email,
					fname,
					lname,
					userType,
					// address: {
					// 	streetAddress,
					// 	streetAddress2,
					// 	city,
					// 	country,
					// 	postalCode,
					// },
					banned
				} = req.body;

				if(!id){
					return res.status(400).json("User id is missing!");
				}
				const targetUser = await prisma.user.findUnique({where:{id:id}});

				if(!targetUser){
					return res.status(404).json({
						message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
						details: {
							errorMessage: "User can't be find by user id provided in the request body.",
							errorStack: "User can't be find by user id provided in the request body."
						}
					});
				}

				if(userType && !userTypes.includes(userType)){
					return res.status(400).json({
						message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
						details: {
							errorMessage: "User type must be predfined value",
							errorStack: "User type must be predfined value"
						}
					});
				}

				/* const updateAddressData = {
				 	...streetAddress && { streetAddress },
				 	...streetAddress2 && { streetAddress2 },
				 	...city && { city },
				 	...country && { country },
				 	...postalCode && { postalCode },
				} */

				const updatedUser = await prisma.user.update({
					where: { id : id },
					data: {
						email:email,
						fname:fname,
						lname:lname,
						userType:userType,
						banned:banned
					}
				});

				const parsedUser = { ...updatedUser, password: null };

				res.status(200).json({
					message: "User succesfully updated",
					user: parsedUser,
				});

			}else{
				return res.status(403).json({
                    message: "You don't have the right to use this endpoint!",
                    details: {
                      errorMessage: 'In order to use this endpoint, you must be an admin.',
                      errorStack: 'user must be an admin if they want to use this endpoint.',
                    }
                });
			}
		}catch(error){
			console.log(error);
			res.status(400).json({
				message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
				details: {
					errorMessage: error.message,
					errorStack: error.stack,
				}
			});
		}finally{
			await prisma.$disconnect();
		}
	}
)
userRouter.put(
	'/mod-update-profile',
	passport.authenticate('jwt', { session: false }),
	async(req,res) => {
		try{
			const {id , email} = req.user;

			const theUser = await prisma.user.findUnique({where:{id:id}});

			const userTypes = ['ADMIN',
				'MOD',
				'SEG_ADMIN',
				'SEG_MOD',
				'MUNICIPAL_SEG_ADMIN',
				'BUSINESS',
				'RESIDENTIAL',
				'MUNICIPAL',
				'WORKER',
				'ASSOCIATE',
				'DEVELOPER'
			];

			if(theUser.userType==='MOD'){
				console.log(req.body.banned);

				const {
					id,
					email,
					fname,
					lname,
					userType,
					// address: {
					// 	streetAddress,
					// 	streetAddress2,
					// 	city,
					// 	country,
					// 	postalCode,
					// },
					banned,
					reviewed
				} = req.body;

				if(!id){
					return res.status(400).json("User id is missing!");
				}
				const targetUser = await prisma.user.findUnique({where:{id:id}});

				if(!targetUser){
					return res.status(404).json({
						message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
						details: {
							errorMessage: "User can't be find by user id provided in the request body.",
							errorStack: "User can't be find by user id provided in the request body."
						}
					});
				}

				if(userType && !userTypes.includes(userType)){
					return res.status(400).json({
						message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
						details: {
							errorMessage: "User type must be predfined value",
							errorStack: "User type must be predfined value"
						}
					});
				}

				/* const updateAddressData = {
				 	...streetAddress && { streetAddress },
				 	...streetAddress2 && { streetAddress2 },
				 	...city && { city },
				 	...country && { country },
				 	...postalCode && { postalCode },
				} */

				const updatedUser = await prisma.user.update({
					where: { id : id },
					data: {
						email:email,
						fname:fname,
						lname:lname,
						userType:userType,
						banned:banned,
						reviewed: reviewed
					}
				});

				const parsedUser = { ...updatedUser, password: null };

				res.status(200).json({
					message: "User succesfully updated",
					user: parsedUser,
				});

			}else{
				return res.status(403).json({
                    message: "You don't have the right to use this endpoint!",
                    details: {
                      errorMessage: 'In order to use this endpoint, you must be an moderator.',
                      errorStack: 'user must be an moderator if they want to use this endpoint.',
                    }
                });
			}
		}catch(error){
			console.log(error);
			res.status(400).json({
				message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
				details: {
					errorMessage: error.message,
					errorStack: error.stack,
				}
			});
		}finally{
			await prisma.$disconnect();
		}
	}
)

userRouter.patch(
	'/unbanUsers',
	//passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			//const { id, email } = req.user;

			const userIds= req.body.userIds;
			console.log(userIds);

			for (let i = 0; i < userIds.length; i++) {

				await prisma.user.update({
					where: { id: userIds[i] },
					data: {
						banned: false
					}
				});
			}
			res.status(200).json({
				message: "Users succesfully unbanned"
			});
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to unban users.`,
				details: {
					errorMessage: error.message,
					errorStack: error.stack,
				}
			});
		} finally {
			await prisma.$disconnect();
		}
	}
)

module.exports = userRouter;
