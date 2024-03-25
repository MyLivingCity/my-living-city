const passport = require('passport');
const express = require('express');
const segmentRouter = express.Router();
const prisma = require('../lib/prismaClient');

const { isEmpty, isInteger, isString } = require('lodash');
const { UserType } = require('@prisma/client');

segmentRouter.post(
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
            //User must be admin to create segment
            if (theUser.userType == 'SUPER_ADMIN' || theUser.userType == 'ADMIN' || theUser.userType == 'MOD') {
                const { country, province, name, superSegName } = req.body;

                console.log(req.body);

                let theSuperSegId;

                //if there's no object in the request body
                if (isEmpty(req.body)) {
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage: 'Creating a segment must supply necessary fields explicitly.',
                            errorStack: 'necessary fields must be provided in the body with valid values',
                        }
                    })
                }
                //if country field is missing
                if (!country || !isString(country)) {
                    error += 'A segment must has a country field. ';
                    errorMessage += 'Creating a segment must explicitly be supplied with a country field. ';
                    errorStack += 'cuntry must be provided in the body with a valid value. ';
                }

                //if province is missing
                if (!province || !isString(province)) {
                    error += 'A segment must has a province field. ';
                    errorMessage += 'Creating a segment must explicitly be supplied with a province field. ';
                    errorStack += 'province must be provided in the body with a valid value. ';
                }

                if (!name || !isString(province)) {
                    error += 'A segment must has a name field. ';
                    errorMessage += 'Creating a segment must explicitly be supplied with a name field. ';
                    errorStack += 'name must be provided in the body with a valid value. ';
                }

                if (!superSegName || !isString(superSegName)) {
                    error += 'A segment must has a super segment name field. ';
                    errorMessage += 'Creating a segment must explicitly be supplied with a super segment name field. ';
                    errorStack += 'Super segment name must be provided in the body with a valid value. ';
                } else {
                    theSuperSeg = await prisma.superSegment.findFirst({ where: { name: superSegName.toUpperCase() } });

                    if (!theSuperSeg) {
                        error += 'A segment must has a valid super segment name field. ';
                        errorMessage += 'Creating a segment must explicitly be supplied with a valid super segment name field. ';
                        errorStack += 'Super segment name must be provided in the body with a valid value, which can match a super segment in the database. ';
                    } else {
                        theSuperSegId = theSuperSeg.superSegId;
                    }
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

                //create a segement table item
                const createSegment = await prisma.segments.create({
                    data: {
                        country: country,
                        province: province,
                        name: name,
                        superSegId: theSuperSegId,
                        superSegName: superSegName
                    }
                })

                res.status(200).json(createSegment);
            } else {
                return res.status(403).json({
                    message: "You don't have the right to add a segment!",
                    details: {
                        errorMessage: 'In order to create a segment, you must be an admin user.',
                        errorStack: 'user must be an admin if they want to create a segment',
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to create a segment.",
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

segmentRouter.get(
    '/getAll',
    async (req, res) => {
        try {
            const result = await prisma.segments.findMany();
            console.log(result);
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve segments.",
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
// segmentRouter.get(
//     '/getByProv',
//     async(req,res) => {
//         try{
//             const {province, country} = req.body;
//             const result = await prisma.segments.findMany(
//                 where:{province: province}
//             );
//             console.log(result);
//             res.status(200).send(result);
//         }catch(error){
//             console.log(error);
//             res.status(400).json({
//                 message: "An error occured while trying to retrieve segments.",
//                 details: {
//                     errorMessage: error.message,
//                     errorStack: error.stack,
//                 }
//             });
//         }finally{
//             await prisma.$disconnect();
//         }
//     }
// );

segmentRouter.get(
    '/getBySuperSegId/:superSegId',
    async(req,res) => {
        try {
        let {superSegId} = req.params;
        superSegId = parseInt(superSegId, 10);
        if(!isInteger(superSegId)){
            return res.status(400).json("super segment id is invalid. ")
        }

        const theSuperSegment = await prisma.superSegment.findUnique({
            where: { superSegId: superSegId }
        })

        if (!theSuperSegment) {
            return res.status(404).json("super segment id is not in the database! ")
        }

        const segments = await prisma.segments.findMany({
            where: { superSegId: superSegId }
        });

        res.status(200).json(segments);
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to retrieve segments.",
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

segmentRouter.get(
    '/getBySegmentId/:segmentId',
    async (req, res, next) => {
        try {
            const parsedSegId = parseInt(req.params.segmentId);

            // Check if id is valid
            if (!parsedSegId) {
                return res.status(400).json({
                    message: `A valid segmentId must be specified in the route parameter`
                });
            }
            if (parsedSegId) {
                const foundSegment = await prisma.segments.findUnique({
                    where: { segId: parsedSegId }
                });
                if (foundSegment) {
                    res.status(200).json(foundSegment);
                }
                if (!foundSegment) {
                    return res.status(400).json({
                        message: `The segment with listed ID (${parsedSegId}) does not exist.`,
                    });
                }
            } else {
                res.status(404).json("segmentId is not found!");
            }





        } catch (error) {
            res.status(400).json({
                message: "An error occured while trying to fetch all segments",
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

segmentRouter.get(
    '/getBySubSegmentId/:SubSegmentId',
    async (req, res, next) => {
        try {
            const parsedSubSegId = parseInt(req.params.SubSegmentId);

            // // Check if id is valid
            // if (!parsedSubSegId) {
            //     res.status(404).json("subSegmentId is not found!");
            //     //return res.sendStatus(204);
            // }

            if (parsedSubSegId) {
                const foundSubSegment = await prisma.subSegments.findUnique({
                    where: { id: parsedSubSegId }
                });
                if (foundSubSegment) {
                    res.status(200).json(foundSubSegment);
                }
                if (!foundSubSegment) {
                    return res.status(404).json({
                        message: `The subSegment with listed ID (${parsedSubSegId}) does not exist.`,
                    });
                }

            } else {
                res.status(404).json("subSegmentId is not found!");
            }


        } catch (error) {
            res.status(400).json({
                message: "An error occured while trying to fetch all subSegments",
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

segmentRouter.delete(
    '/delete/:segmentId',
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
            //Only admin can delete segment
            if (theUser.userType == 'SUPER_ADMIN' || theUser.userType == 'ADMIN') {
                const { segmentId } = req.params;
                const parsedSegmentId = parseInt(segmentId);
                const theSegment = await prisma.segments.findUnique({
                    where: {
                        segId: parsedSegmentId
                    }
                });

                if (!theSegment) {
                    return res.status(404).json("the segment need to be deleted not found!");
                } else {
                    await prisma.segments.delete({
                        where: {
                            segId: parsedSegmentId
                        }
                    });
                    res.sendStatus(204);
                }
            } else {
                return res.status(403).json({
                    message: "You don't have the right to delete a segment!",
                    details: {
                        errorMessage: 'In order to delete a segment, you must be an admin user.',
                        errorStack: 'user must be an admin if they want to delete a segment',
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to delete a segment.",
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

segmentRouter.post(
    '/update/:segmentId',
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
            //User must be admin to create segment
            if (theUser.userType == 'SUPER_ADMIN' || theUser.userType == 'ADMIN') {
                const { segmentId } = req.params;

                const parsedSegmentId = parseInt(segmentId);

                const { country, province, name, superSegId, superSegName } = req.body;

                console.log(req.body);

                let error = '';
                let errorMessage = '';
                let errorStack = '';

                //if there's no object in the request body
                if (isEmpty(req.body)) {
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage: 'Updating a segment must supply necessary fields explicitly.',
                            errorStack: 'necessary fields must be provided in the body with valid values',
                        }
                    })
                }
                //find the segment which need to be updated
                const theSegment = await prisma.segments.findUnique({
                    where: {
                        segId: parsedSegmentId
                    }
                });

                if (!theSegment) {
                    res.status(404).json("the segment need to be updated not found!");
                } else {

                    if (country && !isString(country)) {
                        error += 'A segment must has a country field. ';
                        errorMessage += 'Updating a segment must explicitly be supplied with a country field. ';
                        errorStack += 'cuntry must be provided in the body with a valid value. ';
                    }

                    if (province && !isString(province)) {
                        error += 'A segment must has a province field. ';
                        errorMessage += 'Updating a segment must explicitly be supplied with a province field. ';
                        errorStack += 'province must be provided in the body with a valid value. ';
                    }

                    if (name && !isString(name)) {
                        error += 'A segment must has a name field. ';
                        errorMessage += 'Updating a segment must explicitly be supplied with a name field. ';
                        errorStack += 'name must be provided in the body with a valid value. ';
                    }

                    if (superSegId && !isInteger(superSegId)) {
                        error += 'A segment must has a super segment id. ';
                        errorMessage += 'Updating a segment must explicitly be supplied with a super segment id. '
                        errorStack += 'super segment id must be provided in the body with a valid value. '
                    } else if (segmentId && isInteger(superSegId)) {
                        const theSuperSegment = await prisma.superSegment.findUnique({
                            where: { superSegId: superSegId }
                        });

                        if (!theSuperSegment) {
                            error += 'A segment must has a valid super segment id. ';
                            errorMessage += 'Updating a segment must explicitly be supplied with a valid super segment id. '
                            errorStack += 'Valid super segment id must be provided in the body. '
                        }
                    }

                    if (superSegName && !isString(superSegName)) {
                        error += 'A segment must has a super segment name as string. ';
                        errorMessage += 'Updating a segment must explicitly be supplied with a super segment name as string. '
                        errorStack += 'super segment id must be provided in the body with a valid value and type. '
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

                    const result = await prisma.segments.update({
                        where: { segId: parsedSegmentId },
                        data: {
                            country: country,
                            province: province,
                            name: name,
                            superSegId: superSegId,
                            superSegName: superSegName
                        }
                    });
                    res.status(200).json(result);
                }
            } else {
                return res.status(403).json({
                    message: "You don't have the right to update a segment!",
                    details: {
                        errorMessage: 'In order to delete a segment, you must be an admin or business user.',
                        errorStack: 'user must be an admin if they want to delete a segment',
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to update a segment.",
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

//get segment by name endpoint

segmentRouter.post(
    '/getByName',
    async (req, res) => {
        let error = '';
        let errorMessage = '';
        let errorStack = '';
        try {
            //if there's no object in the request body
            if (isEmpty(req.body)) {
                return res.status(400).json({
                    message: 'The objects in the request body are missing',
                    details: {
                        errorMessage: 'Finding a segment must supply necessary fields explicitly.',
                        errorStack: 'necessary fields must be provided in the body with valid values',
                    }
                })
            }

            const { country, province, segName } = req.body;

            if (!country) {
                error += 'Query must has a country field. ';
                errorMessage += 'Query must explicitly be supplied with a country field. ';
                errorStack += 'cuntry must be provided in the body with a valid value. ';
            }

            if (!isString(country) || country.length < 2 || country.length > 40) {
                error += 'Country value must be valid ';
                errorMessage += 'Country must be string with 2-40 characters ';
                errorStack += 'Country must be string with 2-40 characters ';
            }

            if (!province) {
                error += 'Query must has a province field. ';
                errorMessage += 'Query must explicitly be supplied with a province field. ';
                errorStack += 'Province must be provided in the body with a valid value. ';
            }

            if (!isString(province) || province.length < 2 || province.length > 40) {
                error += 'Province value must be valid ';
                errorMessage += 'Province must be string with 2-40 characters ';
                errorStack += 'Province must be string with 2-40 characters ';
            }

            if (!segName) {
                error += 'Query must has a segName field. ';
                errorMessage += 'Query must explicitly be supplied with a segName field. ';
                errorStack += 'segName must be provided in the body with a valid value. ';
            }

            if (!isString(segName) || segName.length < 2 || segName.length > 40) {
                error += 'segName value must be valid ';
                errorMessage += 'segName must be string with 2-40 characters ';
                errorStack += 'segName must be string with 2-40 characters ';
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

            const result = await prisma.segments.findFirst({
                where: {
                    country: country,
                    province: province,
                    name: { contains: segName }
                }
            });

            // if(!result){
            //     return res.status(404).json("Segment not found!");
            // }

            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to find a segment.",

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

segmentRouter.get(
    '/aggregateInfo/:segmentId',
    async (req, res) => {
        try {
            const home = await prisma.userSegments.findMany({
                where: {
                    homeSegmentId: parseInt(req.params.segmentId)
                },
            })

            const work = await prisma.userSegments.findMany({
                where: {
                    workSegmentId: parseInt(req.params.segmentId)
                },
            })

            const student = await prisma.userSegments.findMany({
                where: {
                    schoolSegmentId: parseInt(req.params.segmentId)
                },
            })

            const allUsers = [...home, ...work, ...student];
            const uniqueUser = [];
            allUsers.forEach(user => {
                if (!uniqueUser.includes(user.id)) {
                    uniqueUser.push(user.id);
                }
            });

            const idea = await prisma.idea.findMany({
                where: {
                    segmentId: parseInt(req.params.segmentId)
                }
            })

            const ideaIds = idea.map((idea) => idea.id);

            const proposal = await prisma.proposal.aggregate({
                where: {
                    ideaId: {
                        in: ideaIds
                    }
                },
                _count: true
            })

            const project = await prisma.project.aggregate({
                where: {
                    ideaId: {
                        in: ideaIds
                    }
                },
                _count: true
            })

            const subSegments = await prisma.subSegments.findMany({
                where: {
                    segId: parseInt(req.params.segmentId)
                }
            })

            const superSegment = await prisma.segments.findFirst({
                where: {
                    segId: parseInt(req.params.segmentId)
                }
            })

            const subsegmentNames = subSegments.map((subSegment) => subSegment.name);

            const result = {
                "totalUsers": uniqueUser.length,
                "residents": home.length,
                "workers": work.length,
                "students": student.length,
                "ideas": ideaIds.length,
                "proposals": proposal._count,
                "projects": project._count,
                "superSegmentName": superSegment.superSegName,
                "subSegmentsCount": subSegments.length,
                "subSegments": subsegmentNames,
            }

            res.status(200).json(result);

        } catch (error) {
            console.log(error);
            res.status(400).end();
        } finally {
            await prisma.$disconnect();
        }
    }
)

segmentRouter.get(
    '/usersInfo/:segmentId',
    async (req, res) => {
        try {
            const home = await prisma.user.findMany({
                where: {
                    userSegments: {
                        is: {
                            homeSegmentId: parseInt(req.params.segmentId)
                        }
                    }
                },
                include: {
                    userSegments: true,
                    address: true
                }
            })

            const work = await prisma.user.findMany({
                where: {
                    userSegments: {
                        is: {
                            workSegmentId: parseInt(req.params.segmentId)
                        }
                    }
                },
                include: {
                    userSegments: true,
                    Work_Details: true
                }
            })

            const student = await prisma.user.findMany({
                where: {
                    userSegments: {
                        is: {
                            schoolSegmentId: parseInt(req.params.segmentId)
                        }
                    }
                },
                include: {
                    userSegments: true,
                    School_Details: true
                }
            })

            const segment = await prisma.segments.findFirst({
                where: {
                    segId: parseInt(req.params.segmentId)
                }
            })

            const allUsers = [...home, ...work, ...student];
            const uniqueUser = [];
            allUsers.forEach(user => {
                if (!uniqueUser.includes(user.id)) {
                    uniqueUser.push(user.id);
                }
            });

            const result = {
                "segId": req.params.segmentId,
                "totalUsers": uniqueUser.length,
                "residents": home,
                "workers": work,
                "students": student,
                "segment": segment
            }

            res.status(200).json(result);

        } catch (error) {
            console.log(error);
            res.status(400).end();
        } finally {
            await prisma.$disconnect();
        }
    }
)

module.exports = segmentRouter;