const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { JWT_SECRET } = require('../lib/constants');
const prisma = require('../lib/prismaClient');
const { argon2Hash, argon2ConfirmHash } = require('../lib/utilityFunctions');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const { getSegmentInfo } = require('../helpers/userSegmentHelpers');

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
        // TODO move the Admin account types to a constant
        let adminmodEmail;
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
            let adminmodEmail = `admin${randomDigits}${randomChars}@mylivingcity.org`;
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
          where: { email },
        });
        if (userExists && userExists.verified === true) {
          return done(null, false, { message: "User already exists." });
        }
        if (userExists && userExists.verified !== true) {
          // Send email verification
          sendEmailVerification(userExists);
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
          sendEmailVerification(createdUser);
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
            OR: [
              { email: email.toLowerCase() },
              { adminmodEmail: email.toLowerCase() },
            ],
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

        const adminTypes = [
          "ADMIN",
          "MOD",
          "SEG_ADMIN",
          "SEG_MOD",
          "MUNICIPAL_SEG_ADMIN",
        ];
        // Check the userType of the found user
        if (
          adminTypes.includes(foundUser.userType) &&
          foundUser.adminmodEmail !== email.toLowerCase()
        ) {
          console.log("Admin or Mod user must use adminmodEmail to login");
          return done(null, false, {
            message: `Admin or Mod user must use generated email: adminXXXX@mylivingcity.org to login!`,
          });
        }
        // const validPassword = await foundUser.validatePassword(password);
        // console.log(validPassword);
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
          sendEmailVerification(parsedUser);
          done(null, false, {
            message:
              "User is not verified. Please check your email for verification link.",
          });
        }

        if (parsedUser.status === false) {
          done(null, false, { message: "Account is deactivated. Please contact Admin for assitance" })
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

const sendEmailVerification = async(user) => {
  transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    auth: {
        user:  process.env.EMAIL,
        pass:  process.env.EMAIL_PASSWORD
    }
  });
  let token = Math.random().toString(36).substr(2, 6);
  token = token.toUpperCase();
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verifiedToken: token,
    },
  });
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  var url = process.env.APP_URL || 'http://localhost:3001';
  url += `/emailVerification/checkVerificationCode/${user.id}/${token}`;
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
  await transporter.sendMail(mailOptions);
}

