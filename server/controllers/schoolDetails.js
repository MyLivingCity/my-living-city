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
                const schoolDetailsRemove = await prisma.school_Details.update({
                    where: {
                        id: schoolDetails.id,
                    },
                    data: {
                        displayFName: '',
                        displayLName: '',
                        streetAddress: '',
                        postalCode: '',
                        faculty: '',
                    },
                });

                const userSegmentsSchoolDetails = await prisma.userSegments.update({
                    where: {
                        userId: req.params.id,
                    },
                    data: {
                        schoolSegmentId: null,
                        schoolSubSegmentId: null,
                        schoolSegmentName: '',
                        schoolSubSegmentName: '',
                        schoolSegHandle: '',
                    },
                });
                res.status(200).json({schoolDetailsRemove, userSegmentsSchoolDetails});
                return;
            }
        } catch (error) {
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

schoolDetailsRouter.patch(
    '/updateCityNeighbourhood/:id',
    async (req, res) => {
        try {
            if (req.body.neighbourhood === '') {
                const result = await prisma.userSegments.update({
                    where: {
                        userId: req.params.id,
                    },
                    data: {
                        schoolSubSegmentId: null,
                        schoolSubSegmentName: '',
                    },
                });

                res.status(200).json({
                    message: 'City and neighbourhood updated successfully',
                    result,
                });

                return;
            }

            const city = await prisma.segments.findFirst({
                where: { name: { equals: req.body.city, mode: 'insensitive' } },
            });

            const neighbourhood = await prisma.subSegments.findFirst({
                where: { name: { equals: req.body.neighbourhood, mode: 'insensitive' } },
            });

            const data = {};

            if (city) {
                data.schoolSegmentId = city.segId;
                data.schoolSegmentName = city.name || "";
            }

            if (neighbourhood) {
                data.schoolSubSegmentId = neighbourhood.id;
                data.schoolSubSegmentName = neighbourhood.name || "";
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

module.exports = schoolDetailsRouter;