const passport = require('passport');
const express = require('express');
const schoolDetailsRouter = express.Router();
const prisma = require('../lib/prismaClient');
const {upsertUserSegment} = require('../helpers/userHelpers');

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
            await prisma.userHandle.updateMany({
                where: {
                    userId: req.params.id,
                    userSegmentRelationship: 'SCHOOL',
                },
                data: {
                    handle: req.body.displayFName + "@" + req.body.displayLName,
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

// Updates the usersegment to match the new data
schoolDetailsRouter.patch(
    '/updateCityNeighbourhood/:id',
	async (req, res, next) => {
		try {

			const userId = req.params.id;
			console.log('CITY: ', req.body.city);
			console.log('NEIGHBOURHOOD: ', req.body.neighbourhood);

			const city = await prisma.segments.findFirst({
				where: { name: { equals: req.body.city, mode: "insensitive" } },
			});

			const neighbourhood = await prisma.segments.findFirst({
				where: { name: { equals: req.body.neighbourhood, mode: "insensitive"} }
			})

			if (!neighbourhood) {
                return res.status(400).json({
                    message: "Error: A neighbourhood is required.",
                });
            }

			const segmentId = city ? city.segId : null;
            const subSegmentId = neighbourhood.segId;

			console.log('segmentID: ', segmentId);
			console.log('subSegmentId: ', subSegmentId);

			const userCitySegment = await prisma.userSegments.findFirst({
				where: {
					userId,
					userSegmentRelationship: "SCHOOL",
					segment: {
						segmentType: 'segment'
					}
				}
			});

			const userNeighbourhoodSegment = await prisma.userSegments.findFirst({
				where: {
					userId,
					userSegmentRelationship: "SCHOOL",
					segment: {
						segmentType: 'subSegment'
					}
				}
			});

			console.log('userCitySegment: ', userCitySegment);
			console.log('userNeighbourhoodSegment: ', userNeighbourhoodSegment);

			await upsertUserSegment(userCitySegment, userId, segmentId, 'SCHOOL');
			await upsertUserSegment(userNeighbourhoodSegment, userId, subSegmentId, 'SCHOOL');

			res.status(200).json({
				message: "City and neighbourhood successfully updated"
			});
		} catch (error) {
			console.log(error)
			res.status(400).json({
				message: `An Error occured while trying to update city and neighbourhood.`,
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

module.exports = schoolDetailsRouter;