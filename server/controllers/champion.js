const passport = require('passport');

const express = require('express');
const prisma = require('../lib/prismaClient');
const { session } = require('passport');
const { checkIdeaThresholds } = require('../lib/prismaFunctions');
const championRouter = express.Router();

championRouter.get(
  '/test',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to the champion router'
      })
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

championRouter.post(
  '/idea/:ideaId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { ideaId } = req.params;
      const { email, id } = req.user;
      const parsedIdeaId = parseInt(ideaId);

      const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId }});
      const { isChampionable } = await checkIdeaThresholds(parsedIdeaId);

      if (!isChampionable) {
        return res.status(400).json({
          message: `This Idea is not Championable. It either already has a champion or it has not met the thresholds to become a proposal.`
        })
      }

      // TODO: This setting may need to change but authors cannot champion their own idea
      if (id === foundIdea.authorId) {
        return res.status(400).json({
          message: `You cannot champion your own idea. Please wait for someone else to endorse your idea!`
        })
      }

      const updatedIdea = await prisma.idea.update({
        where: { id: parsedIdeaId },
        data: {
          championId: id
        }
      })

      res.status(200).json({
        message: 'You have succesfully championed the idea!',
        updatedIdea,
      })
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

module.exports = championRouter;