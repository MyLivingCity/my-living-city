const passport = require('passport');

const express = require('express');
const ideaFlagRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { checkIdeaThresholds } = require('../lib/prismaFunctions');



ideaFlagRouter.post(
    '/create/:ideaId',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {
        console.log("req user: ", req.user);
        const { email, id: loggedInUserId } = req.user;
        const parsedIdeaId = parseInt(req.params.ideaId);

        // check if id is valid
        if (!parsedIdeaId) {
          return res.status(400).json({
            message: `A valid ideaId must be specified in the route paramater.`,
          });
        }
        const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId } });
        if (!foundIdea) {
          return res.status(400).json({
            message: `The idea with that listed ID (${ideaId}) does not exist.`,
          });
        }
        // Check if user already submitted rating under "idea"
        const userAlreadyCreatedFlag = await prisma.ideaFlag.findFirst({
          where: {
            flaggerId: loggedInUserId,
            ideaId: parsedIdeaId
            // flagReason: req.body.flagReason
          }
        });
        if (userAlreadyCreatedFlag) {
          return res.status(200).json({
            message: `You have already flagged this idea. You cannot flag an idea twice.`,
            details: {
              errorMessage: "A idea can only be flagged once."
            }
          });
        }

        const createdFlag = await prisma.ideaFlag.create({
          data: {
            flaggerId: loggedInUserId,
            ideaId: parsedIdeaId,
            flagReason: req.body.flagReason
          }
        });

        res.status(200).json({
          message: `Flag succesfully created under Idea ${parsedIdeaId}`,
          createdFlag,
        });
      } catch (error) {
        res.status(400).json({
          message: `An error occured while trying to create a rating for idea ${req.params.ideaId}.`,
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
  ideaFlagRouter.get(
    '/getAll',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {
        const {email, id} = req.user;

        const allIdeaFlags = await prisma.ideaFlag.findMany();
        res.json(allIdeaFlags);

      } catch (error) {
        res.status(400).json({
          message: "An error occured while trying to fetch all the ideaFlags.",
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
  ideaFlagRouter.put(
    '/falseFlagMany/:ideaId',
    passport.authenticate('jwt', {session: false}),
    async(req, res, next) =>{
      try{
        const {email, id} = req.user;
        const parsedIdeaId = parseInt(req.params.ideaId);
        const {isFalse} = req.body;
        if (!parsedIdeaId) {
          return res.status(400).json({
            message: `A valid ideaId must be specified in the route paramater.`,
          });
        }
        const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId } });
        if (!foundIdea) {
          return res.status(400).json({
            message: `The idea with that listed ID (${ideaId}) does not exist.`,
          });
        }
        const updateIdeaFlags = await prisma.ideaFlag.updateMany({
          where: {
            ideaId: parsedIdeaId,
          },
          data:{
            falseFlag: isFalse,
          },
        });
        res.status(200).json({
          message: `false flags succesfully updated under Idea ${parsedIdeaId}`,
          updateIdeaFlags,
        });
      }catch(error){
        res.status(400).json({
          message: "An error occured while trying to update the ideaFlags.",
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

  // Get # of flags of idea by ideaID
  ideaFlagRouter.get(
    '/getFlags/:ideaID',
    passport.authenticate('jwt', {session: false}),
    async (req, res, next) => {
      try {
        const ideaFlagsCount = await prisma.ideaFlag.count({
          where: {
            ideaId: parseInt(req.params.ideaID)
          }
        })
        res.json(ideaFlagsCount);
      } catch (error) {
        console.log(error.message);
        res.status(400).json({
          message: "An error occured while trying to fetch the count of ideaFlags.",
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

  // Check if user has a flag ban
  ideaFlagRouter.get(
    '/checkFlagBan/:userID',
    passport.authenticate('jwt', {session: false}),
    async (req, res, next) => {
      try {
        const userFlagBan = await prisma.false_Flagging_Behavior.findFirst({
          where: {
            userId: req.params.userID
          }
        })
        res.json(userFlagBan);
      } catch (error) {
        console.log(error.message);
        res.status(400).json({
          message: "An error occured while trying to fetch the count of ideaFlags.",
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
  module.exports = ideaFlagRouter;
