const passport = require('passport');

const express = require('express');
const categoryRouter = express.Router();
const prisma = require('../lib/prismaClient');

categoryRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to Category Router'
      })
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

categoryRouter.get(
  '/getall',
  async (req, res, next) => {
    try {
      const allIdeas = await prisma.category.findMany();

      res.status(200).json(allIdeas);
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

categoryRouter.get(
  '/get/:categoryId',
  async (req, res, next) => {
    try {
      const parsedCatId = parseInt(req.params.categoryId);

      // Check if id is valid
      if (!parsedCatId) {
        return res.status(400).json({
          message: `A valid categoryId must be specified in the route parameter`
        })
      }

      const foundCategory = await prisma.category.findUnique({
        where: { id: parsedCatId }
      })

      if (!foundCategory) {
        return res.status(400).json({
          message: `The category with listed ID (${parsedCatId}) does not exist.`,
        })
      }

      res.status(200).json(foundCategory);
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

module.exports = categoryRouter;