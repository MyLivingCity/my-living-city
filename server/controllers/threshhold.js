const passport = require('passport');
const express = require('express');
const prisma = require('../lib/prismaClient');
const threshholdRouter = express.Router();



threshholdRouter.post(
    '/create/:num',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {
        const newThreshhold = parseInt(req.params.num);

        if (!newThreshhold) {
            return res.status(400).json({
              message: `A valid number must be specified in the route parameter.`,
            });
        }

        const allThreshholds = await prisma.threshhold.findMany();
        if(allThreshholds.length === 0){
            const newThresh = await prisma.threshhold.create({
                data: {
                    number: newThreshhold
                }
            });
            res.status(200).json({
                message: `Threshhold successfuly created`,
                newThresh,
              });
            
        }else{
            return res.status(400).json({
                message: `A threshhold already exists, please modify the current threshold`,
            });
        }
      } catch (error) {
        res.status(400).json({
          message: `An error occured while trying to create a threshold.`,
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

  threshholdRouter.put(
    '/update/:num',
    passport.authenticate('jwt', {session: false}),
    async(req, res, next) =>{
      try{
        const newThreshhold = parseInt(req.params.num);

        if (!newThreshhold) {
            return res.status(400).json({
              message: `A valid number must be specified in the route parameter.`,
            });
        }

        const threshhold = await prisma.threshhold.findUnique({ where: { id: 1 } });

        if(threshhold === null){
            return res.status(400).json({
                message: `A threshhold doesn't currently exist, please create one first`,
            });
        }else{
            const updatedThresh = await prisma.threshhold.update({
                where: {id : 1},
                data: { number: newThreshhold}
            });
            return res.status(200).json({
                message: `Threshhold successfuly updated`,
                updatedThresh,
              });
        }

      }catch(error){
        res.status(400).json({
          message: "An error occured while trying to update the threshhold",
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


threshholdRouter.get(
    '/get',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {
  
        const threshhold = await prisma.threshhold.findUnique({where: {id: 1}});
        res.json(threshhold);

      } catch (error) {
        res.status(400).json({
          message: "An error occured while trying to fetch threshhold.",
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

  threshholdRouter.put(
    '/updateFalseFlag/:num',
    passport.authenticate('jwt', {session: false}),
    async(req, res, next) =>{
      try{
        const newThreshhold = parseInt(req.params.num);

        if (!newThreshhold) {
            return res.status(400).json({
              message: `A valid number must be specified in the route parameter.`,
            });
        }

        const threshhold = await prisma.threshhold.findUnique({ where: { id: 2 } });

        if(threshhold === null){
            return res.status(400).json({
                message: `A threshhold doesn't currently exist, please create one first`,
            });
        }else{
            const updatedThresh = await prisma.threshhold.update({
                where: {id : 1},
                data: { number: newThreshhold}
            });
            return res.status(200).json({
                message: `Threshhold successfuly updated`,
                updatedThresh,
              });
        }

      }catch(error){
        res.status(400).json({
          message: "An error occured while trying to update the threshhold",
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

threshholdRouter.get(
  '/getFalseFlag',
  passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {

        const threshhold = await prisma.threshhold.findUnique({where: {id: 2}});
        res.json(threshhold);

      } catch (error) {
        res.status(400).json({
          message: "An error occured while trying to fetch threshhold.",
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




module.exports = threshholdRouter;