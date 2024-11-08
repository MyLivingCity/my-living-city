  const passport = require('passport');
  const localStrategy = require('passport-local').Strategy;
  const { JWT_SECRET } = require('../lib/constants');
  const prisma = require('../lib/prismaClient');
  const { argon2Hash, argon2ConfirmHash } = require('../lib/utilityFunctions');
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const nodemailer = require('nodemailer');
  const { getSegmentInfo } = require('../helpers/userSegmentHelpers');
  const { google } = require('googleapis');
  const OAuth2 = google.auth.OAuth2;

  passport.use(
    "signup",
    new localStrategy.Strategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          // --------------------------------------------
          // Verify User data
          // --------------------------------------------
          if (!email) {
            return done({ message: "You must supply an email." });
          }

          if (!password) {
            return done({ message: "You must supply a password." });
          }

          const parsedMainData = {
            ...req.body,
            email: email.toLowerCase(),
          };
          
          // hash password
          const hashedPassword = await argon2Hash(password);

          // Check if confirmPassword and password are the same
          const { confirmPassword } = req.body;
          const passwordConfirmation = password === confirmPassword;
          if (!passwordConfirmation) {
            return done({
              message:
                "Both password and password confirmation must be the same. Please try again.",
            });
          }

          // --------------------------------------------
          // ADMIN ACCOUNTS ONLY SECTION
          // --------------------------------------------
          // If admin use the generated email
          // TODO move the Admin account types to a constant shared accross the app
          if (
            [
              "SUPER_ADMIN",
              "ADMIN",
              "MOD",
              "SEG_ADMIN",
              "SEG_MOD",
              "MUNICIPAL_SEG_ADMIN",
            ].includes(parsedMainData.userType)
          ) {
            // Need to ensure that the generated adminmodEmail is unique
            let uniqueEmailGenerated = false;
            while (!uniqueEmailGenerated) {
              const randomDigits = Math.floor(Math.random() * 100).toString().padStart(2, "0");
              const randomChars = Math.random().toString(36).substring(2, 4).toLowerCase();
              let adminmodEmail = `${parsedMainData.userType}${randomDigits}${randomChars}@mylivingcity.org`.toLowerCase();
              const adminmodUser = await prisma.user.findFirst({
                where: { email: adminmodEmail },
              });
              if (!adminmodUser) {
                uniqueEmailGenerated = true;
                parsedMainData.adminmodEmail = parsedMainData.email.toLowerCase();
                parsedMainData.email = adminmodEmail;
              }
            }
          }
          // --------------------------------------------
          // END ADMIN ACCOUNTS ONLY SECTION

          // Check if user exists
          const userExists = await prisma.user.findUnique({
            where: { email: parsedMainData.email },
          });
          if (userExists && userExists.verified === true) {
            return done(null, false, { message: "User already exists." });
          }
          if (userExists && userExists.verified !== true) {
            // Send email verification
            sendEmailVerification(userExists)
            .then((result) => console.log("Email sent...", result))
            .catch((error) => console.log(error.message));
            
            return done(null, false, { message: "User already exists. Please check your email for verification link."});
          }
          // --------------------------------------------
          // END Verify User data

          // Validate address data
          const addressData = { ...req.body.address };

          // Validate geo data
          const geoData = { ...req.body.geo };
          
          // Need to get the rest of segment data to fill in the userSegments table
          const userSegmentData = await getSegmentInfo(req.body?.userSegment, req.body?.fname,  req.body?.address?.streetAddress, req.body?.Work_Details?.company, req.body?.School_Details?.faculty);

          // Validate segment request data
          const segmentRequest = (req.body?.segmentRequest || []).filter(newSegment => newSegment);

          // --------------------------------------------
          // COMMUNITY AND BUSINESS ACCOUNTS ONLY SECTION
          // --------------------------------------------
          const userReachRequest = [];
          let stripeAccount = null;
          if (parsedMainData.userType === "BUSINESS" || parsedMainData.userType === "COMMUNITY") 
          {
            // create stripe account
            const newStripCustomer = await stripe.customers.create({
              email: email.toLowerCase(),
            });
            stripeAccount = { stripeId: newStripCustomer.id, status: "incomplete"};
            // and Validate user reach segment data
            if (parsedMainData.userReach && parsedMainData.userReach.length > 0) {
              const theSegments = await prisma.segments.findMany({
                where: {
                    segId: {
                        in: parsedMainData.userReach
                    }
                }
              });
              for (let segId of parsedMainData.userReach) {
                if (!theSegments.some(segment => segment.segId === segId)) {
                  return done(null, false, {
                    message: `The Segment with id ${segId} cannot be found!`
                  });
                } else {
                  userReachRequest.push({segId: segId});
                }
              }
            }
          }
          // --------------------------------------------
          // END COMMUNITY AND BUSINESS ACCOUNTS ONLY SECTION 

          // --------------------------------------------
          // RESIDENTIAL ACCOUNTS ONLY SECTION
          // --------------------------------------------
          let School_Details = req.body?.schoolDetails
          let Work_Details = req.body?.workDetails
          if (parsedMainData.userType === "RESIDENTIAL") {
            if (!School_Details) {School_Details = {};}
            if (!Work_Details) {Work_Details = {};}
          }
          if (School_Details && School_Details.programCompletionDate) {
            School_Details.programCompletionDate = new Date(School_Details.programCompletionDate);
            if (isNaN(School_Details.programCompletionDate)) {
              return done(null, false, {
                message: "Invalid date for program completion date."
              });
            }
          } else {
            School_Details.programCompletionDate = null;
          }
          // --------------------------------------------
          // END RESIDENTIAL ACCOUNTS ONLY SECTION

          // Remove unnecessary data
          delete parsedMainData.geo;
          delete parsedMainData.address;
          delete parsedMainData.confirmPassword;
          delete parsedMainData.reachSegmentIds;
          delete parsedMainData.userSegment;
          delete parsedMainData.segmentRequest;
          delete parsedMainData.userReach;
          delete parsedMainData.schoolDetails;
          delete parsedMainData.workDetails;

          // Create user
          const createdUser = await prisma.user.create({
            data: {
              geo: {
                create: geoData,
              },
              address: {
                create: addressData,
              },
              userSegments: {
                create: userSegmentData,
              },
              segmentRequest: {
                create: segmentRequest,
              },
              userReach: {
                create: userReachRequest,
              },
              School_Details: {
                create: School_Details,
              },
              Work_Details: {
                create: Work_Details,
              },
              ...(stripeAccount && { stripe: { create: stripeAccount } }),
              ...parsedMainData,
              password: hashedPassword,
            },
            include: {
              geo: true,
              address: true,
              userSegments: true,
              stripe: true,
              segmentRequest: true,
              userReach: true,
              School_Details: true,
              Work_Details: true,
            },
          });

          // Delete password fields of returned user
          delete createdUser.password;
          delete createdUser.passCode;

          if (createdUser.verified === false) {
            sendEmailVerification(createdUser)
            .then((result) => console.log("Email sent...", result))
            .catch((error) => console.log(error.message));
          }
          return done(null, createdUser);
        } catch (error) {
          console.error("signup error", error);
          done(error);
        } finally {
          await prisma.$disconnect();
        }
      }
    )
  );

  passport.use(
    "login",
    new localStrategy.Strategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (_req, email, password, done) => {
        try {
          const foundUser = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
            },
            // TODO: May cause unnecessary queries to database
            include: {
              geo: true,
              address: true,
              //userRole: true,
            },
          });

          if (!foundUser) {
            console.log("User not found");
            return done(null, false, {
              message: `User with email ${email} could not be found!`,
            });
          }

          const validPassword = await argon2ConfirmHash(
            password,
            foundUser.password
          );
          if (!validPassword) {
            return done(null, false, {
              message: "Invalid password. Please try again.",
            });
          }

          const parsedUser = {
            ...foundUser,
            password: null,
          };

          if (parsedUser.verified === false) {
            await sendEmailVerification(parsedUser)
            .then((result) => console.log("Email sent...", result))
            .catch((error) => console.log(error.message));
            return done(null, false, {
              message:
                "User is not verified. Please check your email for verification link.",
            });
          }

          if (parsedUser.status === false) {
            return done(null, false, { message: "Account is deactivated. Please contact Admin for assitance" })
          }

          return done(null, parsedUser, { message: "Logged in succesfully" });
        } catch (error) {
          console.log("Error is thrown", error);
          return done(error);
        } finally {
          await prisma.$disconnect();
        }
      }
    )
  );

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
          // console.log("token user", token.user);

          if (!token?.user || !token?.user.id) {
            // console.log("Invalid token: User ID is not present");
            return done(null, false, {
              message: "Invalid token: User ID is not present.",
            });
          }

          // Check if given token user is valid
          const foundUser = await prisma.user.findUnique({
            where: { id: token.user.id }
          });

          if (!foundUser) {
            // console.log('User could not be found in Database');
            return done(null, false, { message: 'User could not be found in Database.'})
          }
          
          // console.log('User found in database', foundUser);
          // console.log("User token info", token.user);
          return done(null, foundUser);
        } catch (error) {
          // console.log('Error is thrown', error);
          done(error);
        } finally {
          await prisma.$disconnect();
        }
      }
    )
  )

  // const sendEmailVerification = async (user) => {
  //   // Set up OAuth2 client with credentials from environment variables
  //   const oauth2Client = new OAuth2(
  //     process.env.GOOGLE_CLIENT_ID,
  //     process.env.GOOGLE_CLIENT_SECRET,
  //     "http://localhost:3000/auth/callback"
  //   );

  //   oauth2Client.setCredentials({
  //     refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  //   });

  //   // Get a fresh access token
  //   const accessToken = await oauth2Client.getAccessToken();

  //   if (accessToken.token) {
  //     console.log("Access Token successfully generated:", accessToken.token);
  //   } else {
  //     console.error("Failed to generate Access Token:", accessToken);
  //   }

  //   // Configure Nodemailer with OAuth2 for Gmail
  //   const transporter = nodemailer.createTransport({
  //     service: 'gmail',
  //     auth: {
  //       type: 'OAuth2',
  //       user: process.env.EMAIL,
  //       clientId: process.env.GOOGLE_CLIENT_ID,
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //       refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  //       accessToken: accessToken.token,  // Ensure the token is used here
  //     },
  //   });

  //   // Generate a unique verification token for the user
  //   let token = Math.random().toString(36).substring(2, 8).toUpperCase();
  //   await prisma.user.update({
  //     where: { id: user.id },
  //     data: { verifiedToken: token },
  //   });

  //   // Create the verification link
  //   const appUrl = process.env.APP_URL || 'http://localhost:3000';
  //   const url = `${appUrl}/emailVerification/checkVerificationCode/${user.id}/${token}`;

  //   const mailOptions = {
  //     from: `MyLivingCity Email Verification <${process.env.EMAIL}>`,
  //     to: user.email,
  //     subject: "Email Verification",
  //     text: `Please click the link to verify your email: ${url}`,
  //     html: `<p>Tap the button below to confirm your email address. If you didn't create an account with <a href="${appUrl}">MyLivingCity</a>, you can safely delete this email.</p>
  //           <p><a href="${url}" style="display: inline-block; padding: 16px 36px; background-color: #1a82e2; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a></p>`
  //   };

  //   // Send email and handle errors
  //   try {
  //     await transporter.sendMail(mailOptions);
  //     console.log("Verification email sent successfully!");
  //   } catch (error) {
  //     console.error("Error sending verification email:", error);
  //   }
  // };


  const sendEmailVerification = async (user) => {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );

    oAuth2Client.setCredentials({refresh_token: process.env.GOOGLE_REFRESH_TOKEN});

    try {
      const accessToken = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.EMAIL,
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
              accessToken: accessToken.token,
            },
      });

      console.log(user.email);

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      var url = process.env.APP_URL || 'http://localhost:3001';

      const mailOptions = {
            from: `MyLivingCity Email Verification <${process.env.EMAIL}>`,
            to: user.email,
            subject: "Email Verification",
            text: `Please click the link to verify your email: ${url}`,
            html: `<p>Tap the button below to confirm your email address. If you didn't create an account with <a href="${appUrl}">MyLivingCity</a>, you can safely delete this email.</p>
                  <p><a href="${url}" style="display: inline-block; padding: 16px 36px; background-color: #1a82e2; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a></p>`
      };

      const result = transport.sendMail(mailOptions);
      return result;
          
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  
  }

