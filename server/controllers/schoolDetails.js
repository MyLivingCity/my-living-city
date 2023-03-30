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

schoolDetailsRouter.patch(
    '/updateCityNeighbourhood/:id',
    async (req, res) => {
        try {
            const city = await prisma.segments.findFirst({
                where: {name: {equals: req.body.city, mode: 'insensitive'}},
            });

            const neighbourhood = await prisma.subSegments.findFirst({
                where: {name: {equals: req.body.neighbourhood, mode: 'insensitive'}},
            });

            if (city && neighbourhood) {
                const res = await prisma.userSegments.update({
                    where: {
                        userId: req.params.id,
                    },
                    data: {
                        schoolSegmentId: city.id,
                        schoolSubSegmentId: neighbourhood.id,
                        schoolSegmentName: city.name,
                        schoolSubSegmentName: neighbourhood.name,
                    }
                });
            } else {
                console.log('City or neighbourhood not found');
                res.status(400).json({ error: 'City or neighbourhood not found' });
                return;
            }

            res.status(200).json(
                {
                   messsage: 'City and neighbourhood updated successfully'
                }
            );
        } catch (error) {
            console.log(error);
            res.status(400).json({ error: error.message });
        } finally {
            await prisma.$disconnect();
        }
    }
)




module.exports = schoolDetailsRouter;