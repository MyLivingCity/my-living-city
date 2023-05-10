const passport = require('passport');

const express = require('express');
const blogRouter = express.Router();

blogRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to blog Router'
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

module.exports = blogRouter;