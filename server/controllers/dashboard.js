const passport = require('passport');
const express = require('express');
const prisma = require('../lib/prismaClient');
const dashboardRouter = express.Router();

dashboardRouter.get(
  '/getAllNotifications',
  // passport.authenticate('jwt',{session:true}),
  async (req, res, next) => {
    try {
      // const { id } = req.user;
      const test = await prisma.quarantine_Notifications.findMany({
        where: {
          // user_id: id
          seen: false
        }
      });
      console.log(test);
      res.send(test);
    }
    catch (error) {
      res.status(400).json({
        message: error.message,
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

dashboardRouter.put(
  '/dismiss/:notificationId',
  async (req, res, next) => {
    try {
      const { notificationId } = req.params;
      const test = await prisma.quarantine_Notifications.update({
        where: {
          id: notificationId * 1
        },
        data: {
          seen: true
        }
      });
      console.log(test);
      res.send(test);
    }
    catch (error) {
      res.status(400).json({
        message: error.message,
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


module.exports = dashboardRouter;