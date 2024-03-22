const passport = require('passport');
const express = require('express');
const userSegmentRequestRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { isString, isEmpty, isInteger, toInteger } = require('lodash');

userSegmentRequestRouter.post(
    '/create',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            let error = '';
            let errorMessage = '';
            let errorStack = '';

            const {id} = req.user;

            //if there's no object in the request body
            if(isEmpty(req.body)){
                return res.status(400).json({
                    message: 'The objects in the request body are missing',
                    details: {
                        errorMessage: 'Creating a segment request must supply necessary fields explicitly.',
                        errorStack: 'necessary fields must be provided in the body with valid values',
                    }
                })
            }
            const {country,province,segmentName,subSegmentName} = req.body;
            if(!country||!isString(country)){
                error+='country field is not in the request body. ';
                errorMessage+='Creating a segment request must explicitly be supplied with a valid country field.';
                errorStack+='country must be provided in the body with a valid value. ';
            }
            if(!province||!isString(province)){
                error+='province field is not in the request body. ';
                errorMessage+='Creating a segment request must explicitly be supplied with a valid province field. ';
                errorStack+='province must be provided in the body with a valid value. ';
            }
            if(!segmentName||!isString(segmentName)){
                error+='segmentName field is not in the request body. ';
                errorMessage+='Creating a segment request must explicitly be supplied with a valid segmentName field. ';
                errorStack+='segmentName must be provided in the body with a valid value. ';
            }
            //If there's error in error holder
            if(error||errorMessage||errorStack){
                return res.status(400).json({
                    message: error,
                    details: {
                      errorMessage: errorMessage,
                      errorStack: errorStack
                    }
                });
            }

            const result = await prisma.segmentRequest.create({
                data:{
                    userId:id,
                    country:country,
                    province:province,
                    segmentName:segmentName,
                    subSegmentName:subSegmentName
                }
            })

            res.status(200).json(result);

        }catch(error){
            res.status(400).json({
                message: error.message,
                details: {
                  errorMessage: error.message,
                  errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
)

userSegmentRequestRouter.get(
    '/getAll',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            const {id} = req.user;

            const theUser = await prisma.user.findUnique({
                where:{id:id}
            })

            if(theUser.userType === 'SUPER_ADMIN' || theUser.userType === 'ADMIN'){
                const result = await prisma.segmentRequest.findMany();

                res.status(200).json(result);
            }else{
                res.status(403).json("Only admin can get all segment requests!");
            }
        }catch(error){
            res.status(400).json({
                message: error.message,
                details: {
                  errorMessage: error.message,
                  errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
)

userSegmentRequestRouter.get(
    '/getMine',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            const {id} = req.user;

            const result = await prisma.segmentRequest.findMany({
                where:{userId:id}
            });

            if(!result){
                return res.status(404).json("No segment requests been found!");
            }

            res.status(200).json(result);
        }catch(error){
            res.status(400).json({
                message: error.message,
                details: {
                  errorMessage: error.message,
                  errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
)

userSegmentRequestRouter.delete(
    '/deleteById/:deleteId',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            const {id} = req.user;

            const theUser = await prisma.user.findUnique({
                where:{id:id}
            })

            const {deleteId} = req.params;

            const parsedDeleteId = toInteger(deleteId);

            if(!isInteger(parsedDeleteId)){
                return res.status(400).json("deleteId must be integer");
            }

            const theRequest = await prisma.segmentRequest.findUnique({
                where:{id:parsedDeleteId}
            })

            if(!theRequest){
                return res.status(404).json("segment request not found!");
            }

            if(theUser.userType === 'SUPER_ADMIN' || theUser.userType === 'ADMIN'){
                const result = await prisma.segmentRequest.delete({
                    where:{id:parsedDeleteId}
                })

                res.sendStatus(204);
            }else{
                if(theRequest.userId==id){
                    const result = await prisma.segmentRequest.delete({
                        where:{id:parsedDeleteId}
                    })

                    res.sendStatus(204);
                }else{
                    res.status(403).json("You don't have right to delete this segment request!");
                }
            }
        }catch(error){
            res.status(400).json({
                message: error.message,
                details: {
                  errorMessage: error.message,
                  errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
)

userSegmentRequestRouter.delete(
    '/deleteByUser/:userId',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            const {id} = req.user;

            const theUser = await prisma.user.findUnique({
                where:{id:id}
            })

            if(theUser.userType === 'SUPER_ADMIN' || theUser.userType === 'ADMIN'){
                const {userId} = req.params;
                const targetUser = await prisma.user.findUnique({
                    where:{id:userId}
                })

                if(!targetUser){
                    return res.status(404).json("user not found!");
                }else{
                    const result = await prisma.segmentRequest.deleteMany({
                        where:{userId:userId}
                    })
                    res.sendStatus(204);
                }
            }else{
                res.status(403).json("Only admin can access this endpoint!");
            }
        }catch(error){
            res.status(400).json({
                message: error.message,
                details: {
                  errorMessage: error.message,
                  errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
)

module.exports = userSegmentRequestRouter;