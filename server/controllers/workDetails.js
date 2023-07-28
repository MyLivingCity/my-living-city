const passport = require('passport');
const express = require('express');
const workDetailsRouter = express.Router();
const prisma = require('../lib/prismaClient');

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
            const workDetails = await prisma.work_Details.deleteMany({
                where: {
                    userId: req.params.id,
                },
            });
            const userWorkUpdate = await prisma.userSegments.update({
                where: {
                    userId: req.params.id,
                },
                data: {
                    workSegmentId: null,
                    workSubSegmentId: null,
                    workSegmentName: '',
                    workSubSegmentName: '',
                    workSuperSegId: null,
                    workSuperSegName: '',
                    workSegHandle: '',
                },
            });
            
            res.status(200).json(workDetails);
        } catch (error) {
            console.log(error)
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
                const userDetails = await prisma.userSegments.update({ where: {
                    userId: req.params.id,
                },
                data: {
                  workSegHandle: req.body.displayFName + "@" + req.body.displayLName,
                },})

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
            const city = await prisma.segments.findFirst({
                where: { name: { equals: req.body.city, mode: 'insensitive' } },
            });

            const neighbourhood = await prisma.subSegments.findFirst({
                where: { name: { equals: req.body.neighbourhood, mode: 'insensitive' } },
            });

            const data = {};

            if (city) {
                data.workSegmentId = city.id;
                data.workSegmentName = city.name || "";
            }

            if (neighbourhood) {
                data.workSubSegmentId = neighbourhood.id;
                data.workSubSegmentName = neighbourhood.name || "";
            }

            if (Object.keys(data).length === 0) {
                console.log('City and neighbourhood not found');
                res.status(400).json({ error: 'City and neighbourhood not found' });
                return;
            }

            const result = await prisma.userSegments.update({
                where: {
                    userId: req.params.id,
                },
                data,
            });

            res.status(200).json({
                message: 'City and neighbourhood updated successfully',
                result,
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