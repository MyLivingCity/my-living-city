const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { JWT_SECRET } = require('../lib/constants');
const prisma = require('../lib/prismaClient');
const { argon2Hash, argon2ConfirmHash } = require('../lib/utilityFunctions');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

passport.use(
  'signup',
  new localStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { 
          confirmPassword, 
          //userRoleId,
        } = req.body;
        if (!email) {
          return done({ message: "You must supply an email." })
        }

        if (!password) {
          return done({ message: "You must supply a password."})
        }

        console.log("Request body create user");
        console.log(req.body);

        // hash password
        const hashedPassword = await argon2Hash(password);

        // Check if confirmPassword and password are the same
        const passwordConfirmation = password === confirmPassword;
        if (!passwordConfirmation) {
          return done({ message: "Both password and password confirmation must be the same. Please try again."})
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
          where: { email }
        })
        if (userExists) {
          return done({ message: "User with that email already exists." })
          // return done(null, false, { message: "User with that email already exists" })
        }

        // Parse body
        const geoData = { ...req.body.geo };
        const addressData = { ...req.body.address };
        const parsedMainData = { 
          ...req.body,
          //...userRoleId && { userRoleId: Number(userRoleId) }
        };
        //if (userRoleId == null) delete parsedMainData.userRoleId;
        delete parsedMainData.geo;
        delete parsedMainData.address;
        delete parsedMainData.confirmPassword;

        // Create user
        const createdUser = await prisma.user.create({
          data: {
            geo: {
              create: geoData
            },
            address: {
              create: addressData
            },
            ...parsedMainData,
            password: hashedPassword,
            email: email.toLowerCase(),
          },
          include: {
            geo: true,
            address: true,
            //userRole: true,
          }
        });
        //Check to only create Stripe account for paid accounts.
        if(parsedMainData.userType === "BUSINESS" || parsedMainData.userType === "COMMUNITY"){
          const newStripCustomer = await stripe.customers.create({
            email: createdUser.email
          });
          await prisma.userStripe.create({
            data: {
                userId: createdUser.id,
                stripeId: newStripCustomer.id,
                status: 'incomplete'
            }
          })
        }
        return done(null, createdUser);
      } catch (error) {
        // console.log("ERROR")
        console.error(error);
        done(error);
      } finally {
        await prisma.$disconnect();
      }
    }
  )
);

passport.use(
  'login',
  new localStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const foundUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          // TODO: May cause unnecessary queries to database
          include: {
            geo: true,
            address: true,
            //userRole: true,
          }
        });

        if (!foundUser) {
          console.log("User not found");
          return done(null, false, { message: `User with email ${email} could not be found!` });
        }

        // const validPassword = await foundUser.validatePassword(password);
        // console.log(validPassword);
        const validPassword = await argon2ConfirmHash(password, foundUser.password);
        if (!validPassword) {
          return done(null, false, { message: "Invalid password. Please try again."})
        }

        const parsedUser = {
          ...foundUser,
          password: null,
        }

        return done(null, parsedUser, { message: "Logged in succesfully" });
      } catch (error) {
        console.log("Error is thrown", error)
        return done(error);
      } finally {
        await prisma.$disconnect();
      }
    }
  )
)

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
  new JWTStrategy(
    {
      secretOrKey: JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromExtractors([
        ExtractJWT.fromUrlQueryParameter('x-auth-token'),
        ExtractJWT.fromHeader('x-auth-token'),
        ExtractJWT.fromAuthHeaderAsBearerToken(),
        ExtractJWT.fromAuthHeaderWithScheme('jwt'),
      ]),
    },
    async (token, done) => {
      try {
        // TODO: Shouldn't trust what the user gives you check if user with given id works
        console.log(token.user);
        
        // Check if given token user is valid
        const foundUser = await prisma.user.findUnique({
          where: { id: token.user.id }
        });

        if (!foundUser) {
          console.log('User could not be found in Database');
          return done(null, false, { message: 'User could not be found in Database.'})
        }
        
        console.log('User found in database');
        return done(null, token.user);
      } catch (error) {
        done(error);
      } finally {
        await prisma.$disconnect();
      }
    }
  )
)