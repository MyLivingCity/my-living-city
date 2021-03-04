const passport = require('passport');
const { PrismaClient, Prisma } = require('@prisma/client')

const express = require('express');
const ideaRouter = express.Router();

ideaRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to Idea Router'
      })
    } catch (error) {
			res.status(400).json({
				message: error.message,
				stack: error.stack,
			})
    }
  }
)

ideaRouter.get(
  '/getall',
  async (req, res, next) => {
    const prisma = new PrismaClient({ log: [ 'query' ]})
    try {
      const allCategories = await prisma.category.findMany();

      res.status(200).json(allCategories);
    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to fetch all categories",
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

module.exports = ideaRouter;