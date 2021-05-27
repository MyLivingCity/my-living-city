const passport = require('passport');
const express = require('express');
const segmentRouter = express.Router();
const prisma = require('../lib/prismaClient');

const { isEmpty } = require('lodash');
const { UserType } = require('@prisma/client');

segmentRouter.post(
    '/create',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            let error = '';
            let errorMessage = '';
            let errorStack = '';
            //get email and user id from request
            const { email, id } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where:{id:id},
                select:{userType:true}
            });
            //User must be admin to create segment
            if (theUser.userType == 'ADMIN'){
                const {country,province,name,superSegName} = req.body;

                console.log(req.body);

                //if there's no object in the request body
                if(isEmpty(req.body)){
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage: 'Creating a segment must supply necessary fields explicitly.',
                            errorStack: 'necessary fields must be provided in the body with valid values',
                        }
                    })
                }
                //if country field is missing
                if(!country){
                    error+='A segment must has a country field. ';
                    errorMessage+='Creating a segment must explicitly be supplied with a country field. ';
                    errorStack+='cuntry must be provided in the body with a valid value. ';
                }

                //if province is missing
                if(!province){
                    error+='A segment must has a province field. ';
                    errorMessage+='Creating a segment must explicitly be supplied with a province field. ';
                    errorStack+='province must be provided in the body with a valid value. ';
                }

                if(!name){
                    error+='A segment must has a name field. ';
                    errorMessage+='Creating a segment must explicitly be supplied with a name field. ';
                    errorStack+='name must be provided in the body with a valid value. ';
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

                //create a segement table item
                const createSegment = await prisma.segments.create({
                    data:{
                        country:country,
                        province:province,
                        name:name,
                        superSegName:superSegName
                    }
                })

                res.status(200).json(createSegment);
            }else{
                return res.status(403).json({
                    message: "You don't have the right to add a segment!",
                    details: {
                      errorMessage: 'In order to create a segment, you must be an admin or business user.',
                      errorStack: 'user must be an admin if they want to create a segment',
                    }
                });
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to create a segment.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
);

segmentRouter.get(
    '/getAll',
    async(req,res) => {
        try{
            const result = await prisma.segments.findMany();
            console.log(result);
            res.status(200).send(result);
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve segments.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
);

segmentRouter.delete(
    '/delete/:segmentId',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            //get email and user id from request
            const { email, id } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where:{id:id},
                select:{userType:true}
            });
            //Only admin can delete segment
            if(theUser.userType == 'ADMIN'){
                const {segmentId} = req.params;
                const parsedSegmentId = parseInt(segmentId);
                const theSegment = await prisma.segments.findUnique({
                    where:{
                        segId:parsedSegmentId
                    }
                });

                if(!theSegment){
                    res.status(404).json("the segment need to be deleted not found!");
                }else{
                    await prisma.segments.delete({
                        where:{
                            segId:parsedSegmentId
                        }
                    });
                    res.sendStatus(204);
                }
            }else{
                return res.status(403).json({
                    message: "You don't have the right to delete a segment!",
                    details: {
                      errorMessage: 'In order to delete a segment, you must be an admin or business user.',
                      errorStack: 'user must be an admin if they want to delete a segment',
                    }
                });
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to delete a segment.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }finally{
            await prisma.$disconnect();
        }
    }
);

segmentRouter.post(
    '/update/:segmentId',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            //get email and user id from request
            const { email, id } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where:{id:id},
                select:{userType:true}
            });
            //User must be admin to create segment
            if(theUser.userType == 'ADMIN'){
                const {segmentId} = req.params;

                const parsedSegmentId = parseInt(segmentId);

                const {country,province,name,superSegName} = req.body;

                console.log(req.body);

                //if there's no object in the request body
                if(isEmpty(req.body)){
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage: 'Creating a segment must supply necessary fields explicitly.',
                            errorStack: 'necessary fields must be provided in the body with valid values',
                        }
                    })
                }
                //find the segment which need to be updated
                const theSegment = await prisma.segments.findUnique({
                    where:{
                        segId:parsedSegmentId
                    }
                });

                if(!theSegment){
                    res.status(404).json("the segment need to be updated not found!");
                }else{
                    const result = await prisma.segments.update({
                        where:{segId:parsedSegmentId},
                        data:{
                            country:country,
                            province:province,
                            name:name,
                            superSegName:superSegName
                        }
                    });

                    res.status(200).json(result);
                }
            }else{
                return res.status(403).json({
                    message: "You don't have the right to update a segment!",
                    details: {
                      errorMessage: 'In order to delete a segment, you must be an admin or business user.',
                      errorStack: 'user must be an admin if they want to delete a segment',
                    }
                });
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to update a segment.",
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

module.exports = segmentRouter;