const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { JWT_SECRET } = require('../lib/constants');
const prisma = require('../lib/prismaClient');
const { argon2Hash, argon2ConfirmHash } = require('../lib/utilityFunctions');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getSegmentInfo, cleanAddress } = require('../helpers/userSegmentHelpers');
const createAppPasswordTransport = require('./appPasswordTransport');
const { verify } = require('jsonwebtoken');
const { validateUserData, verifyUserExists } = require('./authHelpers/authValidations');
const { processAdminAccount, processBusinessAccount, processResidentialAccount } = require('./authHelpers/processAccountTypes');
const createUser = require('./authHelpers/dao/user');
const ValidationError = require('../types/ValidationError');
const UserExistsError = require('../types/UserExistsError');

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
        // Validate basic user data
        const validatedData = await validateUserData(
          email,
          password,
          req.body.confirmPassword
        );

        // Check if user exists
        await verifyUserExists(validatedData.email);

        // Process account based on type
        let userData = {
          ...req.body,
          ...validatedData,
        };

        // Process different account types
        userData = await processAdminAccount(userData);
        userData = await processBusinessAccount(userData);
        userData = processResidentialAccount(userData);

        // Create user in database
        const createdUser = await createUser(userData);

        if (!createdUser.verified) {
          await sendEmailVerification(createdUser);
        }

        return done(null, createdUser);
      } catch (error) {
        if (error instanceof ValidationError || error instanceof UserExistsError) {
          return done(null, false, { message: error.message });
        }
        console.error("Signup error:", error);
        return done(error);
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
          return done(null, false, { message: 'User could not be found in Database.' })
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

const sendEmailVerification = async (user) => {
  try {

    // Generate a unique verification token for the user
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    await prisma.user.update({
      where: { id: user.id },
      data: { verifiedToken: token },
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    var url = process.env.APP_URL || 'http://localhost:3001';
    url += `/emailVerification/checkVerificationCode/${user.id}/${token}`;

    // Use App Password transport (or OAuth)
    const transport = createAppPasswordTransport();

    const mailOptions = {
      from: 'MyLivingCity Email Verification<' + process.env.EMAIL + '>', // sender address
      to: user.email, // list of receivers
      subject: "Email Verification", // Subject line
      text: "Please click the link to verify your email" + url, // plain text body
      // Html should have an element with a get request to the url
      // html: `<a href="${url}">Click here to verify your email</a>
      // email template: https://codepen.io/md-khokon/pen/bPLqzV
      html: `<!DOCTYPE html>
        <html>
        <head>
    
          <meta charset="utf-8">
          <meta http-equiv="x-ua-compatible" content="ie=edge">
          <title>Email Confirmation</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style type="text/css">
          /**
           * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
           */
          @media screen {
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 400;
              src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
            }
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 700;
              src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
            }
          }
          /**
           * Avoid browser level font resizing.
           * 1. Windows Mobile
           * 2. iOS / OSX
           */
          body,
          table,
          td,
          a {
            -ms-text-size-adjust: 100%; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
          }
          /**
           * Remove extra space added to tables and cells in Outlook.
           */
          table,
          td {
            mso-table-rspace: 0pt;
            mso-table-lspace: 0pt;
          }
          /**
           * Better fluid images in Internet Explorer.
           */
          img {
            -ms-interpolation-mode: bicubic;
          }
          /**
           * Remove blue links for iOS devices.
           */
          a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
          /**
           * Fix centering issues in Android 4.4.
           */
          div[style*="margin: 16px 0;"] {
            margin: 0 !important;
          }
          body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /**
           * Collapse table borders to avoid space between cells.
           */
          table {
            border-collapse: collapse !important;
          }
          a {
            color: #1a82e2;
          }
          img {
            height: auto;
            line-height: 100%;
            text-decoration: none;
            border: 0;
            outline: none;
          }
          </style>
    
        </head>
        <body style="background-color: #e9ecef;">
    
          <!-- start preheader -->
          <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
            MyLivingCity Email Verification.
          </div>
          <!-- end preheader -->
    
          <!-- start body -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
    
            <!-- start logo -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  <tr>
                    <td align="center" valign="top" style="padding: 36px 24px;">
                      <a href=${appUrl} target="_blank" style="display: inline-block;">
                        <img src="https://raw.githubusercontent.com/MyLivingCity/my-living-city/development/frontend/public/logo192x192.png" alt="Logo" border="0" width="48" style="display: block; width: 48px; max-width: 48px; min-width: 48px;">
                      </a>
                    </td>
                  </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end logo -->
    
            <!-- start hero -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
                    </td>
                  </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end hero -->
    
            <!-- start copy block -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
    
                  <!-- start copy -->
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                      <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with <a href=${appUrl}>MyLivingCity</a>, you can safely delete this email.</p>
                    </td>
                  </tr>
                  <!-- end copy -->
    
                  <!-- start button -->
                  <tr>
                    <td align="left" bgcolor="#ffffff">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                  <a href=${url} target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- end button -->
    
                  <!-- start copy -->
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                      <p style="margin: 0;">Thanks,<br> MyLivingCity</p>
                    </td>
                  </tr>
                  <!-- end copy -->
    
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end copy block -->
    
            <!-- start footer -->
            <tr>
              <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end footer -->
    
          </table>
          <!-- end body -->
    
        </body>
        </html>`

    };

    await transport.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email.');
  }
};

