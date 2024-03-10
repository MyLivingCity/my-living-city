const passport = require('passport');
const express = require('express');
const avatarRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { makeUpload, deleteImage } = require('../lib/imageBucket');

const upload = makeUpload("avatar").single('avatar');

//make this get the userId and add it to the image name;
avatarRouter.get(
    '/',
    passport.authenticate('jwt',{session:false}),
    async (req, res, next) => {
      try {
        const { id } = req.user;
        //find the requesting user in the database
        const foundUser = await prisma.user.findUnique({
            where:{id:id}
        });
        res.json({
          route: 'welcome to Avatar Router'
        })
      } catch (error) {
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

  avatarRouter.post(
    '/image',
    [passport.authenticate('jwt', { session: false }), upload],
    async (req, res, next) => {
      try {
          let imagePath = req.file.key.substring(req.file.key.indexOf("/")+1);
          const {email,id} = req.user;

          const theUser = await prisma.user.findUnique({where:{id:id}});

          const originalPath = theUser.imagePath;
          //multer error handling method
         

          if(!req.file){
            return res.status(400).json({
              message: 'The image in the request body are missing. '
            });
          }

          const result = await prisma.user.update({
            where:{id:id},
            data:{
              imagePath:imagePath
            }
          });

          if(originalPath){
            await deleteImage("avatar", originalPath);
          }
          
          res.status(200).json(result);
    
        } catch (error) {
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
  
  module.exports = avatarRouter;