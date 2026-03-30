const passport = require('passport');
const express = require('express');
const publicProfileRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { Link } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../lib/constants');

const fs = require('fs');

const PROFILE_VISIBILITY = {
    PUBLIC: 'PUBLIC',
    COMMUNITY_MEMBERS: 'COMMUNITY_MEMBERS',
    CONTACTS_ONLY: 'CONTACTS_ONLY',
    PRIVATE: 'PRIVATE',
};

const PRIVILEGED_USER_TYPES = new Set([
    'SUPER_ADMIN',
    'ADMIN',
    'MOD',
    'SEG_ADMIN',
    'SEG_MOD',
    'MUNICIPAL',
    'MUNICIPAL_SEG_ADMIN',
]);

const isPrivilegedViewer = (viewer) => {
    return !!viewer && PRIVILEGED_USER_TYPES.has(viewer.userType);
};

const getViewerFromRequest = async (req) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return null;
    }

    try {
        const { user } = jwt.verify(token, JWT_SECRET);
        if (!user?.id) {
            return null;
        }

        const viewer = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, userType: true },
        });

        return viewer || null;
    } catch (error) {
        return null;
    }
};

const hasSharedApprovedSubgroupMembership = async (viewerId, ownerId) => {
    if (!viewerId || !ownerId) {
        return false;
    }

    const [viewerMemberships, ownerMemberships] = await Promise.all([
        prisma.subGroupMember.findMany({
            where: { userId: viewerId, status: 'APPROVED' },
            select: { subGroupId: true },
        }),
        prisma.subGroupMember.findMany({
            where: { userId: ownerId, status: 'APPROVED' },
            select: { subGroupId: true },
        }),
    ]);

    if (!viewerMemberships.length || !ownerMemberships.length) {
        return false;
    }

    const viewerSubgroups = new Set(viewerMemberships.map((m) => m.subGroupId));
    return ownerMemberships.some((m) => viewerSubgroups.has(m.subGroupId));
};

const canViewResidentialProfile = async ({ viewer, ownerId, visibility }) => {
    const effectiveVisibility = visibility || PROFILE_VISIBILITY.PUBLIC;

    if (!ownerId) {
        return false;
    }

    if (viewer?.id === ownerId || isPrivilegedViewer(viewer)) {
        return true;
    }

    if (effectiveVisibility === PROFILE_VISIBILITY.PUBLIC) {
        return true;
    }

    if (!viewer) {
        return false;
    }

    if (effectiveVisibility === PROFILE_VISIBILITY.PRIVATE) {
        return false;
    }

    if (effectiveVisibility === PROFILE_VISIBILITY.COMMUNITY_MEMBERS) {
        return hasSharedApprovedSubgroupMembership(viewer.id, ownerId);
    }

    if (effectiveVisibility === PROFILE_VISIBILITY.CONTACTS_ONLY) {
        // Approved contact lists are not yet modelled in this codebase.
        return false;
    }

    return false;
};

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
            const viewer = await getViewerFromRequest(req);
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const result = await prisma.public_Community_Business_Profile.findFirst({
                where: { userId: userId },
                include: {
                    links: true,
                    user: {
                        select: {
                            id: true,
                            fname: true,
                            lname: true,
                            email: true,
                            createdAt: true,
                            userType: true,
                            organizationName: true,
                            displayFName: true,
                            displayLName: true,
                            enhancedMember: {
                                select: {
                                    userId: true
                                }
                            }
                        }
                    },
                }
            });

            if (!result) {
                return res.status(404).json({
                    message: `The user with that listed ID (${userId}) does not exist.`,
                });
            } else {
                
                // Add computed display name for residential users
                if (result.user && result.user.userType === 'RESIDENTIAL') {
                    const canView = await canViewResidentialProfile({
                        viewer,
                        ownerId: result.user.id,
                        visibility: result.profileVisibility,
                    });

                    if (!canView) {
                        return res.status(403).json({
                            message: 'This profile is not visible to your account based on user preferences.',
                        });
                    }

                    // Create a new object with displayName to ensure it's included in JSON response
                    const displayName = `${result.user.displayFName && result.user.displayFName.trim() ? result.user.displayFName : result.user.fname}@${result.user.displayLName && result.user.displayLName.trim() ? result.user.displayLName : result.user.lname}`;

                    result.user = {
                        ...result.user,
                        displayName: displayName,
                        isEnhancedMember: !!result.user.enhancedMember
                    };
                } else if (result.user) {
                    result.user = {
                        ...result.user,
                        isEnhancedMember: !!result.user.enhancedMember
                    };
                }
                
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
            const {
                statement,
                description,
                links,
                address,
                contactFirstName,
                contactLastName,
                contactEmail,
                contactPhone,
                profileVisibility,
            } = data;
            const profileLinks = Array.isArray(links) ? links : [];
            const updatedAt = new Date();
            const effectiveProfileVisibility =
                profileVisibility || PROFILE_VISIBILITY.PUBLIC;

            const userProfile = await prisma.public_Community_Business_Profile.findFirst({
                where: { userId: userId },
            });


            if (!userProfile) {
            const result = await prisma.public_Community_Business_Profile.create({
                data: {
                    userId: userId,
                    statement: statement,
                    description: description,
                    profileVisibility: effectiveProfileVisibility,
                    address: address,
                    contactEmail: contactEmail,
                    contactPhone: contactPhone,
                    updatedAt: updatedAt,
                },
            });

            let createdLinks = [];
            for (let i = 0; i < profileLinks.length; i++) {
                const link = profileLinks[i];
                const createdLink = await prisma.link.create({
                    data: {
                        link: link.link,
                        linkType: link.linkType,
                        public_Community_Business_ProfileId: result.id,
                    },
                });
                createdLinks.push({ id: createdLink.id });
            }

            const updatedResult = await prisma.public_Community_Business_Profile.update({
                where: { id: result.id },
                data: {
                    links: {
                        connect: createdLinks,
                    },
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
                for (let i = 0; i < profileLinks.length; i++) {
                    const link = profileLinks[i];
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
                    profileVisibility: effectiveProfileVisibility,
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
                // Add computed display name for residential users
                if (result.user && result.user.userType === 'RESIDENTIAL') {
                    result.user.displayName = `${result.user.displayFName || result.user.fname || ''}@${result.user.displayLName || result.user.lname || ''}`;
                }
                
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
                include: {
                    links: true,
                    user: {
                        select: {
                            id: true,
                            fname: true,
                            lname: true,
                            email: true,
                            createdAt: true,
                            userType: true,
                            organizationName: true,
                            displayFName: true,
                            displayLName: true,
                            enhancedMember: {
                                select: {
                                    userId: true
                                }
                            }
                        }
                    }
                }
            });

            if (!result) {
                return res.status(404).json({
                    message: `The user with that listed ID (${userId}) does not exist.`,
                });
            } else {
                // Add computed display name for residential users
                if (result.user && result.user.userType === 'RESIDENTIAL') {
                    console.log('Municipal - User displayFName:', result.user.displayFName);
                    console.log('Municipal - User displayLName:', result.user.displayLName);
                    console.log('Municipal - User fname:', result.user.fname);
                    console.log('Municipal - User lname:', result.user.lname);
                    
                        // Create a new object with displayName to ensure it's included in JSON response
                        const displayName = `${result.user.displayFName && result.user.displayFName.trim() ? result.user.displayFName : result.user.fname} @ ${result.user.displayLName && result.user.displayLName.trim() ? result.user.displayLName : result.user.lname}`;
                        console.log('Municipal - Computed displayName:', displayName);
                    
                        result.user = {
                            ...result.user,
                            displayName: displayName,
                            isEnhancedMember: !!result.user.enhancedMember
                        };
                        console.log('Municipal - Modified user object:', result.user);
                } else if (result.user) {
                    result.user = {
                        ...result.user,
                        isEnhancedMember: !!result.user.enhancedMember
                    };
                }
                
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
            const profileLinks = Array.isArray(links) ? links : [];
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
                for (let i = 0; i < profileLinks.length; i++) {
                    const link = profileLinks[i];
                    const createdLink = await prisma.link.create({
                        data: {
                            link: link.link,
                            linkType: link.linkType,
                            public_Municipal_ProfileId: result.id,
                        },
                    });
                    createdLinks.push({ id: createdLink.id });
                }

                const updatedResult = await prisma.public_Municipal_Profile.update({
                    where: { id: result.id },
                    data: {
                        links: {
                            connect: createdLinks,
                        },
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
                for (let i = 0; i < profileLinks.length; i++) {
                    const link = profileLinks[i];
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
        const viewer = await getViewerFromRequest(req);
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

        const residentialUsers = users.filter((u) => u.userType === 'RESIDENTIAL');
        const residentialUserIds = residentialUsers.map((u) => u.id);
        const profileRows = residentialUserIds.length
            ? await prisma.public_Community_Business_Profile.findMany({
                where: { userId: { in: residentialUserIds } },
                select: { userId: true, profileVisibility: true },
            })
            : [];
        const visibilityByUserId = profileRows.reduce((acc, profileRow) => {
            acc[profileRow.userId] = profileRow.profileVisibility || PROFILE_VISIBILITY.PUBLIC;
            return acc;
        }, {});

        const residentialAllowedUserIds = new Set();
        const defaultAllowedUserIds = new Set();

        users.forEach((userRow) => {
            if (userRow.userType !== 'RESIDENTIAL') {
                defaultAllowedUserIds.add(userRow.id);
            }
        });

        if (!residentialUsers.length) {
            // No-op when there are no residential profiles in current result set.
        } else if (isPrivilegedViewer(viewer)) {
            residentialUsers.forEach((u) => residentialAllowedUserIds.add(u.id));
        } else {
            const viewerMemberships = viewer
                ? await prisma.subGroupMember.findMany({
                    where: { userId: viewer.id, status: 'APPROVED' },
                    select: { subGroupId: true },
                })
                : [];
            const viewerSubgroupSet = new Set(viewerMemberships.map((m) => m.subGroupId));

            const ownerMemberships = viewer && viewerSubgroupSet.size
                ? await prisma.subGroupMember.findMany({
                    where: {
                        userId: { in: residentialUserIds },
                        status: 'APPROVED',
                        subGroupId: { in: Array.from(viewerSubgroupSet) },
                    },
                    select: { userId: true },
                })
                : [];
            const ownerCommunityMemberSet = new Set(ownerMemberships.map((m) => m.userId));

            residentialUsers.forEach((residentialUser) => {
                const visibility =
                    visibilityByUserId[residentialUser.id] || PROFILE_VISIBILITY.PUBLIC;

                if (viewer?.id === residentialUser.id) {
                    residentialAllowedUserIds.add(residentialUser.id);
                    return;
                }

                if (visibility === PROFILE_VISIBILITY.PUBLIC) {
                    residentialAllowedUserIds.add(residentialUser.id);
                    return;
                }

                if (!viewer) {
                    return;
                }

                if (visibility === PROFILE_VISIBILITY.COMMUNITY_MEMBERS) {
                    if (ownerCommunityMemberSet.has(residentialUser.id)) {
                        residentialAllowedUserIds.add(residentialUser.id);
                    }
                    return;
                }

                if (visibility === PROFILE_VISIBILITY.CONTACTS_ONLY) {
                    // Approved contact lists are not yet modelled in this codebase.
                    return;
                }

                // PRIVATE profiles remain hidden for non-privileged viewers.
            });
        }

        const allowedUserIds = new Set([
            ...Array.from(defaultAllowedUserIds),
            ...Array.from(residentialAllowedUserIds),
        ]);
        const filteredUsers = users.filter((u) => allowedUserIds.has(u.id));

        // Get total count
        const totalCount = filteredUsers.length;

        // Collect all idea IDs from all users for efficient endorsement query
        const allIdeaIds = filteredUsers.flatMap(user => user.ideas.map(idea => idea.id));

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
        filteredUsers.forEach(user => {
            let totalEndorsements = 0;
            user.ideas.forEach(idea => {
                totalEndorsements += endorsementsByIdea[idea.id] || 0;
            });
            endorsementsByUser[user.id] = totalEndorsements;
        });

        // Transform users into profile format
        const profiles = filteredUsers.map(user => {
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
                userType: user.userType,
                profileVisibility: user.userType === 'RESIDENTIAL'
                    ? visibilityByUserId[user.id] || PROFILE_VISIBILITY.PUBLIC
                    : PROFILE_VISIBILITY.PUBLIC,
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