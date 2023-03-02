const passport = require('passport');

const express = require('express');
const feedbackRatingRouter = express.Router();
const prisma = require('../prismaClient');

feedbackRatingRouter.post(
    '/create/:feedbackId/:proposalId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id: userId } = req.user;
            const { ratingExplanation, rating } = req.body;
            const parsedFeedbackId = parseInt(req.params.feedbackId);
            const parsedProposalId = parseInt(req.params.proposalId);

            if(!parsedFeedbackId || !parsedProposalId) {
                return res.status(400).json({ 
                    message: `A valid ideaId must be specified in the route paramater.`, 
                });
            }

            const foundFeedback = await prisma.proposal.findUnique({ where: {id: parsedProposalId}});
            if(!foundFeedback) {
                return res.status(404).json({ 
                    message: `The propsal with that listed ID (${ideaId}) does not exist.`, 
                });
            }

            const userAlreadyCreatedRating = await prisma.feedbackRating.findFirst({
                where: {
                    authorId: userId,
                    proposalId: parsedProposalId,
                    feedbackId: parsedFeedbackId,
                }
            });

            if(userAlreadyCreatedRating) {
                return res.status(400).json({ 
                    message: `You have already rated this feedback. You cannot rate a feedback twice.`,
                    details: {
                        errorMessage: "A rating can only be voted on once."
                    } 
                });
            }

            const createdRating = await prisma.feedbackRating.create({
                data: {
                    rating,
                    ratingExplanation,
                    authorId: userId,
                    proposalId: parsedProposalId,
                    feedbackId: parsedFeedbackId,
                }
            });

            return res.status(200).json({
                message: `Rating succesfully created under proposal ${parsedIdeaId}`,
                rating: createdRating,
            });
        } catch (error) {
            res.status(400).json({
                message: `An error occured while trying to create a rating for feedback ${req.params.feedbackId} for proposal ${req.params.proposalId}.`,
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

feedbackRatingRouter.get(
    '/getall/:proposalId/:feedbackId',
    async (req, res) => {
        try {
            const parsedProposalId = parseInt(req.params.proposalId);
            const parsedFeedbackId = parseInt(req.params.feedbackId);

            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid proposalId must be specified in the route paramater.`,
                });
            }

            if (!parsedFeedbackId) {
                return res.status(400).json({
                    message: `A valid feedbackId must be specified in the route paramater.`,
                });
            }

            const ratings = await prisma.feedbackRating.findMany({
                 where: {
                    proposalId: parsedProposalId,
                    feedbackId: parsedFeedbackId 
                } 
            });

            res.status(200).json(ratings);
        }  catch (error) {
            res.status(400).json({
                message: `An error occured while trying to get all ratings for feedback ${req.params.feedbackId} for proposal ${req.params.proposalId}.`,
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

feedbackRatingRouter.get(
    '/getall/:proposalId/:feedbackId/:type/aggregate',
    async (req, res) => {
        try {
            const parsedProposalId = parseInt(req.params.proposalId);
            const parsedFeedbackId = parseInt(req.params.feedbackId);
            let summary = {};

            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid proposalId must be specified in the route paramater.`,
                });
            }

            if (!parsedFeedbackId) {
                return res.status(400).json({
                    message: `A valid feedbackId must be specified in the route paramater.`,
                });
            }

            const ratings = await prisma.feedbackRating.findMany({
                where: {
                   proposalId: parsedProposalId,
                   feedbackId: parsedFeedbackId 
               } 
           });
           if (req.params.type === "YESNO") {
            const yesRatings = await prisma.feedbackRating.aggregate({
                    where: {
                        proposalId: parsedProposalId,
                        feedbackId: parsedFeedbackId,
                        rating: "YES"
                    },
                    count: true,
                });

                const noRatings = await prisma.feedbackRating.aggregate({
                    where: {
                        proposalId: parsedProposalId,
                        feedbackId: parsedFeedbackId,
                        rating: "NO"
                    },
                    count: true,
                });
            } else if (req.params.type === "RATING") {
                const ones = await prisma.feedbackRating.aggregate({
                    where: {
                        proposalId: parsedProposalId,
                        feedbackId: parsedFeedbackId,
                        rating: 1
                    },
                    count: true,
                });

                const twos = await prisma.feedbackRating.aggregate({
                    where: {
                        proposalId: parsedProposalId,
                        feedbackId: parsedFeedbackId,
                        rating: 2
                    },
                    count: true,
                });

                const threes = await prisma.feedbackRating.aggregate({
                    where: {
                        proposalId: parsedProposalId,
                        feedbackId: parsedFeedbackId,
                        rating: 3
                    },
                    count: true,
                });

                const fours = await prisma.feedbackRating.aggregate({
                    where: {
                        proposalId: parsedProposalId,
                        feedbackId: parsedFeedbackId,
                        rating: 4
                    },
                    count: true,
                });
            }

            const aggregates = await prisma.feedbackRating.aggregate({
                where: {
                    proposalId: parsedProposalId,
                    feedbackId: parsedFeedbackId,
                },
                avg: {
                    rating: true,
                },
                count: true,
            });

            if (req.params.type === "YESNO") {
                summary = {
                    yesRatings: yesRatings.count,
                    noRatings: noRatings.count,
                    averageRating: aggregates.avg.rating,
                    totalRatings: aggregates.count,
                }
            } else if (req.params.type === "RATING") {
                summary = {
                    ones: ones.count,
                    twos: twos.count,
                    threes: threes.count,
                    fours: fours.count,
                    averageRating: aggregates.avg.rating,
                    totalRatings: aggregates.count,
                }
            }

            res.status(200).json({
                ratings,
                summary,
                });
        }  catch (error) {
            res.status(400).json({
                message: `An error occured while trying to get all ratings for feedback ${req.params.feedbackId} for proposal ${req.params.proposalId}.`,
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