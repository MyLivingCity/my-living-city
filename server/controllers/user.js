const passport = require('passport');
const express = require('express');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../lib/constants');
const { argon2ConfirmHash, argon2Hash, imagePathsToS3Url } = require('../lib/utilityFunctions');
const prisma = require('../lib/prismaClient');
const { authenticate } = require('passport');
const { checkUserCreationAuthorization } = require('../helpers/userHelpers');

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

			await imagePathsToS3Url([parsedUser], "avatar");
			res.status(200);
			res.json({ ...parsedUser });
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
	'/get/:userId',
	async (req, res, next) => {
		try {
			const foundUser = await prisma.user.findUnique({
				where: { id: req.params.userId },
				select: {
					email: true,
					fname: true,
					lname: true
				}
			});

			if (!foundUser) {
				return res.status(400).json({
					message: "User could not be found or does not exist in the database."
				})
			}

			res.status(200).json(foundUser);
		} catch (error) {
			console.log(error.message);
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
				where: { email: email }
			});

			if (!foundUser) {
				return res.status(201).json({
					message: "User could not be found or does not exist in the database."
				});
			}
			await imagePathsToS3Url([foundUser], "avatar");
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

			await imagePathsToS3Url([foundUser], "avatar");
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
userRouter.delete(
	'/:userId',
	async (req, res, next) => {
		try {
			const { userId } = req.params;

			// Check if the user exists
			const foundUser = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!foundUser) {
				return res.status(400).json({
					message: "User could not be found or does not exist in the database.",
				});
			}

			// Delete related records first
			await prisma.userAddress.deleteMany({
				where: { userId: foundUser.id },
			});

			await prisma.userGeo.deleteMany({
				where: { userId: foundUser.id },
			});

			await prisma.userSegments.deleteMany({
				where: { userId: foundUser.id },
			});

			await prisma.userReach.deleteMany({
				where: { userId: foundUser.id },
			});

			await prisma.userStripe.deleteMany({
				where: { userId: foundUser.id },
			});

			await prisma.idea.deleteMany({
				where: { authorId: foundUser.id },
			});

			await prisma.advertisements.deleteMany({
				where: { ownerId: foundUser.id },
			});

			await prisma.ideaRating.deleteMany({
				where: { authorId: foundUser.id },
			});

			await prisma.userIdeaFollow.deleteMany({
				where: { userId: foundUser.id },
			});

			// Delete the user record
			await prisma.user.delete({
				where: { id: foundUser.id },
			});

			res.status(200).json({
				message: "User deleted successfully.",
			});
		} catch (error) {
			console.log(error);
			res.status(400).json({
				message: error.message,
				details: {
					errorMessage: error.message,
					errorStack: error.stack,
				},
			});
		} finally {
			await prisma.$disconnect();
		}
	}
);

userRouter.post("/signup", 
	async (req, res, next) => 
	{
		// console.log(req.user);
		// console.log(req.body);
		// Types that don't need admin permissions to create
		const nonAdminTypes = [
			'BUSINESS',
			'RESIDENTIAL',
			'COMMUNITY',
		];
		const adminTypes = [
			'ADMIN',
			'MOD',
			'SEG_ADMIN',
			'SEG_MOD',
			'MUNICIPAL_SEG_ADMIN',
		];
		// I don't know what these types are but they are defined in the Prisma Schema
		const otherTypes = [
			'MUNICIPAL',
			'WORKER',
			'ASSOCIATE',
			'DEVELOPER',
			'IN_PROGRESS'
		]

		// Anyone can create non-verified users of these user types
		if (nonAdminTypes.includes(req.body?.userType) && !req.body?.verified) {
			console.log("Non Admin User Creation")
			createUser();
		} else {
			console.log("Admin User Creation")
			// Check user has permissions to create a user of this type.
			// Start by retrieving the user from the JWT
			passport.authenticate("jwt", { session: false }, async (err, user, info) => {
				console.log("JWT return values", err, user, info);
				if (err) {
					res.status(500).json(err);
					return;
				}
				if (!user) {
					res.status(401).json({message: info?.message || "User not found"});
					return;
				}

				// TODO: Check if the user has permissions to create a user of this type
				const canCreateUser = checkUserCreationAuthorization(req.body, user);
				await createUser();
				// Use the user to check if they have permissions to create a user of this type
				// console.log("UserOutside", user);
				// res.status(201).json({
				// 	user: user,
				// });
				return;
			})(req, res, next);
		}

		function createUser() {
			passport.authenticate("signup", async (err, user, info) => {
				if (err) {
					console.log("Should be error stopping it", err.message)
					res.status(500).json({error: err.message});
					return;
				}
				if (!user) {
					res.status(401).json(info);
					return;
				}

				// Give valid token upon signup
				const tokenBody = {
					id: user.id,
					email: user.email,
				};
				const token = jwt.sign({ user: tokenBody }, JWT_SECRET, {
					expiresIn: JWT_EXPIRY,
				});
				res.status(201).json({
					user: user,
					token: token,
				});
			})(req, res, next);
		}
	}
);

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
userRouter.post("/login", async (req, res, next) => {
	passport.authenticate("login", async (err, user, info) => {
		try {
			if (err) {
				res.status(400);
				return res.json({
					error: err,
					message: "An Error occured.",
				});
			}

			if (!user) {
				res.status(400);
				return res.json({
					message: info.message,
				});
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error);

				const tokenBody = { id: user.id, email: user.email };
				const token = jwt.sign({ user: tokenBody }, JWT_SECRET, {
					expiresIn: JWT_EXPIRY,
				});

				const parsedUser = {
					...user,
					password: null,
				};

				return res.status(200).json({
					user: parsedUser,
					token,
				});
			});
		} catch (error) {
			res.status(400).json({
				message: "An error occured while trying to login a user.",
				details: {
					errorMessage: error.message,
					errorStack: error.stack,
				},
			});
		}
	})(req, res, next);
});

userRouter.post(
	'/reset-password',
	async (req, res, next) => {
		try {
			console.log(req.query);
			const paramPassCode = req.query.passCode;
			const { email, password, confirmPassword } = req.body;
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
			const { email, id } = req.user;

			const theUser = await prisma.user.findUnique(
				{
					where: { id: id }
				}
			);

			if (theUser.userType === 'ADMIN' || theUser.userType === 'MOD' || theUser.userType === 'MUNICIPAL_SEG_ADMIN') {
				const allUsers = await prisma.user.findMany({
					include: {
						userSegments: true,
					}
				}
				);

				res.json(allUsers);
			} else {
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
	'/:userId/password',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const { userId } = req.params;
			const { newPassword } = req.body;
			const foundUser = await prisma.user.findUnique({
				where: { id: userId }
			});

			if (!foundUser) {
				throw new Error('User not found');
			}
			
			// Check if the user has permissions to change the password of the user 
			// Rights are same as creating a user
			const hasPermission = checkUserCreationAuthorization(foundUser, req.user);
			if (!hasPermission) {
				return res.status(403).json({
					message: "You don't have the right to perform this action!",
				});
			};

			// Update the user's password without verifying the current password
			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: {
					password: await argon2Hash(newPassword)
				}
			});

			delete updatedUser.password;
			delete updatedUser.passCode;

			res.status(200).json({
				message: "User password successfully updated",
				user: updatedUser,
			});
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to change the password for the user with ID ${userId}.`,
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
				where: { id: id },
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
	async (req, res) => {
		try {
			const { id, email } = req.user;

			const theUser = await prisma.user.findUnique({ where: { id: id } });

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

			if (theUser.userType === 'ADMIN') {
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
					reviewed,
					verified,
					status
				} = req.body;

				if (!id) {
					return res.status(400).json("User id is missing!");
				}
				const targetUser = await prisma.user.findUnique({ where: { id: id } });

				if (!targetUser) {
					return res.status(404).json({
						message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
						details: {
							errorMessage: "User can't be find by user id provided in the request body.",
							errorStack: "User can't be find by user id provided in the request body."
						}
					});
				}

				if (userType && !userTypes.includes(userType)) {
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
					where: { id: id },
					data: {
						email: email,
						fname: fname,
						lname: lname,
						userType: userType,
						banned: banned,
						reviewed: reviewed,
						verified: verified,
						status: status
					}
				});

				const parsedUser = { ...updatedUser, password: null };

				res.status(200).json({
					message: "User succesfully updated",
					user: parsedUser,
				});

			} else {
				return res.status(403).json({
					message: "You don't have the right to use this endpoint!",
					details: {
						errorMessage: 'In order to use this endpoint, you must be an admin.',
						errorStack: 'user must be an admin if they want to use this endpoint.',
					}
				});
			}
		} catch (error) {
			console.log(error);
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
)
userRouter.put(
	'/mod-update-profile',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		try {
			const { id, email } = req.user;

			const theUser = await prisma.user.findUnique({ where: { id: id } });

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
				'DEVELOPER',
				'COMMUNITY'
			];

			if (theUser.userType === 'MOD') {
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

				if (!id) {
					return res.status(400).json("User id is missing!");
				}
				const targetUser = await prisma.user.findUnique({ where: { id: id } });

				if (!targetUser) {
					return res.status(404).json({
						message: `An Error occured while trying to update the profile for the email ${req.user.email}.`,
						details: {
							errorMessage: "User can't be find by user id provided in the request body.",
							errorStack: "User can't be find by user id provided in the request body."
						}
					});
				}

				if (userType && !userTypes.includes(userType)) {
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
					where: { id: id },
					data: {
						email: email,
						fname: fname,
						lname: lname,
						userType: userType,
						banned: banned,
						reviewed: reviewed
					}
				});

				const parsedUser = { ...updatedUser, password: null };

				res.status(200).json({
					message: "User succesfully updated",
					user: parsedUser,
				});

			} else {
				return res.status(403).json({
					message: "You don't have the right to use this endpoint!",
					details: {
						errorMessage: 'In order to use this endpoint, you must be an moderator.',
						errorStack: 'user must be an moderator if they want to use this endpoint.',
					}
				});
			}
		} catch (error) {
			console.log(error);
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
)

userRouter.patch(
	'/unbanUsers',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const { id } = req.user;

			const theUser = await prisma.user.findUnique({ where: { id: id } });

			if (!(theUser.userType === 'ADMIN' || theUser.userType === 'MOD')) {
				return res.status(401).json("You are not allowed to unban users!");
			}

			const userIds = req.body.userIds;
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

userRouter.patch(
	'/unbanMe',
	passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
		try {
			const { id } = req.user;

			console.log("user id is ", id);

			const theUser = await prisma.user.findUnique({ where: { id: id } });

			if (!(theUser.banned)) {
				return res.status(200).json("You're not banned");
			}

			const ban = await prisma.userBan.findMany({
				where: { userId: id },
				orderBy: { id: "desc" },
				distinct: ['userId'],
			});
			const isExpired = ban.banUntil <= new Date(Date.now());
			if (isExpired) {
				await prisma.user.update({
					where: { id: id },
					data: {
						banned: false
					}
				});
				await prisma.ban.delete({
					where: { userId: id }
				});
				return res.status(200).json({
					message: "You are succesfully unbanned"
				});
			} else {
				return res.status(200).json({
					message: "Your ban is still ongoing"
				});
			}
		} catch (error) {
			console.log(error);
			res.status(400).json({
				message: `An Error occured while trying to unban.`,
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

userRouter.get(
	'/getBannedUserHistory',
	async (req, res, next) => {
		try {
			const banHistory = await prisma.ban_History.findMany({
				where: { userId: req.query.userId },
				orderBy: { id: "asc" },
			});
			res.status(200).json(banHistory);
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to retrieve ban history.`,
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

userRouter.get(
	'/getBannedUsers',
	async (req, res, next) => {
		try {

			const bannedUsers = await prisma.userBan.findMany();

			for (let i = 0; i < bannedUsers.length; i++) {
				const user = await prisma.user.findUnique({
					where: { id: bannedUsers[i].userId },
				});
				bannedUsers[i].email = user.email;
				bannedUsers[i].firstName = user.fname;
				bannedUsers[i].lastName = user.lname;
				bannedUsers[i].userType = user.userType;
				bannedUsers[i].banUntil = bannedUsers[i].banUntil.toISOString();
				bannedUsers[i].createdAt = bannedUsers[i].createdAt.toISOString();
			}

			res.status(200).json(bannedUsers);
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to retrieve banned users.`,
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

userRouter.patch(
	'/removeFlagQuarantine',
	async (req, res, next) => {
		try {

			// set flag_ban to false
			// set flag_count to 0
			// set bannedAt to null
			// set bannedUntil to null


			await prisma.false_Flagging_Behavior.findFirst({
				where: { userId: req.body.userId },
				orderBy: { id: "desc" },
			}).then(async (flag) => {
				if (flag) {
					console.log("Flag found", flag)
					await prisma.false_Flagging_Behavior.update({
						where: { id: flag.id },
						data: {
							flag_ban: false,
							flag_count: 0,
							bannedAt: null,
							bannedUntil: null,
						}
					});

					// for each table containing flags (idea_flag and comment_flag)
					// delete all flags where userId = req.body.userId && false_flag = true
					await prisma.ideaFlag.deleteMany({
						where: {
							flaggerId: req.body.userId,
							falseFlag: true,
						}
					});

					await prisma.commentFlag.deleteMany({
						where: {
							flaggerId: req.body.userId,
							falseFlag: true,
						}
					});

				}
			});



			res.status(200).json({
				message: "Flags successfully removed"
			});
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to remove flags.`,
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

userRouter.patch(
	'/removePostCommentQuarantine',
	async (req, res, next) => {
		try {
			// set bad_post_count to 0
			// set post_flag_count to 0
			// set post_comment_ban to false
			// set bannedAt to null
			// set bannedUntil to null

			await prisma.bad_Posting_Behavior.findFirst({
				where: { userId: req.body.userId },
				orderBy: { id: "desc" },
			}).then(async (post) => {
				if (post) {
					console.log("Post found", post)
					await prisma.bad_Posting_Behavior.update({
						where: { id: post.id },
						data: {
							bad_post_count: 0,
							post_flag_count: 0,
							post_comment_ban: false,
							bannedAt: null,
							bannedUntil: null,
						}
					});
				}
			});

			res.status(200).json({
				message: "Post Comment Quarantine successfully removed"
			});
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to remove post comment quarantine.`,
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

userRouter.patch(
	'/updateDisplayName/:id',
	async (req, res, next) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: req.params.id },
			});

			if (user) {
				await prisma.user.update({
					where: { id: user.id },
					data: {
						displayFName: req.body.displayFName,
						displayLName: req.body.displayLName,
					}
				});
			}
			const userDetails = await prisma.userSegments.update({
				where: {
					userId: user.id,
				},
				data: {
					homeSegHandle: req.body.displayFName + "@" + req.body.displayLName,
				},
			})

			res.status(200).json({
				message: "Display name successfully updated"
			});
		} catch (error) {
			console.log(error)
			res.status(400).json({
				message: `An Error occured while trying to update display name.`,
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

userRouter.patch(
	'/updateAddress/:id',
	async (req, res, next) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: req.params.id },
			});

			const now = new Date();

			if (user) {
				await prisma.userAddress.update({
					where: { userId: req.params.id },
					data: {
						streetAddress: req.body.streetAddress,
						postalCode: req.body.postalCode,
						updatedAt: now,
					}
				});
			}

			res.status(200).json({
				message: "Address successfully updated"
			});
		} catch (error) {
			res.status(400).json({
				message: `An Error occured while trying to update address.`,
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

userRouter.patch(
	'/updateCityNeighbourhood/:id',
	async (req, res, next) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: req.params.id },
			});

			// get the id of the city from the segment table
			// ignore case
			const city = await prisma.segments.findFirst({
				where: { name: { equals: req.body.city, mode: "insensitive" } },
			});

			console.log("city", city)
			// get the id of the neighbourhood from the subsegment table
			// ignore case
			const neighbourhood = await prisma.subSegments.findFirst({
				where: { name: { equals: req.body.neighbourhood, mode: "insensitive" } },
			});

			console.log("neighbourhood", neighbourhood)

			// if all three are found, update the user's city and neighbourhood
			// in the UserSegment table
			if (user && city && neighbourhood) {
				const res = await prisma.userSegments.update({
					where: { userId: req.params.id },
					data: {
						homeSegmentId: city.id,
						homeSubSegmentId: neighbourhood.id,
						homeSegmentName: req.body.city,
						homeSubSegmentName: req.body.neighbourhood,
					}
				});
			} else {
				console.log("Error: user, city, or neighbourhood not found")
				res.status(400).json({
					message: `Error: user, city, or neighbourhood not found`,
				});
				return;
			}

			res.status(200).json({
				message: "City and neighbourhood successfully updated"
			});
		} catch (error) {
			console.log(error)
			res.status(400).json({
				message: `An Error occured while trying to update city and neighbourhood.`,
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





userRouter.get(
	'/getGeoData/:id',
	async (req, res, next) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: req.params.id },
			});

			if (user) {
				const geoData = await prisma.userGeo.findUnique({
					where: { userId: req.params.id },
					select: {
						lat: true,
						lon: true,
						school_lat: true,
						school_lon: true,
						work_lat: true,
						work_lon: true,
					}
				});

				console.log("getGeoData")
				console.log(geoData)
				res.status(200).json(geoData);
			}
		} catch (error) {
			console.log(error)
			res.status(400).json({
				message: `An Error occured while trying to retrieve geo data.`,
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
