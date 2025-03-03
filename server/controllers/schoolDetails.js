const passport = require('passport');
const express = require('express');
const schoolDetailsRouter = express.Router();
const prisma = require('../lib/prismaClient');

schoolDetailsRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            console.log("TESTER1234,   Made it to schooDetails")
            console.log("Check Date",req.body.schoolDetails.programCompletionDate)
            const schoolDate = req.body.schoolDetails.programCompletionDate && !isNaN(Date.parse(req.body.schoolDetails.programCompletionDate))
            ? new Date(req.body.schoolDetails.programCompletionDate)
            : new Date();
            console.log("TESTER1234,   Created Date")
            console.log(schoolDate)
            console.log(req)
            const schoolDetails = await prisma.school_Details.create({
                
                data: {
                    streetAddress: req.body.schoolDetails.streetAddress || "",
                    postalCode: req.body.schoolDetails.postalCode || "",
                    faculty: req.body.schoolDetails.faculty || "",
                    programCompletionDate: schoolDate,
                    userId: req.body.userId,
                },
            });
            res.status(200).json(schoolDetails);
        } catch (error) {
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)

// Deletes school details as well as the school userSegments
schoolDetailsRouter.delete(
    '/delete/:id',
    async (req, res) => {    
        try {
            const schoolDetails = await prisma.school_Details.findFirst({
                where: { userId: req.params.id },
            });

            if (!schoolDetails) {
                res.status(400).json({ error: 'School details not found' });
                return;
            } else {

                await prisma.school_Details.delete({
                    where : {id: schoolDetails.id},
                });

                await prisma.userSegments.deleteMany({
                    where: {
                        userId: req.params.id,
                        userSegmentRelationship: 'SCHOOL',
                    },
                });
                
                res.status(204).send();
                return;
            }
        } catch (error) {
            res.status(500).json({ error: 'An internal server error occurred' });
        } finally { 
            await prisma.$disconnect();
        }
    }
)

schoolDetailsRouter.get(
    '/get/:id',
    async (req, res) => {
        try {
            const schoolDetails = await prisma.school_Details.findFirst({
                where: {
                    userId: req.params.id,
                },
            });
            console.log('schoolDetails', schoolDetails);
            res.status(200).json(schoolDetails);
        } catch (error) {
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)

schoolDetailsRouter.patch(
    '/update/:id',
    async (req, res) => {
        try {
            const profile = await prisma.school_Details.findFirst({
                where: { userId: req.params.id },
            });
         
            if (!profile) {
                // Create a new profile
                const schoolDetails = await prisma.school_Details.create({
                    data: {
                        streetAddress: req.body.streetAddress,
                        postalCode: req.body.postalCode,
                        displayFName: req.body.displayFName,
                        displayLName: req.body.displayLName,
                        userId: req.params.id,
                    },
                });
                res.status(200).json(schoolDetails);
            } else {
                console.log(req.body)
                const schoolDetails = await prisma.school_Details.update({
                where: {
                    id: profile.id,
                },
                data: {
                    streetAddress: req.body.streetAddress,
                    postalCode: req.body.postalCode,
                    displayFName: req.body.displayFName,
                    displayLName: req.body.displayLName,
                    updatedAt: new Date(),
                },
            });
            const userDetails = await prisma.userSegments.update({ where: {
                userId: req.params.id,
            },
            data: {
              schoolSegHandle: req.body.displayFName + "@" + req.body.displayLName,
            },})
            res.status(200).json(schoolDetails);
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)

// Updates the usersegment to match the new data
schoolDetailsRouter.patch(
    '/updateCityNeighbourhood/:id',
    async (req, res) => {
        try {

            const { city, neighbourhood } = req.body;
            const userId = req.params.id;

            // If neighbourhood is removed, delete only the subSegment entry in UserSegment
            if (!neighbourhood) {
                const userSubSegment = await prisma.userSegment.findFirst({
                    where: {
                        userId,
                        userSegmentRelationship: 'SCHOOL',
                        segment: {
                            segmentType: 'subSegment',
                        },
                    },
                    select: { id: true },
                });

                if (userSubSegment) {
                    await prisma.userSegment.delete({
                        where: { id: userSubSegment.id },
                    });
                }

                res.status(200).json({
                    message: 'Neighbourhood removed, userSegment deleted successfully',
                });

                return;
            }

            // Find the city and neighbourhood in the Segments table
            const citySegment = await prisma.segments.findFirst({
                where: { name: { equals: city, mode: 'insensitive' } },
            });

            const neighbourhoodSegment = await prisma.segments.findFirst({
                where: { name: { equals: neighbourhood, mode: 'insensitive' } },
            });

            const segmentId = citySegment ? citySegment.segId : null;
            const subSegmentId = neighbourhoodSegment ? neighbourhoodSegment.segId : null

            if (segmentId) {
                await prisma.userSegment.upsert({
                    where: {
                        id: (
                            await prisma.userSegment.findFirst({
                                where: {
                                    userId,
                                    userSegmentRelationship: 'SCHOOL',
                                    segment: { segmentType: 'segment' },
                                },
                                select: { id: true },
                            })
                        )?.id ?? -1, // -1 triggers an insert
                    },
                    update: { segmentId },
                    create: {
                        userId,
                        userSegmentRelationship: 'SCHOOL',
                        segmentId,
                    },
                });
            }

            // If there is a neighborhood/subseg, then update that neighborhood
            if (subSegmentId) {
                await prisma.userSegment.upsert({
                    where: {
                        id: (
                            await prisma.userSegment.findFirst({
                                where: {
                                    userId,
                                    userSegmentRelationship: 'SCHOOL',
                                    segment: { segmentType: 'subSegment' },
                                },
                                select: { id: true },
                            })
                        )?.id ?? -1, // -1 triggers an insert
                    },
                    update: { segmentId: subSegmentId },
                    create: {
                        userId,
                        userSegmentRelationship: 'SCHOOL',
                        segmentId: subSegmentId,
                    },
                });
            }
            res.status(200).json({
                message: 'City and neighbourhood updated successfully',
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
        
    }
);

module.exports = schoolDetailsRouter;