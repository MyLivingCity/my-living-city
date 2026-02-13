const passport = require('passport');
const express = require('express');
const publicProfileRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { Link } = require('@prisma/client');

const fs = require('fs');

publicProfileRouter.get(
    '/standardProfile/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const result = await prisma.user.findFirst({
                where: { id: userId },
                include: { userHandles: true},
            });

            if (!result) {
                return res.status(404).json({
                    message: `The user with that listed ID (${userId}) does not exist.`,
                });
            } else {
                return res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

publicProfileRouter.put(
    '/standardProfile/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const data = req.body;
            const {fname, lname, email} = data;
            const updatedAt = new Date();

            const result = await prisma.user.update({
                where: { id: userId },
                data: {
                    fname: fname,
                    lname: lname,
                    email: email,
                    updatedAt: updatedAt,
                },
            });

            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

// Get profile by userId
publicProfileRouter.get(
    '/communityBusinessProfile/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const result = await prisma.public_Community_Business_Profile.findFirst({
                where: { userId: userId },
                include: { links: true }
            });

            if (!result) {
                return res.status(404).json({
                    message: `The user with that listed ID (${userId}) does not exist.`,
                });
            } else {
                console.log("Hey I made it here!");
                console.log(result.links);
                return res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

// Update profile, create if the profile does not exist.
publicProfileRouter.put(
    '/communityBusinessProfile/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const data = req.body;
            const { statement, description, links, address, contactEmail, contactPhone } = data;
            const updatedAt = new Date();

            const userProfile = await prisma.public_Community_Business_Profile.findFirst({
                where: { userId: userId },
            });


            if (!userProfile) {
            const result = await prisma.public_Community_Business_Profile.create({
                data: {
                    userId: userId,
                    statement: statement,
                    description: description,
                    address: address,
                    contactEmail: contactEmail,
                    contactPhone: contactPhone,
                    updatedAt: updatedAt,
                },
            });

            let createdLinks = [];
            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const createdLink = await prisma.link.create({
                    data: {
                        link: link.link,
                        linkType: link.linkType,
                        public_Community_Business_ProfileId: result.id,
                    },
                });
                createdLinks.push(createdLink.id);
            }

            const updatedResult = await prisma.public_Community_Business_Profile.update({
                where: { id: result.id },
                data: {
                    links: createdLinks,
                },
                include: { links: true }
            });

            res.status(201).json(updatedResult);
            } else {


                const deletedLinks = await prisma.link.deleteMany({
                    where: {
                        public_Community_Business_ProfileId: userProfile.id,
                    },
                });

                let createdLinks = [];
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    const createdLink = await prisma.link.create({
                        data: {
                            link: link.link,
                            linkType: link.linkType,
                            public_Community_Business_ProfileId: userProfile.id,
                        },
                    });
                    createdLinks.push({id: createdLink.id});
                }

            const result = await prisma.public_Community_Business_Profile.update({
                where: { id: userProfile.id },
                data: {
                    statement: statement,
                    description: description,
                    links: {
                        connect: createdLinks,
                    },
                    address: address,
                    contactEmail: contactEmail,
                    contactPhone: contactPhone,
                    updatedAt: updatedAt,
                },
                include: { links: true }
            });
            res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);


publicProfileRouter.get(
    '/communityBusinessProfile/:profileId/links',
    async (req, res) => {
        try {
            const profileId = parseInt(req.params.profileId);
            if (!profileId) {
                return res.status(400).json({
                    message: `A valid profileId must be specified in the route paramater.`,
                });
            }

            const result = await prisma.link.findMany({
                where: { public_Community_Business_ProfileId: profileId },
            });

            if (!result) {
                return res.status(404).json({
                    message: `The profile with that listed ID (${profileId}) does not exist.`,
                });
            } else {
                return res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

publicProfileRouter.get(
    '/municipalProfile/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const result = await prisma.public_Municipal_Profile.findFirst({
                where: { userId: userId },
                include: { links: true }
            });

            if (!result) {
                return res.status(404).json({
                    message: `The user with that listed ID (${userId}) does not exist.`,
                });
            } else {
                return res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }

)

publicProfileRouter.put(
    '/municipalProfile/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const data = req.body;
            const { statement, responsibility, links, address, contactEmail, contactPhone } = data;
            const updatedAt = new Date();

            const userProfile = await prisma.public_Municipal_Profile.findFirst({
                where: { userId: userId },
            });

            if (!userProfile) {
                const result = await prisma.public_Municipal_Profile.create({
                    data: {
                        userId: userId,
                        statement: statement,
                        responsibility: responsibility,
                        address: address,
                        contactEmail: contactEmail,
                        contactPhone: contactPhone,
                        updatedAt: updatedAt,
                    },
                });

                let createdLinks = [];
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    const createdLink = await prisma.link.create({
                        data: {
                            link: link.link,
                            linkType: link.linkType,
                            public_Municipal_ProfileId: result.id,
                        },
                    });
                    createdLinks.push(createdLink.id);
                }

                const updatedResult = await prisma.public_Municipal_Profile.update({
                    where: { id: result.id },
                    data: {
                        links: createdLinks,
                    },
                    include: { links: true }
                });

                res.status(201).json(updatedResult);
            } else {
                const deletedLinks = await prisma.link.deleteMany({
                    where: {
                        public_Municipal_ProfileId: userProfile.id,
                    },
                });

                let createdLinks = [];
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    const createdLink = await prisma.link.create({
                        data: {
                            link: link.link,
                            linkType: link.linkType,
                            public_Municipal_ProfileId: userProfile.id,
                        },
                    });
                    createdLinks.push({id: createdLink.id});
                }

                const result = await prisma.public_Municipal_Profile.update({
                    where: { id: userProfile.id },
                    data: {
                        statement: statement,
                        responsibility: responsibility,
                        links: {
                            connect: createdLinks,
                        },
                        address: address,
                        contactEmail: contactEmail,
                        contactPhone: contactPhone,
                        updatedAt: updatedAt,
                    },
                    include: { links: true }
                });
                res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

publicProfileRouter.get(
    '/municipalProfile/:profileId/links',
    async (req, res) => {
        try {
            const profileId = parseInt(req.params.profileId);
            if (!profileId) {
                return res.status(400).json({
                    message: `A valid profileId must be specified in the route paramater.`,
                });
            }

            const result = await prisma.link.findMany({
                where: { public_Municipal_ProfileId: profileId },
            });

            if (!result) {
                return res.status(404).json({
                    message: `The profile with that listed ID (${profileId}) does not exist.`,
                });
            } else {
                return res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

// Get all public profiles with filtering
publicProfileRouter.get('/all', async (req, res) => {
    try {
        const { 
            search = '', 
            profileType, 
            communityId,
            neighbourhoodId 
        } = req.query;

        // Filter for Community and Neighbourhood using UserSegments table (AND logic)
        let userIdFilter = undefined;
        if (communityId && neighbourhoodId) {
            // BOTH filters selected (AND logic)
            const [communityUsers, neighbourhoodUsers] = await Promise.all([
                prisma.userSegments.findMany({
                    where: { segmentId: Number(communityId) },
                    select: { userId: true }
                }),
                prisma.userSegments.findMany({
                    where: { segmentId: Number(neighbourhoodId) },
                    select: { userId: true }
                })
            ]);

            const communityUserIds = communityUsers.map(u => u.userId);
            const neighbourhoodUserIds = neighbourhoodUsers.map(u => u.userId);

            // Intersection (users in BOTH)
            userIdFilter = communityUserIds.filter(id =>
                neighbourhoodUserIds.includes(id)
            );

            if (userIdFilter.length === 0) {
                return res.status(200).json({ profiles: [], totalCount: 0 });
            }

        } else if (communityId || neighbourhoodId) {
            // ONLY one filter selected
            const segmentId = Number(communityId || neighbourhoodId);

            const userSegments = await prisma.userSegments.findMany({
                where: { segmentId },
                select: { userId: true }
            });

            userIdFilter = userSegments.map(us => us.userId);

            if (userIdFilter.length === 0) {
                return res.status(200).json({ profiles: [], totalCount: 0 });
            }
        }
        
        // Build search conditions
        const searchWhere = {
            status: true, // Only active users

            ...(userIdFilter && {
                id: { in: userIdFilter }
            }),

            ...(search && {
                OR: [
                    { fname: { contains: search, mode: 'insensitive' } },
                    { lname: { contains: search, mode: 'insensitive' } },
                    { organizationName: { contains: search, mode: 'insensitive' } }
                ]
            })
        };

        if (profileType === 'municipal') {
            searchWhere.userType = 'MUNICIPAL';
        } else if (profileType === 'community') {
            searchWhere.userType = { in: ['BUSINESS', 'COMMUNITY'] };
        } else if (profileType === 'residential') {
            searchWhere.userType = 'RESIDENTIAL';
        } else {
            searchWhere.userType = { in: ['MUNICIPAL', 'BUSINESS', 'COMMUNITY', 'RESIDENTIAL'] };
        }


        // Fetch users with their related data
        const users = await prisma.user.findMany({
            where: searchWhere,
            include: {
                address: true,
                userReach: {
                    include: {
                        segment: true
                    }
                },
                ideas: {
                    where: { active: true },
                    select: { id: true, authorId: true }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        });

        // Get total count
        const totalCount = users.length;

        // Collect all idea IDs from all users for efficient endorsement query
        const allIdeaIds = users.flatMap(user => user.ideas.map(idea => idea.id));

        // Single aggregated query to get all endorsements (ratings) for all ideas
        let endorsementsByIdea = {};
        if (allIdeaIds.length > 0) {
            const ratings = await prisma.ideaRating.groupBy({
                by: ['ideaId'],
                where: {
                    ideaId: { in: allIdeaIds },
                    rating: { gt: 0 } // Only positive ratings (endorsements)
                },
                _count: {
                    id: true
                }
            });

            // Create a map of ideaId -> endorsement count
            endorsementsByIdea = ratings.reduce((acc, rating) => {
                acc[rating.ideaId] = rating._count.id;
                return acc;
            }, {});
        }

        // Create a map of userId -> total endorsements received
        const endorsementsByUser = {};
        users.forEach(user => {
            let totalEndorsements = 0;
            user.ideas.forEach(idea => {
                totalEndorsements += endorsementsByIdea[idea.id] || 0;
            });
            endorsementsByUser[user.id] = totalEndorsements;
        });

        // Transform users into profile format
        const profiles = users.map(user => {
            // Determine profile type based on user type
            let profileType;
            if (user.userType === 'MUNICIPAL') {
                profileType = 'municipal';
            } else if (user.userType === 'RESIDENTIAL') {
                profileType = 'residential';
            } else if (user.userType === 'BUSINESS') {
                profileType = 'business';
            } else if (user.userType === 'COMMUNITY') {
                profileType = 'community';
            }

            // Get location from user address
            let location = '';
            if (user.address) {
                const addressParts = [
                    user.address.streetAddress,
                    user.address.city
                ].filter(Boolean);
                location = addressParts.join(', ');
            }

            // Get primary segment/region from userReach
            const primarySegment = user.userReach?.[0]?.segment?.name || '';
            
            return {
                id: user.id,
                userId: user.id,
                fname: user.fname,
                lname: user.lname,
                avatar: user.imagePath,
                profileType,
                location: location || primarySegment,
                endorsements: endorsementsByUser[user.id] || 0, // Real endorsements RECEIVED
                postsCount: user.ideas?.length || 0, // Real post count, no random fallback
                businessName: user.userType === 'BUSINESS' || user.userType === 'COMMUNITY' ? user.organizationName : null,
                municipalityName: user.userType === 'MUNICIPAL' ? user.organizationName : null,
                userName: user.userType === 'RESIDENTIAL' 
                    ? `${user.displayFName || user.fname || ''}@${user.displayLName || user.lname || ''}` 
                    : null,
                userType: user.userType
            };
        });

        // Rank profiles by engagement (endorsements + posts)
        profiles.sort((a, b) => {
            const aScore = (a.endorsements || 0) + (a.postsCount || 0);
            const bScore = (b.endorsements || 0) + (b.postsCount || 0);

            return bScore - aScore;
        });

        res.status(200).json({
            profiles,
            totalCount
        });

    } catch (error) {
        console.error('Error fetching public profiles:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    } finally {
        await prisma.$disconnect();
    }
});

module.exports = publicProfileRouter;