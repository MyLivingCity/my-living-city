const passport = require('passport');
const express = require('express');
const workDetailsRouter = express.Router();
const prisma = require('../lib/prismaClient');
const e = require('express');

workDetailsRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const workDetails = await prisma.work_Details.create({
                data: {
                    streetAddress: req.body.workDetails.streetAddress,
                    postalCode: req.body.workDetails.postalCode,
                    company: req.body.workDetails.company,
                    userId: req.body.userId,
                },
            });
            res.status(200).json(workDetails);
        } catch (error) {
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)

workDetailsRouter.delete(
    '/delete/:id',
    async (req, res) => {
        try {
            const workDetails = await prisma.work_Details.findFirst({
                where: { userId: req.params.id },
            });

            if (!workDetails) {
                res.status(400).json({ error: 'Work details not found' });
                return;
            } else {
                const workDetailsRemove = await prisma.work_Details.update({
                    where: {
                        id: workDetails.id,
                    },
                    data: {
                        displayFName: '',
                        displayLName: '',
                        streetAddress: '',
                        postalCode: '',
                        company: '',
                    },
                });

                await prisma.userSegment.updateMany({
                    where: {
                        userId: req.params.id,
                        userSegmentRelationship: 'WORK',
                        segment: {
                            segmentType: 'subSegment',
                        },
                    },
                    data: {
                        segmentId: null,
                    },
                });
                res.status(200).json({workDetailsRemove, userSegmentsWorkDetails});
                return;
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        } finally { 
            await prisma.$disconnect();
        }
    }
)

workDetailsRouter.get(
    '/get/:id',
    async (req, res) => {
        try {
            const workDetails = await prisma.work_Details.findFirst({
                where: {
                    userId: req.params.id,
                },
            });
            console.log('workDetails', workDetails);
            res.status(200).json(workDetails);
        } catch (error) {
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)

workDetailsRouter.patch(
    '/update/:id',
    async (req, res) => {
        try {
            const profile = await prisma.work_Details.findFirst({
                where: { userId: req.params.id },
            });
            console.log('profile', profile);

            if (!profile) {
                // Create a new profile
                const workDetails = await prisma.work_Details.create({
                    data: {
                        streetAddress: req.body.streetAddress,
                        postalCode: req.body.postalCode,
                        displayFName: req.body.displayFName,
                        displayLName: req.body.displayLName,
                        userId: req.params.id,
                    },
                });
                res.status(200).json(workDetails);
            } else {                    
                const workDetails = await prisma.work_Details.update({
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

                await prisma.userHandle.updateMany({
                    where: {
                        userId: req.params.id,
                        userSegmentRelationship: 'WORK',
                    },
                    data: {
                        handle: req.body.displayFName + "@" + req.body.displayLName,
                    },
                });
                

            res.status(200).json(workDetails);
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)

workDetailsRouter.patch(
    '/updateCityNeighbourhood/:id',
    async (req, res) => {
        try {
            const { city, neighbourhood } = req.body;
            const userId = req.params.id;

            // If neighbourhood is removed, delete only the subSegment entry in UserSegment
            if (!neighbourhood) {
                await prisma.userSegment.updateMany({
                    where: {
                        userId,
                        userSegmentRelationship: 'WORK',
                        segment: {
                            segmentType: 'subSegment', // Only affects subSegments
                        },
                    },
                    data: {
                        segmentId: null, // Setting segment reference to null instead of deleting
                    },
                });

                res.status(200).json({
                    message: 'Neighbourhood removed, userSegment set to NULL successfully',
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
                                    userSegmentRelationship: 'WORK',
                                    segment: { segmentType: 'segment' },
                                },
                                select: { id: true },
                            })
                        )?.id ?? -1, // -1 triggers an insert
                    },
                    update: { segmentId },
                    create: {
                        userId,
                        userSegmentRelationship: 'WORK',
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
                                    userSegmentRelationship: 'WORK',
                                    segment: { segmentType: 'subSegment' },
                                },
                                select: { id: true },
                            })
                        )?.id ?? -1, // -1 triggers an insert
                    },
                    update: { segmentId: subSegmentId },
                    create: {
                        userId,
                        userSegmentRelationship: 'WORK',
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

module.exports = workDetailsRouter;