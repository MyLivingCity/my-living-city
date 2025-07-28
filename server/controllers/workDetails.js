const passport = require('passport');
const express = require('express');
const workDetailsRouter = express.Router();
const prisma = require('../lib/prismaClient');
const e = require('express');
const {upsertUserSegment} = require('../helpers/userHelpers');


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

                await prisma.work_Details.delete({
                    where : {id: workDetails.id},
                });

                await prisma.userSegments.deleteMany({
                    where: {
                        userId: req.params.id,
                        userSegmentRelationship: 'WORK',
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
					userSegmentRelationship: "WORK",
					segment: {
						segmentType: 'segment'
					}
				}
			});

			const userNeighbourhoodSegment = await prisma.userSegments.findFirst({
				where: {
					userId,
					userSegmentRelationship: "WORK",
					segment: {
						segmentType: 'subSegment'
					}
				}
			});

			console.log('userCitySegment: ', userCitySegment);
			console.log('userNeighbourhoodSegment: ', userNeighbourhoodSegment);

			await upsertUserSegment(userCitySegment, userId, segmentId, 'WORK');
			await upsertUserSegment(userNeighbourhoodSegment, userId, subSegmentId, 'WORK');

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

module.exports = workDetailsRouter;