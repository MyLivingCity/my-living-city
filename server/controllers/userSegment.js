const passport = require('passport');
const express = require('express');
const userSegmentRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { isInteger } = require('lodash');
const { isEmpty } = require('lodash');
const { subSegments, user } = require('../lib/prismaClient');

userSegmentRouter.post(
    '/create',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            let error = '';
            let errorMessage = '';
            let errorStack = '';
            let homeSuperSegId,workSuperSegId,schoolSuperSegId;
            let homeSuperSegName = '';
            let workSuperSegName = '';
            let schoolSuperSegName = '';
            let homeSegmentName = '';
            let workSegmentName = '';
            let schoolSegmentName = '';
            let homeSubSegmentName = '';
            let workSubSegmentName = '';
            let schoolSubSegmentName = '';
            let homeSegHandle = '';
            let workSegHandle = '';
            let schoolSegHandle = '';
            //get email and user id from request
            const { email, id } = req.user;

            const user = await prisma.user.findUnique({
                where:{id: id},
                select:{
                    fname:true,
                    address:true
                }
            });

          

            const exist = await prisma.userSegments.findFirst({
                where:{userId:id}
            });

            if(exist){
                return res.status(409).json("You are not allow to create another user segment!");
            }

            const workDetails = await prisma.work_Details.findFirst({
                where:{userId:id}
            });

            const schoolDetails = await prisma.school_Details.findFirst({
                where:{userId:id}
            });

            console.log(req.body);
            const {homeSegmentId,workSegmentId,schoolSegmentId,homeSubSegmentId,workSubSegmentId,schoolSubSegmentId} = req.body;

            if(homeSegmentId){
                if(!isInteger(homeSegmentId)){
                    error+='homeSegment Id must be integer.';
                    errorMessage+='homeSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:homeSegmentId}
                    });

                    if(!queryResult){
                        error+='homeSegmend Id doesn\'t exist in the database!';
                        errorMessage+='homeSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='homeSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        homeSegmentName=queryResult.name;

                        homeSuperSegId = queryResult.superSegId;

                        homeSuperSegName = queryResult.superSegName;
                        
                        homeSegHandle = `${user.fname}@${user.address.streetAddress}`;
                    }
                }
            }



            if(workSegmentId){
                if(!isInteger(workSegmentId)){
                    error+='workSegment Id must be integer.';
                    errorMessage+='workSegment Id must be provided in request body as an integer.';
                    errorStack+='workSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:workSegmentId}
                    });

                    if(!queryResult){
                        error+='workSegmend Id doesn\'t exist in the database!';
                        errorMessage+='workSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='workSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        workSegmentName=queryResult.name;

                        workSuperSegId=queryResult.superSegId;

                        workSuperSegName=queryResult.superSegName;

                        if (workDetails) {
                            workSegHandle = `${user.fname}@${workDetails.company}`;
                        }
                    }
                }
            }
    
            if(schoolSegmentId){
                if(!isInteger(schoolSegmentId)){
                    error+='schoolSegment Id must be integer.';
                    errorMessage+='schoolSegment Id must be provided in request body as an integer.';
                    errorStack+='schoolSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:schoolSegmentId}
                    });

                    if(!queryResult){
                        error+='schoolSegmend Id doesn\'t exist in the database!';
                        errorMessage+='schoolSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='schoolSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        schoolSegmentName=queryResult.name;

                        schoolSuperSegId=queryResult.superSegId;

                        schoolSuperSegName=queryResult.superSegName;

                        if (schoolDetails.faculty == '') {
                            schoolSegHandle = `${user.fname}@${schoolDetails.faculty}`;
                        }
                    }
                }
            }
         
            if(homeSubSegmentId){
                if(!Number.isInteger(homeSegmentId)){
                    error+='homeSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!Number.isInteger(homeSubSegmentId)){
                    error+='homeSubSegment Id must be integer.';
                    errorMessage+='homeSubSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:homeSubSegmentId,segId:homeSegmentId}
                    });

                    if(!queryResult){
                        error+='homeSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='homeSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='homeSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        homeSubSegmentName=queryResult.name;
                    }
                }
            }
       
            if(workSubSegmentId){
                if(!Number.isInteger(workSegmentId)){
                    error+='workSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!Number.isInteger(workSubSegmentId)){
                    error+='workSubSegment Id must be integer.';
                    errorMessage+='workSubSegment Id must be provided in request body as an integer.';
                    errorStack+='workSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:workSubSegmentId,segId:workSegmentId}
                    });

                    if(!queryResult){
                        error+='workSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='workSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='workSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        workSubSegmentName=queryResult.name;
                    }
                }
            }
            
            if(schoolSubSegmentId){
                if(!Number.isInteger(schoolSegmentId)){
                    error+='homeSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!Number.isInteger(schoolSubSegmentId)){
                    error+='homeSubSegment Id must be integer.';
                    errorMessage+='homeSubSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:schoolSubSegmentId,segId:schoolSegmentId}
                    });

                    if(!queryResult){
                        error+='schoolSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='schoolSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='schoolSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        schoolSubSegmentName=queryResult.name;
                    }
                }
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

            const result = await prisma.userSegments.create({
                data:{
                    userId:id,
                    homeSuperSegId:homeSuperSegId,
                    homeSuperSegName:homeSuperSegName,
                    workSuperSegId:workSuperSegId,
                    workSuperSegName:workSuperSegName,
                    schoolSuperSegId:schoolSuperSegId,
                    schoolSuperSegName:schoolSuperSegName,
                    homeSegmentId:homeSegmentId,
                    homeSegmentName:homeSegmentName,
                    workSegmentId:workSegmentId,
                    workSegmentName:workSegmentName,
                    schoolSegmentId:schoolSegmentId,
                    schoolSegmentName:schoolSegmentName,
                    homeSubSegmentId:homeSubSegmentId,
                    homeSubSegmentName:homeSubSegmentName,
                    workSubSegmentId:workSubSegmentId,
                    workSubSegmentName:workSubSegmentName,
                    schoolSubSegmentId:schoolSubSegmentId,
                    schoolSubSegmentName:schoolSubSegmentName,
                    homeSegHandle:homeSegHandle,
                    workSegHandle:workSegHandle,
                    schoolSegHandle:schoolSegHandle,
                }
            })

            res.status(200).json(result);
            
        }catch(error){
            console.log("User Segment Error" , error);
            res.status(400).json({
                message: "An error occured while trying to create a userSegment.",
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

userSegmentRouter.get(
    '/getMySegment',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const result = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!result){
                res.status(404).json("user segment not found!");
            }

            res.status(200).json(result);
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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
userSegmentRouter.get(
    '/getUserSegment/:userId',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            const { userId } = req.params;
            console.log(userId);
            const result = await prisma.userSegments.findFirst({
                where:{userId:userId}
            })

            if(!result){
                res.status(204).json("user segment not found!");
            }
            if(result){
                res.status(200).json(result);
            }

        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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
userSegmentRouter.delete(
    '/delete',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const exist = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!exist){
                return res.status(400).json("You don't have a user segment to delete!");
            }

            const deleteId = exist.id;

            await prisma.userSegments.delete({
                where:{id:deleteId}
            })

            res.sendStatus(204);
            
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to delete a userSegment.",
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

userSegmentRouter.put(
    '/update',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            let exists = true;
            let updateId;
            let error = '';
            let errorMessage = '';
            let errorStack = '';

            let homeSuperSegId,workSuperSegId,schoolSuperSegId;
            let homeSuperSegName = '';
            let workSuperSegName = '';
            let schoolSuperSegName = '';
            let homeSegmentName = '';
            let workSegmentName = '';
            let schoolSegmentName = '';
            let homeSubSegmentName = '';
            let workSubSegmentName = '';
            let schoolSubSegmentName = '';
            let homeSegHandle = '';
            let workSegHandle = '';
            let schoolSegHandle = '';

            //get email and user id from request
            const { email, id } = req.user;

            const {homeSegmentId,workSegmentId,schoolSegmentId,homeSubSegmentId,workSubSegmentId,schoolSubSegmentId} = req.body;

            const exist = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!exist){
                exists = false;
            }

            const user = await prisma.user.findFirst({
                where:{id:id}
            })

            const work_Details = await prisma.workDetails.findFirst({
                where:{userId:id}
            })

            const school_Details = await prisma.schoolDetails.findFirst({
                where:{userId:id}
            })

            if(exists){
                updateId = exist.id;

                homeSuperSegName = exist.homeSuperSegName;
                workSuperSegName = exist.workSuperSegName;
                schoolSuperSegName = exist.schoolSuperSegName;
                homeSegmentName = exist.homeSegmentName;
                workSegmentName = exist.workSegmentName;
                schoolSegmentName = exist.schoolSegmentName;
                homeSubSegmentName = exist.homeSubSegmentName;
                workSubSegmentName = exist.workSubSegmentName;
                schoolSubSegmentName = exist.schoolSubSegmentName;
                homeSegmentHandle = exist.homeSegmentHandle;
                workSegmentHandle = exist.workSegmentHandle;
                schoolSegmentHandle = exist.schoolSegmentHandle;
            }
            
            if(homeSegmentId){
                if(!isInteger(homeSegmentId)){
                    error+='homeSegment Id must be integer.';
                    errorMessage+='homeSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:homeSegmentId}
                    });

                    if(!queryResult){
                        error+='homeSegmend Id doesn\'t exist in the database!';
                        errorMessage+='homeSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='homeSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        homeSegmentName = queryResult.name;

                        homeSuperSegId = queryResult.superSegId;

                        homeSuperSegName = queryResult.superSegName;

                        homeSegmentHandle = `${user.fname}@${user.address.streetAddress}`
                    }
                }
            }

            if(workSegmentId){
                if(!isInteger(workSegmentId)){
                    error+='workSegment Id must be integer.';
                    errorMessage+='workSegment Id must be provided in request body as an integer.';
                    errorStack+='workSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:workSegmentId}
                    });

                    if(!queryResult){
                        error+='workSegmend Id doesn\'t exist in the database!';
                        errorMessage+='workSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='workSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        workSegmentName=queryResult.name;

                        workSuperSegId=queryResult.superSegId;

                        workSuperSegName=queryResult.superSegName;

                        workSegmentHandle = `${user.fname}@${work_Details.company}`
                    }
                }
            }

            if(schoolSegmentId){
                if(!isInteger(schoolSegmentId)){
                    error+='schoolSegment Id must be integer.';
                    errorMessage+='schoolSegment Id must be provided in request body as an integer.';
                    errorStack+='schoolSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:schoolSegmentId}
                    });

                    if(!queryResult){
                        error+='schoolSegmend Id doesn\'t exist in the database!';
                        errorMessage+='schoolSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='schoolSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        schoolSegmentName=queryResult.name;

                        schoolSuperSegId=queryResult.superSegId;

                        schoolSuperSegName=queryResult.superSegName;

                        schoolSegmentHandle = `${user.fname}@${school_Details.faculty}`
                    }
                }
            }

            if(homeSubSegmentId){
                if(!homeSegmentId){
                    error+='homeSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!isInteger(homeSubSegmentId)){
                    error+='homeSubSegment Id must be integer.';
                    errorMessage+='homeSubSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:homeSubSegmentId,segId:homeSegmentId}
                    });

                    if(!queryResult){
                        error+='homeSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='homeSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='homeSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        homeSubSegmentName=queryResult.name;
                    }
                }
            }

            if(workSubSegmentId){
                if(!workSegmentId){
                    error+='workSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!isInteger(workSubSegmentId)){
                    error+='workSubSegment Id must be integer.';
                    errorMessage+='workSubSegment Id must be provided in request body as an integer.';
                    errorStack+='workSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:workSubSegmentId,segId:workSegmentId}
                    });

                    if(!queryResult){
                        error+='workSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='workSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='workSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        workSubSegmentName=queryResult.name;
                    }
                }
            }

            if(schoolSubSegmentId){
                if(!schoolSegmentId){
                    error+='homeSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!isInteger(schoolSubSegmentId)){
                    error+='homeSubSegment Id must be integer.';
                    errorMessage+='homeSubSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:schoolSubSegmentId,segId:schoolSegmentId}
                    });

                    if(!queryResult){
                        error+='schoolSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='schoolSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='schoolSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        schoolSubSegmentName=queryResult.name;
                    }
                }
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

            let result;

            if(exists){
                result = await prisma.userSegments.update({
                    where:{id:updateId},
                    data:{
                        homeSuperSegId:homeSuperSegId,
                        homeSuperSegName:homeSuperSegName,
                        workSuperSegId:workSuperSegId,
                        workSuperSegName:workSuperSegName,
                        schoolSuperSegId:schoolSuperSegId,
                        schoolSuperSegName:schoolSegmentName,
                        homeSegmentId:homeSegmentId,
                        homeSegmentName:homeSegmentName,
                        workSegmentId:workSegmentId,
                        workSegmentName:workSegmentName,
                        schoolSegmentId:schoolSegmentId,
                        schoolSegmentName:schoolSegmentName,
                        homeSubSegmentId:homeSubSegmentId,
                        homeSubSegmentName:homeSubSegmentName,
                        workSubSegmentId:workSubSegmentId,
                        workSubSegmentName:workSubSegmentName,
                        schoolSubSegmentId:schoolSubSegmentId,
                        schoolSubSegmentName:schoolSubSegmentName,
                        homeSegHandle:homeSegHandle,
                        workSegHandle:workSegHandle,
                        schoolSegHandle:schoolSegHandle
                    }
                })
            }else{
                result = await prisma.userSegments.create({
                    data:{
                        userId:id,
                        homeSuperSegId:homeSuperSegId,
                        homeSuperSegName:homeSuperSegName,
                        workSuperSegId:workSuperSegId,
                        workSuperSegName:workSuperSegName,
                        schoolSuperSegId:schoolSuperSegId,
                        schoolSuperSegName:schoolSegmentName,
                        homeSegmentId:homeSegmentId,
                        homeSegmentName:homeSegmentName,
                        workSegmentId:workSegmentId,
                        workSegmentName:workSegmentName,
                        schoolSegmentId:schoolSegmentId,
                        schoolSegmentName:schoolSegmentName,
                        homeSubSegmentId:homeSubSegmentId,
                        homeSubSegmentName:homeSubSegmentName,
                        workSubSegmentId:workSubSegmentId,
                        workSubSegmentName:workSubSegmentName,
                        schoolSubSegmentId:schoolSubSegmentId,
                        schoolSubSegmentName:schoolSubSegmentName,
                        homeSegHandle:homeSegHandle,
                        workSegHandle:workSegHandle,
                        schoolSegHandle:schoolSegHandle
                    }
                })
            }

            res.status(200).json(result);

        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to update a userSegment.",
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

userSegmentRouter.put(
    '/update/:id',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            let updateId;
            let error = '';
            let errorMessage = '';
            let errorStack = '';

            let homeSuperSegId,workSuperSegId,schoolSuperSegId;
            let homeSuperSegName = '';
            let workSuperSegName = '';
            let schoolSuperSegName = '';
            let homeSegmentName = '';
            let workSegmentName = '';
            let schoolSegmentName = '';
            let homeSubSegmentName = '';
            let workSubSegmentName = '';
            let schoolSubSegmentName = '';
            let homeSegmentHandle = '';
            let workSegmentHandle = '';
            let schoolSegmentHandle = '';

            const { id } = req.params;

            const {
                homeSegmentId,
                workSegmentId,
                schoolSegmentId,
                homeSubSegmentId,
                workSubSegmentId,
                schoolSubSegmentId
            } = req.body;

            const userSegementInfo = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!userSegementInfo){
                error+='user with id doesn\'t exist in the database!';
                errorMessage+='id of existing user must be provided.';
                errorStack+='id of existing user must be provided.';
                throw new Error("user with id doesn\'t exist in the database!");
            }

            const user = await prisma.user.findFirst({
                where:{id:id}
            })

            const work_Details = await prisma.work_Details.findFirst({
                where:{userId:id}
            })

            const school_Details = await prisma.school_Details.findFirst({
                where:{userId:id}
            })

            updateId = userSegementInfo.id;
            homeSuperSegName = userSegementInfo.homeSuperSegName;
            workSuperSegName = userSegementInfo.workSuperSegName;
            schoolSuperSegName = userSegementInfo.schoolSuperSegName;
            homeSegmentName = userSegementInfo.homeSegmentName;
            workSegmentName = userSegementInfo.workSegmentName;
            schoolSegmentName = userSegementInfo.schoolSegmentName;
            homeSubSegmentName = userSegementInfo.homeSubSegmentName;
            workSubSegmentName = userSegementInfo.workSubSegmentName;
            schoolSubSegmentName = userSegementInfo.schoolSubSegmentName;
            homeSegmentHandle = userSegementInfo.homeSegmentHandle;
            workSegmentHandle = userSegementInfo.workSegmentHandle;
            schoolSegmentHandle = userSegementInfo.schoolSegmentHandle;
            
            if(homeSegmentId){
                if(!isInteger(homeSegmentId)){
                    error+='homeSegment Id must be integer.';
                    errorMessage+='homeSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:homeSegmentId}
                    });

                    if(!queryResult){
                        error+='homeSegmend Id doesn\'t exist in the database!';
                        errorMessage+='homeSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='homeSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        homeSegmentName = queryResult.name;

                        homeSuperSegId = queryResult.superSegId;

                        homeSuperSegName = queryResult.superSegName;

                        homeSegmentHandle = `${user.fname}@${user?.address?.streetAddress || ""}`
                    }
                }
            }

            if(workSegmentId){
                if(!isInteger(workSegmentId)){
                    error+='workSegment Id must be integer.';
                    errorMessage+='workSegment Id must be provided in request body as an integer.';
                    errorStack+='workSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:workSegmentId}
                    });

                    if(!queryResult){
                        error+='workSegmend Id doesn\'t exist in the database!';
                        errorMessage+='workSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='workSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        workSegmentName=queryResult.name;

                        workSuperSegId=queryResult.superSegId;

                        workSuperSegName=queryResult.superSegName;

                        workSegmentHandle = `${user.fname}@${work_Details.company}`
                    }
                }
            }

            if(schoolSegmentId){
                if(!isInteger(schoolSegmentId)){
                    error+='schoolSegment Id must be integer.';
                    errorMessage+='schoolSegment Id must be provided in request body as an integer.';
                    errorStack+='schoolSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.segments.findUnique({
                        where: {segId:schoolSegmentId}
                    });

                    if(!queryResult){
                        error+='schoolSegmend Id doesn\'t exist in the database!';
                        errorMessage+='schoolSegment Id must be provided with a existing segment id in the database.';
                        errorStack+='schoolSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        schoolSegmentName=queryResult.name;

                        schoolSuperSegId=queryResult.superSegId;

                        schoolSuperSegName=queryResult.superSegName;

                        schoolSegmentHandle = `${user.fname}@${school_Details.faculty}`
                    }
                }
            }

            if(homeSubSegmentId){
                if(!homeSegmentId){
                    error+='homeSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!isInteger(homeSubSegmentId)){
                    error+='homeSubSegment Id must be integer.';
                    errorMessage+='homeSubSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:homeSubSegmentId,segId:homeSegmentId}
                    });

                    if(!queryResult){
                        error+='homeSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='homeSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='homeSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        homeSubSegmentName=queryResult.name;
                    }
                }
            }

            if(workSubSegmentId){
                if(!workSegmentId){
                    error+='workSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!isInteger(workSubSegmentId)){
                    error+='workSubSegment Id must be integer.';
                    errorMessage+='workSubSegment Id must be provided in request body as an integer.';
                    errorStack+='workSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:workSubSegmentId,segId:workSegmentId}
                    });

                    if(!queryResult){
                        error+='workSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='workSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='workSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        workSubSegmentName=queryResult.name;
                    }
                }
            }

            if(schoolSubSegmentId){
                if(!schoolSegmentId){
                    error+='homeSegmend Id must be provide if request body contains homeSubSegmentId.';
                    errorMessage+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                    errorStack+='In order to assign user a subsegment, segmentId must be provided with sub segment id.';
                }

                if(!isInteger(schoolSubSegmentId)){
                    error+='homeSubSegment Id must be integer.';
                    errorMessage+='homeSubSegment Id must be provided in request body as an integer.';
                    errorStack+='homeSubSegment Id must be provided in request body as an integer.';
                }else{
                    const queryResult = await prisma.subSegments.findFirst({
                        where:{id:schoolSubSegmentId,segId:schoolSegmentId}
                    });

                    if(!queryResult){
                        error+='schoolSubSegment Id doesn\'t exist in the database!';
                        errorMessage+='schoolSubSegement Id must be provided with a existing segment id in the database.';
                        errorStack+='schoolSubSegment Id must be provided with a existing segment id in the database.';
                    }else{
                        schoolSubSegmentName=queryResult.name;
                    }
                }
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

            const result = await prisma.userSegments.update({
                where:{id:updateId},
                data:{
                    homeSuperSegId:homeSuperSegId,
                    homeSuperSegName:homeSuperSegName,
                    workSuperSegId:workSuperSegId,
                    workSuperSegName:workSuperSegName,
                    schoolSuperSegId:schoolSuperSegId,
                    schoolSuperSegName:schoolSegmentName,
                    homeSegmentId:homeSegmentId,
                    homeSegmentName:homeSegmentName,
                    workSegmentId:workSegmentId,
                    workSegmentName:workSegmentName,
                    schoolSegmentId:schoolSegmentId,
                    schoolSegmentName:schoolSegmentName,
                    homeSubSegmentId:homeSubSegmentId,
                    homeSubSegmentName:homeSubSegmentName,
                    workSubSegmentId:workSubSegmentId,
                    workSubSegmentName:workSubSegmentName,
                    schoolSubSegmentId:schoolSubSegmentId,
                    schoolSubSegmentName:schoolSubSegmentName,
                    homeSegHandle:homeSegmentHandle,
                    workSegHandle:workSegmentHandle,
                    schoolSegHandle:schoolSegmentHandle
                }
            })

            res.status(200).json(result);

        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to update a userSegment.",
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

userSegmentRouter.get(
    '/homeSegment',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const result = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!result){
                return res.status(404).json("user segment not found!");
            }

            if(result.homeSegmentId){
                const homeSeg = await prisma.segments.findUnique({
                    where:{segId:result.homeSegmentId}
                });

                return res.status(200).json(homeSeg);
            }else{
                return res.sendStatus(204);
            }

        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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

userSegmentRouter.get(
    '/workSegment',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const result = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!result){
                res.status(404).json("user segment not found!");
            }

            if(result.workSegmentId){
                const workSeg = await prisma.segments.findUnique({
                    where:{segId:result.workSegmentId}
                });

                return res.status(200).json(workSeg);
            }else{
                return res.sendStatus(204);
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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

userSegmentRouter.get(
    '/schoolSegment',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const result = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!result){
                res.status(404).json("user segment not found!");
            }

            if(result.schoolSegmentId){
                const schoolSeg = await prisma.segments.findUnique({
                    where:{segId:result.schoolSegmentId}
                });

                return res.status(200).json(schoolSeg);
            }else{
                return res.sendStatus(204);
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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

userSegmentRouter.get(
    '/homeSubSegment',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const result = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!result){
                res.status(404).json("user segment not found!");
            }


            if(result.homeSubSegmentId){
                const homeSubSeg = await prisma.subSegments.findUnique({
                    where:{id:result.homeSubSegmentId}
                });

                return res.status(200).json(homeSubSeg);
            }else{
                return res.sendStatus(204);
            }            
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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

userSegmentRouter.get(
    '/workSubSegment',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const result = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!result){
                res.status(404).json("user segment not found!");
            }

            if(result.workSubSegmentId){
                const workSubSeg = await prisma.subSegments.findUnique({
                    where:{id:result.workSubSegmentId}
                });

                return res.status(200).json(workSubSeg);
            }else{
                return res.sendStatus(204);
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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

userSegmentRouter.get(
    '/schoolSubSegment',
    passport.authenticate('jwt',{session:false}),
    async(req,res)=>{
        try{
            //get email and user id from request
            const { email, id } = req.user;

            const result = await prisma.userSegments.findFirst({
                where:{userId:id}
            })

            if(!result){
                res.status(404).json("user segment not found!");
            }

            if(result.schoolSubSegmentId){
                const schoolSubSeg = await prisma.subSegments.findUnique({
                    where:{id:result.schoolSubSegmentId}
                });

                return res.status(200).json(schoolSubSeg);
            }else{
                return res.sendStatus(204);
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a userSegment.",
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

userSegmentRouter.get(
    '/getSegmentByName/:name',
    async(req,res)=>{
        try{
            const {name} = req.params;

            const result = await prisma.segments.findFirst({
                where:{name:name}
            })

            if(!result){
                res.status(404).json("segment not found!");
            }

            return res.status(200).json(result);
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve a segment.",
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

module.exports = userSegmentRouter;