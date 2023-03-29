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
            res.status(200).json(workDetails);
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)

module.exports = workDetailsRouter;