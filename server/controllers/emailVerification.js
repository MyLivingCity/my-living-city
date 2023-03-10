const passport = require('passport');
const express = require('express');
const emailVerificationRouter = express.Router();
const prisma = require('../lib/prismaClient');
const nodemailer = require('nodemailer');

// Check if user is verified
emailVerificationRouter.get(
  '/checkIfUserIsVerified/:userId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      console.log("MADE IT HERE WOOOOO!!!")
      const user = await prisma.user.findUnique({
        where: {
          id: req.params.userId,
        },
      });
      if (user.verified) {
        console.log('User is verified');
        res.status(200).send('User is verified');
      } else {
        console.log('User is not verified');
        console.log("user : ", user)
        transporter = nodemailer.createTransport({
          host: 'smtp-mail.outlook.com',
          port: 587,
          auth: {
              user:  process.env.EMAIL,
              pass:  process.env.EMAIL_PASSWORD
          }
        });

        console.log("Transporter: ", transporter)

        // generate random alphanumeric 6 character string
        let token = Math.random().toString(36).substr(2, 6);

        // Capitalize each letter in the token
        token = token.toUpperCase();

        // update user with token
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            verifiedToken: token,
          },
        });


        const mailOptions = {
          from: 'MyLivingCity Email Verification<' + process.env.EMAIL + '>', // sender address
          to: user.email, // list of receivers
          subject: "Email Verification", // Subject line
          text: token, // plain text body
          html: "<h1>" + token + "</h1>", // html body
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Info: ", info);


        res.send('Email sent to: ' + user.email + '!');

      }
    } catch (error) {
      res.status(400).json({
        message: 'An error occured while trying to check if user is verified',
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



module.exports = emailVerificationRouter;