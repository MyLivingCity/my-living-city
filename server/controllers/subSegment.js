const passport = require('passport');
const express = require('express');
const subSegmentRouter = express.Router();
const prisma = require('../lib/prismaClient');

const { isEmpty, isNumber, isString, isInteger } = require('lodash');
const { UserType } = require('@prisma/client');


subSegmentRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            let error = '';
            let errorMessage = '';
            let errorStack = '';
            //get email and user id from request
            const { email, id } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where: { id: id },
                select: { userType: true }
            });
            //User must be admin to create subsegment
            if (theUser.userType == 'ADMIN') {
                const { segId, name, lat, lon, radius } = req.body;

                //if there's no object in the request body
                if (isEmpty(req.body)) {
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage: 'Creating a subsegment must supply necessary fields explicitly.',
                            errorStack: 'necessary fields must be provided in the body with valid values',
                        }
                    })
                }
                //if sedId is missing
                if (!segId) {
                    error += 'A subsegment must has a segId field. ';
                    errorMessage += 'Creating a subsegment must explicitly be supplied with a segId field. ';
                    errorStack += 'segId must be provided in the body with a valid value. ';
                } else {
                    //if segId provided, check whether can be found in the database
                    const theSeg = await prisma.segments.findUnique({
                        where: {
                            segId: segId
                        }
                    });
                    //if the segId can't be found in the database
                    if (!theSeg) {
                        error += 'A subsegment must has a segId which matches one exising segment\'s segId';
                        errorMessage += 'Creating a subsegment must explicitly be supplied with a segId value which can be found in segment table. ';
                        errorStack += 'segId must be provided in the body with a valid value. ';
                    }
                }

                //if name field is not provided
                if (!name) {
                    error += 'A subsegment must has a name field. ';
                    errorMessage += 'Creating a subsegment must explicitly be supplied with a name field. ';
                    errorStack += 'name must be provided in the body with a valid value. ';
                }

                //if lat is provided and lat is not valid
                if (lat && !isNumber(lat)) {
                    error += 'A subsegment must has a lat field with a valid value. ';
                    errorMessage += 'Creating a subsegment must explicitly be supplied with a lat field. ';
                    errorStack += 'lat must be provided in the body with a valid value. ';
                }

                //if lon is provided and lon is not valid
                if (lon && !isNumber(lon)) {
                    error += 'A subsegment must has a lon field with a valid value. ';
                    errorMessage += 'Creating a subsegment must explicitly be supplied with a lon field. ';
                    errorStack += 'lon must be provided in the body with a valid value. ';
                }

                //if radius is provided and radius is not valid
                if (radius && !isNumber(radius)) {
                    error += 'A subsegment must has a radius field with a valid value. ';
                    errorMessage += 'Creating a subsegment must explicitly be supplied with a radius field. ';
                    errorStack += 'radius must be provided in the body with a valid value. ';
                }

                //If there's error in error holder
                if (error || errorMessage || errorStack) {
                    return res.status(400).json({
                        message: error,
                        details: {
                            errorMessage: errorMessage,
                            errorStack: errorStack
                        }
                    });
                }

                const result = await prisma.subSegments.create({
                    data: {
                        segRef: {
                            connect: { segId: segId }
                        },
                        name: name,
                        lat: lat,
                        lon: lon,
                        radius: radius
                    }
                });

                res.status(200).json(result);

            } else {
                return res.status(403).json({
                    message: "You don't have the right to add a subsegment!",
                    details: {
                        errorMessage: 'In order to create a subsegment, you must be an admin or business user.',
                        errorStack: 'user must be an admin if they want to create a subsegment',
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to create a subsegment.",
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

subSegmentRouter.delete(
    '/delete/:subSegmentId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            //get email and user id from request
            const { email, id } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where: { id: id },
                select: { userType: true }
            });

            if (theUser.userType == 'ADMIN') {
                const { subSegmentId } = req.params;

                const parsedSubSegmentId = parseInt(subSegmentId);

                const theSubSegment = await prisma.subSegments.findUnique({
                    where: {
                        id: parsedSubSegmentId
                    }
                });
                //if the subsegment not found
                if (!theSubSegment) {
                    res.status(404).json("subsegment need to be deleted not found");
                } else {
                    await prisma.subSegments.delete({
                        where: {
                            id: parsedSubSegmentId
                        }
                    })

                    res.sendStatus(204);
                }
            } else {
                return res.status(403).json({
                    message: "You don't have the right to delete a subsegment!",
                    details: {
                        errorMessage: 'In order to delete a subsegment, you must be an admin or business user.',
                        errorStack: 'user must be an admin if they want to delete a subsegment',
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to delete a subsegment.",
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

subSegmentRouter.get(
    '/getAll',
    async (req, res) => {
        try {
            console.log(req.body);
            const result = await prisma.subSegments.findMany();

            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to get all subsegments.",
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

subSegmentRouter.get(
    '/getBySubSegmentId/:subSegmentId',
    async (req, res) => {
        try {
            const { subSegmentId } = req.params;

            const parsedSubSegmentId = parseInt(subSegmentId);

            const theSubSegment = await prisma.subSegments.findUnique({
                where: {
                    id: parsedSubSegmentId
                }
            });

            if (!theSubSegment) {
                res.status(404).json("subsegment need to retrieved not found");
            } else {
                res.status(200).json(theSubSegment);
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to get that subsegment.",
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

subSegmentRouter.get(
    '/getBySegmentId/:segmentId',
    async (req, res) => {
        try {
            const { segmentId } = req.params;

            if (!segmentId) {
                res.status(400).json("segment id is missing");
            }

            const parsedSegmentId = parseInt(segmentId);

            const theSubSegments = await prisma.subSegments.findMany({
                where: {
                    segId: parsedSegmentId
                }
            });

            if (theSubSegments.length == 0) {
                res.status(404).json("subsegment need to retrieved not found");
            } else {
                res.status(200).send(theSubSegments);
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to get that subsegment.",
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

subSegmentRouter.post(
    '/update/:subSegmentId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            let error = '';
            let errorMessage = '';
            let errorStack = '';
            let theSegment;
            //get email and user id from request
            const { email, id } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where: { id: id },
                select: { userType: true }
            });

            if (theUser.userType == 'ADMIN') {
                const { subSegmentId } = req.params;


                const parsedSubSegmentId = parseInt(subSegmentId);

                const theSubSegment = await prisma.subSegments.findUnique({
                    where: {
                        id: parsedSubSegmentId
                    }
                })
                if (!theSubSegment) {
                    res.status(404).json("the subSegment need to be updated not found!");
                }
                //if there's no object in the request body
                if (isEmpty(req.body)) {
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage: 'Updating a subsegment must supply necessary fields explicitly.',
                            errorStack: 'necessary fields must be provided in the body with valid values',
                        }
                    })
                }

                const { segId, name, lat, lon, radius } = req.body;

                if (segId && !isInteger(segId)) {
                    error += 'A subsegment must has a valid segId field. ';
                    errorMessage += 'Creating a subsegment must explicitly be supplied with a valid segId field. ';
                    errorStack += 'segId must be provided in the body with a valid value. ';
                } else if (isInteger(segId)) {
                    theSegment = await prisma.segments.findUnique({
                        where: { segId: segId }
                    });
                    //if the segment not found
                    if (!theSegment) {
                        error += 'A subSegment must has a valid segment id field. ';
                        errorMessage += 'Updating a subsegment must explicitly be supplied with a valid segId field. ';
                        errorStack += 'segId must be provided in the body with a valid value. ';
                    }
                }

                if (name && !isString(name)) {
                    error += 'A subsegment must has a valid name field. ';
                    errorMessage += 'Updating a subsegment must explicitly be supplied with a name field. ';
                    errorStack += 'name must be provided in the body with a valid value. ';
                }

                if (lat && !isNumber(lat)) {
                    error += 'A subsegment must has a lat field with a valid value. ';
                    errorMessage += 'Updating a subsegment must explicitly be supplied with a lat field. ';
                    errorStack += 'lat must be provided in the body with a valid value. ';
                }

                if (lon && !isNumber(lon)) {
                    error += 'A subsegment must has a lon field with a valid value. ';
                    errorMessage += 'Updating a subsegment must explicitly be supplied with a lon field. ';
                    errorStack += 'lon must be provided in the body with a valid value. ';
                }

                if (radius && !isNumber(radius)) {
                    error += 'A subsegment must has a radius field with a valid value. ';
                    errorMessage += 'Updating a subsegment must explicitly be supplied with a radius field. ';
                    errorStack += 'radius must be provided in the body with a valid value. ';
                }
                //If there's error in error holder
                if (error || errorMessage || errorStack) {
                    return res.status(400).json({
                        message: error,
                        details: {
                            errorMessage: errorMessage,
                            errorStack: errorStack
                        }
                    });
                }

                const result = await prisma.subSegments.update({
                    where: { id: parsedSubSegmentId },
                    data: {
                        segId: segId,
                        name: name,
                        lat: lat,
                        lon: lon,
                        radius: radius
                    }
                });

                res.status(200).json(result);

            } else {
                return res.status(403).json({
                    message: "You don't have the right to add a subsegment!",
                    details: {
                        errorMessage: 'In order to create a subsegment, you must be an admin or business user.',
                        errorStack: 'user must be an admin if they want to create a subsegment',
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to update subsegment.",
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


module.exports = subSegmentRouter;