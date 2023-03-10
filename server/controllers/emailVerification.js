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

        // close the tab
        res.status(200).send(result);
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