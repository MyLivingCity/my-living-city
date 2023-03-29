const passport = require('passport');
const express = require('express');
const schoolDetailsRouter = express.Router();
const prisma = require('../lib/prismaClient');

schoolDetailsRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const schoolDate = new Date(req.body.schoolDetails.programCompletionDate);
            const schoolDetails = await prisma.school_Details.create({
                data: {
                    streetAddress: req.body.schoolDetails.streetAddress,
                    postalCode: req.body.schoolDetails.postalCode,
                    faculty: req.body.schoolDetails.faculty,
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

schoolDetailsRouter.delete(
    '/delete/:id',
    async (req, res) => {    
        try {
            const schoolDetails = await prisma.school_Details.deleteMany({
                where: {
                    userId: req.params.id,
                },
            });
            const userSchoolUpdate = await prisma.userSegments.update({
                where: {
                    userId: req.params.id,
                },
                data: {
                    schoolSegmentId: null,
                    schoolSubSegmentId: null,
                    schoolSegmentName: '',
                    schoolSubSegmentName: '',
                    schoolSuperSegId: null,
                    schoolSuperSegName: '',
                    schoolSegHandle: '',
                },
            });

            res.status(200).json(schoolDetails);
        } catch (error) {
            console.log(error)
            res.status(400).json({ error: error.message });
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





module.exports = schoolDetailsRouter;