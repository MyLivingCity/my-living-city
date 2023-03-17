const express = require('express');
const emailVerificationRouter = express.Router();
const prisma = require('../lib/prismaClient');

// Check if user is verified
emailVerificationRouter.get(
  '/checkVerificationCode/:userId/:verificationCode',
  async (req, res) => {
    try {
      const { userId, verificationCode } = req.params;
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (user.verifiedToken === verificationCode) {
        const result = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            verified: true,
          },
        });

        // Send back to login page either localhost or production
        var login = process.env.CORS_ORIGIN + '/login' || 'http://localhost:3000/login';

        // redirect to login with a message that the user is verified
        res.redirect(login);

      } else {
        res.status(400).json({
          message: 'Verification code does not match',
        });
      }
    } catch (error) {
      res.status(400).json({
        message: 'An error occured while trying to check verification code',
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