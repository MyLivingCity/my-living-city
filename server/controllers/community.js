const passport = require('passport');

const express = require('express');
const communityRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { isInteger, isEmpty } = require('lodash');

const fs = require('fs');

// post request to create a collaborator
communityRouter.post(
    '/create/collaborator',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {

            console.log('create collaborator');

            const { id: loggedInUserId } = req.user;
            const {
                proposalId,
                experience,
                role,
                time,
                contactInfo,
            } = req.body;

            console.log("collabValues: ", proposalId, experience, role, time, contactInfo);

            const parsedProposalId = parseInt(proposalId);

            // check if id is valid
            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid ideaId must be specified in the route paramater.`,
                });
            }

            const foundProposal = await prisma.proposal.findUnique({ where: { id: parsedProposalId } });
            if (!foundProposal) {
                return res.status(400).json({
                    message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
                });
            }

            const createdCollaborator = await prisma.collaborator.upsert({
                where: {
                    collaborator_unique: {
                        proposalId: parsedProposalId,
                        authorId: loggedInUserId,
                    },
                },
                update: {
                    experience: experience,
                    role: role,
                    time: time,
                    contactInfo: contactInfo,
                },
                create: {
                    authorId: loggedInUserId,
                    proposalId: parsedProposalId,
                    experience: experience,
                    role: role,
                    time: time,
                    contactInfo: contactInfo,
                },
            });



            res.status(200).json(createdCollaborator);

        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: `Error creating collaborator: ${error}`,
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

communityRouter.get(
    '/collaborators/getAll/:proposalId',
    async (req, res, next) => {
        try {
            const { proposalId } = req.params;
            const parsedProposalId = parseInt(proposalId);
            const collaborators = await prisma.collaborator.findMany({
                where: {
                    proposalId: parsedProposalId,
                },
            });
            res.status(200).json(collaborators);
        } catch (error) {
            res.status(400).json({
                message: `Cannot get collaborators.`,
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

// post request to create a volunteer
communityRouter.post(
    '/create/volunteer',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {

            console.log('create volunteer');

            const { id: loggedInUserId } = req.user;
            const {
                proposalId,
                experience,
                task,
                time,
                contactInfo,
            } = req.body;

            console.log("voluteerValues: ", proposalId, experience, task, time, contactInfo);

            const parsedProposalId = parseInt(proposalId);

            // check if id is valid
            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid ideaId must be specified in the route paramater.`,
                });
            }

            const foundProposal = await prisma.proposal.findUnique({ where: { id: parsedProposalId } });
            if (!foundProposal) {
                return res.status(400).json({
                    message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
                });
            }

            const createdVolunteer = await prisma.volunteer.upsert({
                where: {
                    volunteer_unique: {
                        proposalId: parsedProposalId,
                        authorId: loggedInUserId,
                    },
                },
                update: {
                    experience: experience,
                    task: task,
                    time: time,
                    contactInfo: contactInfo,
                },
                create: {
                    authorId: loggedInUserId,
                    proposalId: parsedProposalId,
                    experience: experience,
                    task: task,
                    time: time,
                    contactInfo: contactInfo,
                },
            });



            res.status(200).json(createdVolunteer);

        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: `Error creating volunteer: ${error}`,
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

communityRouter.get(
    '/volunteers/getAll/:proposalId',
    async (req, res, next) => {
        try {
            const { proposalId } = req.params;
            const parsedProposalId = parseInt(proposalId);
            const volunteers = await prisma.volunteer.findMany({
                where: {
                    proposalId: parsedProposalId,
                },
            });
            res.status(200).json(volunteers);
        } catch (error) {
            res.status(400).json({
                message: `Cannot get volunteers.`,
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

// post request to create a donor
communityRouter.post(
    '/create/donor',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {

            console.log('create volunteer');

            const { id: loggedInUserId } = req.user;
            const {
                proposalId,
                donations,
                contactInfo,
            } = req.body;

            console.log("donorValues: ", proposalId, donations, contactInfo);

            const parsedProposalId = parseInt(proposalId);

            // check if id is valid
            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid ideaId must be specified in the route paramater.`,
                });
            }

            const foundProposal = await prisma.proposal.findUnique({ where: { id: parsedProposalId } });
            if (!foundProposal) {
                return res.status(400).json({
                    message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
                });
            }

            const createdDonor = await prisma.donor.upsert({
                where: {
                    donor_unique: {
                        proposalId: parsedProposalId,
                        authorId: loggedInUserId,
                    },
                },
                update: {
                    donations: donations,
                    contactInfo: contactInfo,
                },
                create: {
                    authorId: loggedInUserId,
                    proposalId: parsedProposalId,
                    donations: donations,
                    contactInfo: contactInfo,
                },
            });



            res.status(200).json(createdDonor);

        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: `Error creating donor: ${error}`,
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

communityRouter.get(
    '/donors/getAll/:proposalId',
    async (req, res, next) => {
        try {
            const { proposalId } = req.params;
            const parsedProposalId = parseInt(proposalId);
            const volunteers = await prisma.donor.findMany({
                where: {
                    proposalId: parsedProposalId,
                },
            });
            res.status(200).json(volunteers);
        } catch (error) {
            res.status(400).json({
                message: `Cannot get donors.`,
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


module.exports = communityRouter;