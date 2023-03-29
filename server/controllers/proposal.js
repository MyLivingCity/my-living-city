const passport = require('passport');

const express = require('express');
const proposalRouter = express.Router();
const prisma = require('../lib/prismaClient');

const fs = require('fs');
const { collaborator } = require('../lib/prismaClient');

// post request to create a proposal
proposalRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    
    async (req, res) => {
        try {
            //check if user is in bad posting behavior table if so res.status(400).json({message: 'User is in bad posting behavior table'}) 
            const { id } = req.user;
            const user = await prisma.bad_Posting_Behavior.findFirst({
            where: {
                userId: id,
                post_comment_ban: true,
            },
            });
            if (user) {
            return res.status(400).json({
                message: 'User is in bad posting behavior table',
            });
            }
            let {
                ideaId,
                banned,
                needCollaborators,
                needVolunteers,
                needDonations,
                needFeedback,
                needSuggestions,
                location,
                feedback1,
                feedback2,
                feedback3,
                feedback4,
                feedback5,
                feedbackType1,
                feedbackType2,
                feedbackType3,
                feedbackType4,
                feedbackType5,
            } = req.body;
            const bannedBoolean = (banned === 'true');
            const needCollaboratorsBoolean = (needCollaborators === 'true');
            const needVolunteersBoolean = (needVolunteers === 'true');
            const needDonationsBoolean = (needDonations === 'true');
            const needFeedbackBoolean = (needFeedback === 'true');
            const needSuggestionsBoolean = (needSuggestions === 'true');
            if (banned === true) {
                error += 'You are banned';
                errorMessage += 'You must be un-banned before you can post ideas';
                errorStack += 'Users can not post ideas with a pending ban status of true';
            }
            ideaId = parseInt(ideaId);

            console.log("ideaId", ideaId);
            const createdProposal = await prisma.proposal.create({
                data: {
                    ideaId: ideaId,
                    needCollaborators: needCollaboratorsBoolean,
                    needVolunteers: needVolunteersBoolean,
                    needDonations: needDonationsBoolean,
                    needFeedback: needFeedbackBoolean,
                    needSuggestions: needSuggestionsBoolean,
                    location: location,
                    feedback1,
                    feedback2,
                    feedback3,
                    feedback4,
                    feedback5,
                    feedbackType1,
                    feedbackType2,
                    feedbackType3,
                    feedbackType4,
                    feedbackType5,
                }
            });
            console.log("createdProposal", createdProposal);
            res.status(201).json(createdProposal);

        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: "An error occured while trying to create an Proposal.",
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

proposalRouter.get(
    '/',
    async (req, res, next) => {
        try {
            res.json({
                route: 'welcome to Proposal Router'
            })
        } catch (error) {
            res.status(400).json({
                message: error.message,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            })
        }
    }
)

// Get all Proposals
proposalRouter.get(
    '/getall',
    async (req, res, next) => {
        try {
            const proposals = await prisma.proposal.findMany();
            console.log("these are the proposals");
            console.log(proposals);
            res.status(200).json(proposals);
        } catch (error) {
            res.status(400).json({
                message: error.message,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            })
        } finally {
            await prisma.$disconnect();
        }
    }
)

// Get all proposals with aggregations
proposalRouter.post(
    '/getall/with-sort',
    async (req, res, next) => {
        try {
            console.log(req.body);
            const allProposals = await prisma.proposal.findMany(req.body);

            res.status(200).json(allProposals);
        } catch (error) {
            res.status(400).json({
                message: "An error occured while trying to fetch all ideas",
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

proposalRouter.post(
    '/getall/aggregations',
    async (req, res, next) => {
        try {
            const proposals = await prisma.proposal.findMany({
                include: {
                    idea: {
                        include: {
                            ratings: true,
                        },
                    },
                },
            });
            res.json(proposals);
        } catch (error) {
            res.status(400).json({
                message: error.message,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            })
        } finally {
            await prisma.$disconnect();
        }
    }
)

// Get all idea as well as relations with ideaId
proposalRouter.get(
    '/getByIdeaId/:ideaId',
    async (req, res, next) => {
        try {
            const parsedIdeaId = parseInt(req.params.ideaId);

            // check if id is valid
            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid ideaId must be specified in the route parameter.`,
                });
            }

            const foundProposal = await prisma.proposal.findUnique({
                where: { ideaId: parsedIdeaId },
                include: {
                    suggestedIdeas: {
                        select: {
                            id: true,
                            title: true,
                            author: {
                                select: {
                                    fname: true,
                                    lname: true,
                                }
                            }
                        },
                    },
                    collaborations: {
                        select: {
                            experience: true,
                            role: true,
                            time: true,
                            contactInfo: true,
                            author: {
                                select: {
                                    id: true,
                                    fname: true,
                                    lname: true,
                                }
                            }
                        },
                    },
                    volunteers: {
                        select: {
                            experience: true,
                            task: true,
                            time: true,
                            contactInfo: true,
                            author: {
                                select: {
                                    id: true,
                                    fname: true,
                                    lname: true,
                                }
                            }
                        },
                    },
                    donors: {
                        select: {
                            donations: true,
                            contactInfo: true,
                            author: {
                                select: {
                                    id: true,
                                    fname: true,
                                    lname: true,
                                }
                            }
                        },
                    },
                }
            });
            if (!foundProposal) {
                return res.status(400).json({
                    message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
                });
            }

            const result = { ...foundProposal };

            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: `An Error occured while trying to fetch idea with id ${req.params.ideaId}.`,
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

proposalRouter.get(
    '/get/:proposalId',
    async (req, res, next) => {
        try {
            const parsedProposalId = parseInt(req.params.proposalId);

            // check if id is valid
            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid ideaId must be specified in the route parameter.`,
                });
            }

            const foundProposal = await prisma.proposal.findUnique({
                where: { id: parsedProposalId },
                include: {
                    suggestedIdeas: {
                        select: {
                            id: true,
                            title: true,
                            author: {
                                select: {
                                    fname: true,
                                    lname: true,
                                }
                            }
                        },
                    },
                    collaborations: {
                        select: {
                            experience: true,
                            role: true,
                            time: true,
                            contactInfo: true,
                            author: {
                                select: {
                                    id: true,
                                    fname: true,
                                    lname: true,
                                }
                            }
                        },
                    },
                    volunteers: {
                        select: {
                            experience: true,
                            task: true,
                            time: true,
                            contactInfo: true,
                            author: {
                                select: {
                                    id: true,
                                    fname: true,
                                    lname: true,
                                    address: true,
                                }
                            },

                        },
                    },
                    donors: {
                        select: {
                            donations: true,
                            contactInfo: true,
                            author: {
                                select: {
                                    id: true,
                                    fname: true,
                                    lname: true,
                                    address: true,
                                }
                            }
                        },
                    },
                }
            });
            if (!foundProposal) {
                return res.status(400).json({
                    message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
                });
            }

            const result = { ...foundProposal };
            console.log("VOLUNTEERS33", result.volunteers.map(volunteer => volunteer.author.address));

            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: `An Error occured while trying to fetch idea with id ${req.params.ideaId}.`,
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


// Put request to update data
proposalRouter.put(
    '/update/:ideaId',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const { email, id: loggedInUserId } = req.user;
            const { ideaId } = req.params;
            const parsedProposalId = parseInt(ideaId);
            const {
                title,
                description,
                communityImpact,
                natureImpact,
                artsImpact,
                energyImpact,
                manufacturingImpact,
                // TODO: If these fields are not passed will break code
                geo: {
                    lat,
                    lon
                },
                address: {
                    streetAddress,
                    streetAddress2,
                    city,
                    country,
                    postalCode,
                },
            } = req.body;

            if (!ideaId || !parsedProposalId) {
                return res.status(400).json({
                    message: `A valid ideaId must be specified in the route paramater.`,
                });
            }

            // Check to see if idea with id exists
            const foundProposal = await prisma.idea.findUnique({ where: { id: parsedProposalId } });
            if (!foundProposal) {
                return res.status(400).json({
                    message: `The idea with that listed ID (${ideaId}) does not exist.`,
                });
            }

            // Check to see if Proposal is the requestee's idea by JWT
            const ideaOwnedByUser = foundProposal.authorId === loggedInUserId;
            if (!ideaOwnedByUser) {
                return res.status(401).json({
                    message: `The user ${email} is not the author or an admin and therefore cannot edit this idea.`
                });
            }

            // Conditional add params to update only fields passed in
            const updateGeoData = {
                ...lat && { lat },
                ...lon && { lon }
            }

            const updateAddressData = {
                ...streetAddress && { streetAddress },
                ...streetAddress2 && { streetAddress2 },
                ...city && { city },
                ...country && { country },
                ...postalCode && { postalCode },
            }

            const updateData = {
                ...title && { title },
                ...description && { description },
                ...communityImpact && { communityImpact },
                ...natureImpact && { natureImpact },
                ...artsImpact && { artsImpact },
                ...energyImpact && { energyImpact },
                ...manufacturingImpact && { manufacturingImpact },
            };

            const updatedProposal = await prisma.idea.update({
                where: { id: parsedProposalId },
                data: {
                    geo: { update: updateGeoData },
                    address: { update: updateAddressData },
                    ...updateData,
                },
                include: {
                    geo: true,
                    address: true,
                }
            });

            console.log("Returns here")
            res.status(200).json({
                message: "Proposal succesfully updated",
                idea: updatedProposal,
            })
        } catch (error) {
            res.status(400).json({
                message: "An error occured while to update an Proposal",
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


// delete request to delete an idea
proposalRouter.delete(
    '/delete/:ideaId',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const { id: loggedInUserId, email } = req.user;
            console.log(req.user);
            const parsedProposalId = parseInt(req.params.ideaId);

            // check if id is valid
            if (!parsedProposalId) {
                return res.status(400).json({
                    message: `A valid ideaId must be specified in the route paramater.`,
                });
            }

            // Check to see if idea exists
            const foundProposal = await prisma.idea.findUnique({ where: { id: parsedProposalId } });
            if (!foundProposal) {
                return res.status(400).json({
                    message: `The idea with that listed ID (${ideaId}) does not exist.`,
                });
            }

            // Check to see if idea is owned by user
            const ideaOwnedByUser = foundProposal.authorId === loggedInUserId;
            if (!ideaOwnedByUser) {
                return res.status(401).json({
                    message: `The user ${email} is not the author or an admin and therefore cannot delete this idea.`
                });
            }

            if (foundProposal.imagePath) {
                if (fs.existsSync(foundProposal.imagePath)) {
                    fs.unlinkSync(foundProposal.imagePath);
                }
            }

            const deleteComment = await prisma.ideaComment.deleteMany({ where: { ideaId: foundProposal.id } });
            const deleteRating = await prisma.ideaRating.deleteMany({ where: { ideaId: foundProposal.id } });

            const deletedGeo = await prisma.ideaGeo.deleteMany({ where: { ideaId: foundProposal.id } });
            const deleteAddress = await prisma.ideaAddress.deleteMany({ where: { ideaId: foundProposal.id } });
            const deletedProposal = await prisma.idea.delete({ where: { id: parsedProposalId } });

            res.status(200).json({
                message: "Proposal succesfully deleted",
                deletedProposal: deletedProposal,
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "An error occured while to delete an Proposal",
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

module.exports = proposalRouter;
