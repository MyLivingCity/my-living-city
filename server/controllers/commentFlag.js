const passport = require('passport');

const express = require('express');
const commentFlagRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { checkIdeaThresholds } = require('../lib/prismaFunctions');



commentFlagRouter.post(
    '/create/:commentId',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {
        const { email, id: loggedInUserId } = req.user;
        const parsedCommentId = parseInt(req.params.commentId);
  
        // check if id is valid
        if (!parsedCommentId) {
          return res.status(400).json({
            message: `A valid commentId must be specified in the route paramater.`,
          });
        }
        const foundIdeaComment = await prisma.ideaComment.findUnique({ where: { id: parsedCommentId } });
        if (!foundIdeaComment) {
          return res.status(400).json({
            message: `The comment with that listed ID (${parsedCommentId.toString()}) does not exist.`,
          });
        }
        // Check if user already submitted rating under "idea"
        const userAlreadyCreatedFlag = await prisma.commentFlag.findFirst({
          where: {
            flaggerId: loggedInUserId,
            commentId: parsedCommentId,
          }
        });
        if (userAlreadyCreatedFlag) {
          return res.status(400).json({
            message: `You have already flagged this comment. You cannot flag a comment twice.`,
            details: {
              errorMessage: "A idea can only be flagged once."
            }
          });
        }
  
        const createdFlag = await prisma.commentFlag.create({
          data: {
            flaggerId: loggedInUserId,
            commentId: parsedCommentId,
            flagReason: req.body.flagReason
          }
        });
  
        res.status(200).json({
          message: `Flag succesfully created under Idea ${parsedCommentId}`,
          createdFlag,
        });
      } catch (error) {
        res.status(400).json({
          message: `An error occured while trying to create a rating for idea ${req.params.commentId}.`,
          details: {
            errorMessage: error.message,
            errorStack: error.stack,
          }
        });
      } finally {
        await prisma.$disconnect();
      }
    }
  );
  commentFlagRouter.get(
    '/getAll',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {
        const {email, id} = req.user;
  
        const allCommentFlags = await prisma.commentFlag.findMany();
        res.json(allCommentFlags);

      } catch (error) {
        res.status(400).json({
          message: "An error occured while trying to fetch all the comment flags.",
          details: {
            errorMessage: error.message,
            errorStack: error.stack,
          }
        });
      } finally {
        await prisma.$disconnect();
      }
    }
  );
  commentFlagRouter.put(
    '/falseFlagMany/:commentId',
    passport.authenticate('jwt', {session: false}),
    async(req, res, next) =>{
      try{
        const {email, id} = req.user;
        const parsedCommentId = parseInt(req.params.commentId);
        const {isFalse} = req.body;
        if (!parsedCommentId) {
          return res.status(400).json({
            message: `A valid ideaId must be specified in the route paramater.`,
          });
        }
        const foundComment = await prisma.ideaComment.findUnique({ where: { id: parsedCommentId } });
        if (!foundComment) {
          return res.status(400).json({
            message: `The comment with that listed ID (${parsedCommentId.toString()}) does not exist.`,
          });
        }
        const updateIdeaCommentFlags = await prisma.commentFlag.updateMany({
          where: {
            commentId: parsedCommentId,
          },
          data:{
            falseFlag: isFalse,
          },
        });

        // Check if user is in the false flagging behavior table
        // if they are increment the false flag count
        // else create a new entry in the table

        const foundFalseFlagBehavior = await prisma.false_Flagging_Behavior.findFirst({
          where: {
            userId: id,
          }
        });
        if(foundFalseFlagBehavior){
          const updatedFalseFlagBehavior = await prisma.false_Flagging_Behavior.update({
            where: {
              id: foundFalseFlagBehavior.id,
            },
            data: {
              flag_count: foundFalseFlagBehavior.flag_count + 1,
            }
          });
          console.log("updated false flag behavior: ", updatedFalseFlagBehavior);
        }else{
          const createdFalseFlagBehavior = await prisma.false_Flagging_Behavior.create({
            data: {
              userId: id,
              flag_count: 1,
            }
          });
          console.log("created false flag behavior: ", createdFalseFlagBehavior);
        }


        res.status(200).json({
          message: `false flags succesfully updated under comment: ${parsedCommentId}`,
          updateIdeaFlags: updateIdeaCommentFlags,
        });
      }catch(error){
        res.status(400).json({
          message: "An error occured while trying to update the commentFlags.",
          details: {
            errorMessage: error.message,
            errorStack: error.stack,
          }
        });
      } finally {
        await prisma.$disconnect();
      }
    }
  );

  // Get # of flags of comment by commentId
  commentFlagRouter.get(
    '/getFlags/:commentId',
    passport.authenticate('jwt', {session: false}),
    async (req, res, next) => {
      try {
        const commentFlagsCount = await prisma.commentFlag.count({
          where: {
            commentId: parseInt(req.params.commentId)
          }
        })
        res.json(commentFlagsCount);
      } catch (error) {
        console.log(error.message);
        res.status(400).json({
          message: "An error occured while trying to fetch the count of commentFlags.",
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
  module.exports = commentFlagRouter;