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

// Check each entry in the false flagging behavior table
// and set flag_ban to true if flag_count is greater than
// or equal to the falseFlagThreshold

falseFlaggingBehavior.get(
    '/checkFalseFlaggingBehavior',
    async (req, res) => {
      try {
        const falseFlagThreshold = await prisma.threshhold.findUnique({
          where: {
            id: 2,
          },
        });
        console.log("falseFlagThreshold: ", falseFlagThreshold)
        const falseFlaggingBehavior = await prisma.false_Flagging_Behavior.findMany();
        falseFlaggingBehavior.forEach(async (user) => {
          if (user.flag_count >= falseFlagThreshold.number) {
            const result = await prisma.false_Flagging_Behavior.update({
              where: {
                id: user.id,
              },
              data: {
                flag_ban: true,
              },
            });
            console.log("TURTLE: ", result)
          }
        });
        res.status(200).send('checkFalseFlaggingBehavior complete');
      } catch (error) {
        res.status(400).json({
          message: 'An error occured while trying to check false flagging behavior',
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