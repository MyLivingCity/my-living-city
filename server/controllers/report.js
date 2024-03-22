const passport = require('passport');
const { PrismaClient } = require('@prisma/client')

const express = require('express');
const reportRouter = express.Router();
const prisma = require('../lib/prismaClient');

reportRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to report Router'
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

reportRouter.get(
  '/getall',
	passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const allReports = await prisma.report.findMany();
      const { email, id: loggedInUserId } = req.user;

      // Check if user is admin
      const foundUser = await prisma.user.findUnique({ where: { id: loggedInUserId }});
      const isUserAdmin = foundUser.userType === 'SUPER_ADMIN' || foundUser.userType === 'ADMIN';
      if (!isUserAdmin) {
        return res.status(401).json({
          message: 'You must be an Administrator to view reports.'
        });
      }

      res.status(200).json(allReports);
    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to fetch all reports",
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

reportRouter.post(
  '/create',
  async (req, res, next) => {
    try {
      const { email, description } = req.body;

      if (!email || !description) {
        return res.status(400).json({
          message: `You must supply an email and description of your report.`,
        });
      }

      const createdReport = await prisma.report.create({ data: {
        email, 
        description
      }});

      res.status(200).json({
        message: `Report succesfully created under ${email}. Thank you!`,
        report: createdReport,
      })
    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to create a report.",
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

reportRouter.delete(
  '/delete/:reportId',
	passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const parsedReportId = parseInt(req.params.reportId);

      // check if id is valid
      if (!parsedReportId) {
        return res.status(400).json({
          message: `A valid reportId must be specified in the route paramater.`,
        });
      }

      // Check if user is admin
      const foundUser = await prisma.user.findUnique({ where: { id: loggedInUserId }});
      const isUserAdmin = foundUser.userType === 'SUPER_ADMIN' || foundUser.userType === 'ADMIN';
      if (!isUserAdmin) {
        return res.status(401).json({
          message: 'You must be an Administrator to delete reports.'
        });
      }

      const deletedReport = await prisma.report.delete({ where: { id: parsedReportId }});

      res.status(200).json({
        message: `Report succesfully created under ${email}. Thank you!`,
        deletedReport,
      })
    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to delete a report.",
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

module.exports = reportRouter;