const passport = require('passport');
const express = require('express');
const superSegmentRouter = express.Router();
const prisma = require('../lib/prismaClient');

const { isEmpty, isInteger, isString } = require('lodash');
const { UserType } = require('@prisma/client');

superSegmentRouter.post(
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

            if(theUser.userType==='SUPER_ADMIN' || theUser.userType==='ADMIN'){
                const {name,country,province} = req.body;

                if(!name||!isString(name)){
                    error+='A name is need for creating a super segment. ';
                    errorMessage+='super segment name must be provided as a string variable. ';
                    errorStack+='super segment name must be provided in the request body. ';
                }

                if(!country||!isString(country)){
                    error+='Country field is need for creating a super segment. ';
                    errorMessage+='super segment country field must be provided as a string variable. ';
                    errorStack+='country must be provided in the request body. ';
                }

                if(!province||!isString(province)){
                    error+='Province field is need for creating a super segment. ';
                    errorMessage+='Province field must be provided as a string variable. ';
                    errorStack+='province must be provided in the request body. ';
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

                const result = await prisma.superSegment.create({
                    data:{
                        name:name,
                        country:country,
                        province:province
                    }
                })

                res.status(200).json(result);
            }else{
                return res.status(403).json({
                    message: "You don't have the right to add a super segment!",
                    details: {
                      errorMessage: 'In order to create a super segment, you must be an admin.',
                      errorStack: 'user must be an admin if they want to create a super segment',
                    }
                });
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to create a super segment.",
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

superSegmentRouter.get(
    '/getAll',
    async(req,res) => {
        try{
            const superSegments = await prisma.superSegment.findMany();

            res.status(200).json(superSegments);
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve super segments. ",
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

superSegmentRouter.get(
    '/getByCountryProvince',
    async (req, res) => {
        try {
            const { country, province } = req.query;
            console.log(`Query Parameters: country=${country}, province=${province}`);
            const superSegments = await prisma.superSegment.findMany({
                where: {
                    country: country,
                    province: province
                }
            });
            res.status(200).json(superSegments);
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: "An error occurred while trying to retrieve super segments.",
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

superSegmentRouter.get(
    '/getById/:superSegmentId',
    passport.authenticate('jwt',{session:false}),
    async(req,res) => {
        try{
            const {superSegmentId} = req.params;

            if(!isInteger(superSegmentId)){
                return res.status(400).json("Invalid super segment id! ");
            }

            const theSuperSegment = await prisma.superSegment.findUnique({
                where:{superSegId:superSegmentId}
            });

            if(!theSuperSegment){
                return res.status(404).json("super segment not found! ");
            }

            res.status(200).json(theSuperSegment);
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a segment.",
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

superSegmentRouter.delete(
    '/delete/:deleteId',
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

            if(theUser.userType==='SUPER_ADMIN' || theUser.userType==='ADMIN'){
                const { deleteId } = req.params;
                const segIdNumber = Number.parseInt(deleteId);
                console.log("deleteId: ", deleteId);
                if(!isInteger(segIdNumber)){
                    return res.status(400).json("Invalid super segment id! ");
                }
                
                const theSuperSegment = await prisma.superSegment.findUnique({
                    where:{superSegId:segIdNumber}
                });

                if(!theSuperSegment){
                    return res.status(404).json("super segment not found! ");
                }

                const result = await prisma.superSegment.delete({
                    where:{superSegId:segIdNumber}
                });

                res.sendStatus(204);

            }else{
                return res.status(403).json({
                    message: "You don't have the right to delete a super segment!",
                    details: {
                      errorMessage: 'In order to delete a super segment, you must be an admin.',
                      errorStack: 'user must be an admin if they want to delete a super segment',
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

superSegmentRouter.post(
    '/update/:superSegId',
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

            if(theUser.userType==='SUPER_ADMIN' || theUser.userType==='ADMIN'){
                const {superSegId} = req.params;
                const segIdNumber = Number.parseInt(superSegId);
                if (!isInteger(segIdNumber)) {
                    return res.status(400).json("Invalid super segment id! ");
                }
                const {name,country,province} = req.body;

                const theSuperSegment = await prisma.superSegment.findUnique({
                    where:{superSegId: segIdNumber}
                });

                if(!theSuperSegment){
                    return res.status(404).json("super segment not found! ");
                }

                if(name&&!isString(name)){
                    error+='Valid name is need for creating a super segment. ';
                    errorMessage+='super segment name must be provided as a string variable. ';
                    errorStack+='Valid super segment name must be provided in the request body. ';
                }

                if(country&&!isString(country)){
                    error+='Valid country field is need for creating a super segment. ';
                    errorMessage+='super segment country field must be provided as a string variable. ';
                    errorStack+='valid country name must be provided in the request body. ';
                }

                if(province&&!isString(province)){
                    error+='Valid province field is need for creating a super segment. ';
                    errorMessage+='Province field must be provided as a string variable. ';
                    errorStack+='Valid province must be provided in the request body. ';
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
                };

                const result = await prisma.superSegment.update({
                    where:{superSegId:segIdNumber},
                    data:{
                        name:name,
                        country:country,
                        province:province
                    }
                });

                await prisma.segments.updateMany({
                    where:{superSegId:segIdNumber},
                    data:{
                        superSegName:name,
                        country:country,
                        province:province
                    }
                });

                await prisma.userSegments.updateMany({
                    where:{homeSuperSegId:segIdNumber},
                    data:{
                        homeSuperSegName:name
                    }
                });

                await prisma.userSegments.updateMany({
                    where:{workSuperSegId:segIdNumber},
                    data:{
                        workSuperSegName:name
                    }
                });

                await prisma.userSegments.updateMany({
                    where:{schoolSuperSegId:segIdNumber},
                    data:{
                        schoolSuperSegName:name
                    }
                });

                res.status(200).json(result);
            }else{
                return res.status(403).json({
                    message: "You don't have the right to update a super segment!",
                    details: {
                      errorMessage: 'In order to update a super segment, you must be an admin.',
                      errorStack: 'user must be an admin if they want to delete a super segment',
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

module.exports = superSegmentRouter;