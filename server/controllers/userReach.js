const passport = require('passport');

const express = require('express');
const userReachRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { isEmpty, isString, isNumber, isArray } = require('lodash');
const { UserType } = require('@prisma/client');

userReachRouter.get(
    '/',
    async (req, res, next) => {
        try {
            res.json({
                route: 'welcome to reach Router!'
        })
        } catch (err) {
            res.status(400).json({
                message: err.message,
                details: {
                    errorMessage: err.message,
                    errorStack: err.stack,
                }
            })
        }
    }
)

userReachRouter.post(
    '/create',
    passport.authenticate('jwt', {session: false}),
    async (req, res, next) => {
        try {
            // If request body is empty
            if (isEmpty(req.body)) {
                return res.status(400).json({
                    message: 'The objects in the request body are missing'
                })
            }
            const {userId, segId} = req.body;

            if (!userId || !isString(userId)) {
                return res.status(400).json({
                    message: "userId is missing from the request body is it's in incorrect format!"
                })
            }

            if (!segId || !isNumber(segId)) {
                return res.status(400).json({
                    message: "segId is missing from the request body is it's in incorrect format!"
                })
            }

            const theUser = await prisma.user.findUnique({ where: {id: userId}});
            const theSegment = await prisma.segments.findUnique({ where: {segId: segId}});

            if (!theUser) {
                return res.status(400).json({
                    message: `The user with id ${userId} cannot be found!`
                });
            }

            if (!theUser.userType === UserType.IN_PROGRESS) {
                return res.status(400).json({
                    message: `Complete your account payment first before adding a new reach!`,
                    details: {
                        errorMessage: `Only Business or Community User may have reach segments!`
                    }
                });
            }

            if (![UserType.BUSINESS, UserType.COMMUNITY, UserType.IN_PROGRESS].includes(theUser?.userType)) {
                return res.status(400).json({
                    message: `User is not allowed to have reach segments`,
                    details: {
                        errorMessage: `Only Business or Community User may have reach segments!`
                    }
                });
            }

            if (!theSegment) {
                return res.status(400).json({
                    message: `The Segment with id ${segId} cannot be found!`
                });
            }
            const newUserReach = await prisma.userReach.upsert({
                where: {
                    user_reach_unique: {
                        segId: segId,
                        userId: userId
                    },
                },
                create: {
                    segId: segId,
                    userId: userId
                },
                update: {}
            });
            res.status(200).json(newUserReach); 

        } catch (error) {
            console.log(`Error ${error}`);
            res.status(400).json({
                message: `An error occured when trying to create userReach!`
            })
        }  finally {
            await prisma.$disconnect();
        }
    }
)

userReachRouter.post(
    '/replaceReachSegments',
    passport.authenticate('jwt', {session: false}),
    async (req, res, next) => {
        try {
            // If request body is empty
            if (isEmpty(req.body)) {
                return res.status(400).json({
                    message: 'The objects in the request body are missing'
                })
            }
            const {userId, segIds} = req.body;

            if (!userId || !isString(userId)) {
                return res.status(400).json({
                    message: "userId is missing from the request body is it's in incorrect format!"
                })
            }

            if (!segIds || !isArray(segIds)) {
                return res.status(400).json({
                    message: "segIds are missing from the request body is it's in incorrect format!"
                })
            }

            const theUser = await prisma.user.findUnique({ where: {id: userId}});
            const theSegments = await prisma.segments.findMany({
                where: {
                    segId: {
                        in: segIds
                    }
                }
            });

            if (!theUser) {
                return res.status(400).json({
                    message: `The user with id ${userId} cannot be found!`
                });
            }

            if (!theUser.userType === UserType.IN_PROGRESS) {
                return res.status(400).json({
                    message: `Complete your account payment first before adding a new reach!`,
                    details: {
                        errorMessage: `Only Business or Community User may have reach segments!`
                    }
                });
            }

            if (![UserType.BUSINESS, UserType.COMMUNITY, UserType.IN_PROGRESS].includes(theUser?.userType)) {
                return res.status(400).json({
                    message: `User is not allowed to have reach segments`,
                    details: {
                        errorMessage: `Only Business or Community User may have reach segments!`
                    }
                });
            }
            console.log(theSegments);
            for (let segId of segIds) {
                if (!theSegments.some(segment => segment.segId === segId)) {
                    return res.status(400).json({
                        message: `The Segment with id ${segId} cannot be found!`
                    });
                }
            }

            // Delete all old records matching the userId
            await prisma.userReach.deleteMany({
                where: {
                    userId: userId
                }
            });

            // Prepare new records
            const newRecords = segIds.map(segId => ({
                segId: segId,
                userId: userId
            }));

            // Insert all new records
            const newUserReach = await prisma.userReach.createMany({
                data: newRecords
            });

            res.status(200).json(newUserReach);

        } catch (error) {
            console.log(`Error ${error}`);
            res.status(400).json({
                message: `An error occured when trying to create userReach!`
            })
        }  finally {
            await prisma.$disconnect();
        }
    }
)

userReachRouter.post(
    '/getUserSegments',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            if (isEmpty(req.body)) {
                return res.status(400).json({
                    message: 'The objects in the request body are missing'
                })
            }

            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: 'UserId is missing in request body'
                })
            }

            const theUser = await prisma.user.findUnique({ where: {id: userId}});
            if (!theUser) {
                return res.status(400).json({
                    message: `The user with id ${userId} cannot be found!`
                });
            }
            
            const userReaches = await prisma.userReach.findMany({ where: {userId: userId} });
            let segments = [];
            for await (const reach of userReaches) {
                segments.push(await prisma.segments.findUnique({where: {segId: reach.segId}}))
            }
            res.status(200).json(segments);
        } catch (error) {
            console.log("Error encountered when getting user reach segments!");
            console.log(error);
            res.status(400).json({
                message: "Error encountered when getting user reach segments!"
            })
        } finally {
            await prisma.$disconnect();
        }
    }
)


module.exports = userReachRouter;
