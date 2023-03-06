const passport = require('passport');
const express = require('express');
const falseFlaggingBehavior = express.Router();
const prisma = require('../lib/prismaClient');

// Get all users from false flagging behavior table
falseFlaggingBehavior.get(
    '/getAll',
    async (req, res) => {
      try {
        const result = await prisma.false_Flagging_Behavior.findMany();
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          message: 'An error occured while trying to get all users from false flagging behavior table',
          details: {
            errorMessage: error.message,
            errorStack: error.stack,
          },
        });
      } finally {
        await prisma.$disconnect();
      }
    }
)

module.exports = falseFlaggingBehavior;