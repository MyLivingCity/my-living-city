const passport = require('passport');
const { PrismaClient } = require('@prisma/client')

const express = require('express');
const interactRouter = express.Router();
const prisma = require('../lib/prismaClient');

const likeCommentAndRemoveDislike = async (userId, commentId) => {
  try {
  const prismaWhereClause = {
    where: {
      authorId: userId,
      ideaCommentId: commentId,
    }
  }

  const foundLike = await prisma.userCommentLikes.findFirst(prismaWhereClause);
  const foundDislike = await prisma.userCommentDislikes.findFirst(prismaWhereClause)

  if (foundDislike) {
    // await prisma.userCommentDislikes.delete({ where: { id: foundDislike.id }});
    await prisma.userCommentDislikes.deleteMany({ where: {
      authorId: userId,
      ideaCommentId: commentId,
    }})
  }

  let createdLike = null;
  if (foundLike) {
    const deletedLike = await prisma.userCommentLikes.delete({
      where: {
        id: foundLike.id
      }
    })
  } else {
    // TODO: Might have to handle if user clicks again to remove like
    createdLike = await prisma.userCommentLikes.create({
      data: {
        authorId: userId,
        ideaCommentId: commentId,
      }
    });
  }
  return createdLike
  } catch (error) {
    console.log(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const dislikeCommentAndRemoveLike = async (userId, commentId) => {
  try {
  const prismaWhereClause = {
    where: {
      authorId: userId,
      ideaCommentId: commentId,
    }
  }

  const foundLike = await prisma.userCommentLikes.findFirst(prismaWhereClause);
  const foundDislike = await prisma.userCommentDislikes.findFirst(prismaWhereClause)

  if (foundLike) {
    await prisma.userCommentLikes.deleteMany({ where: {
      authorId: userId,
      ideaCommentId: commentId,
    }})
  }

  let createdDislike = null;
  if (foundDislike) {
    const deletedDislike = await prisma.userCommentDislikes.delete({
      where: {
        id: foundDislike.id
      }
    })
  } else {
    createdDislike = await prisma.userCommentDislikes.create({
      data: {
        authorId: userId,
        ideaCommentId: commentId,
      }
    });
  }


  return createdDislike;
} catch (error) {
  console.log(error.message);
} finally {
  await prisma.$disconnect();
}
}


interactRouter.get(
  '/test',
  async (req, res, next) => {
    try {
      res.send('Interactions router working')
    } catch (error) {
      res.status(400).json({
				message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			}) 
    }
  }
)

interactRouter.get(
  '/like/getall',
  async (req, res, next) => {
    try {
      const allLikes = await prisma.userCommentLikes.findMany();
      return res.status(200).json(allLikes);
    } catch (error) {
      res.status(400).json({
				message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			}) 
    } finally {
      await prisma.$disconnect();
    }
  }
)

interactRouter.get(
  '/dislike/getall',
  async (req, res, next) => {
    try {
      const allDislikes = await prisma.userCommentDislikes.findMany();
      return res.status(200).json(allDislikes);
    } catch (error) {
      res.status(400).json({
				message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			}) 
    } finally {
      await prisma.$disconnect();
    }
  }
)

// Like a comment
interactRouter.post(
  '/like/:commentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const parsedCommentId = parseInt(req.params.commentId);

      // check if id is valid
      if (!parsedCommentId) {
        return res.status(400).json({
          message: `A valid comment must be specified in the route paramater.`,
        });
      }

      const foundComment = await prisma.ideaComment.findUnique({ where: { id: parsedCommentId }});
      if (!foundComment) {
        return res.status(400).json({
          message: `The comment with that listed ID (${ideaId}) does not exist.`,
        });
      }

      let createdCommentLike = likeCommentAndRemoveDislike(loggedInUserId, parsedCommentId);
      res.status(201).json(createdCommentLike);
    } catch (error) {
      res.status(400).json({
				message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			}) 
    } finally {
      await prisma.$disconnect();
    }
  }
)

// Dislike a comment
interactRouter.post(
  '/dislike/:commentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const parsedCommentId = parseInt(req.params.commentId);

      // check if id is valid
      if (!parsedCommentId) {
        return res.status(400).json({
          message: `A valid comment must be specified in the route paramater.`,
        });
      }

      const foundComment = await prisma.ideaComment.findUnique({ where: { id: parsedCommentId }});
      if (!foundComment) {
        return res.status(400).json({
          message: `The comment with that listed ID (${ideaId}) does not exist.`,
        });
      }

      let createdDislike = dislikeCommentAndRemoveLike(loggedInUserId, parsedCommentId);
      res.status(201).json(createdDislike);
    } catch (error) {
      res.status(400).json({
				message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			}) 
    } finally {
      await prisma.$disconnect();
    }
  }
)

module.exports = interactRouter;