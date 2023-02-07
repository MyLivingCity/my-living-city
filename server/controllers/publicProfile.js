const passport = require('passport');

const express = require('express');
const publicProfileRouter = express.Router();
const prisma = require('../lib/prismaClient');

const fs = require('fs');

// get request to get a community business profile
publicProfileRouter.get(
    '/communityBusinessProfile',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const foundUser = await prisma.user.findUnique({ where: { id: userId } });

            if (!foundUser) {
                return res.status(400).json({
                    message: `The user with that listed ID (${userId}) does not exist.`,
                });
            }

            const foundCommunityBusiness = await prisma.publicCommunityBusinessProfile.findUnique({ 
                where: { userId: userId } 
            });

            if (!foundCommunityBusiness) {
                const profileNew = await prisma.publicCommunityBusinessProfile.create({
                    data: {
                        userId: userId,
                        statement: null,
                        description: null,
                        links: [],
                        address: null,
                        contactEmail: null,
                        contactPhone: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        user: foundUser,
                    }           
                });
                return res.status(201).json(profileNew);
            } else {
                return res.status(200).json(foundCommunityBusiness);
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

// // post request to update a community business profile
publicProfileRouter.patch(
    '/communityBusinessProfile',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.body.user;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const communityBusinessProfile = await prisma.publicCommunityBusinessProfile.findUnique({
                where: { userId: userId },
            });
            
            const links = req.body.links;
            let linksNew = [];
            if (links) {
                links.forEach(async (link) => {
                    const linkParts = link.url.split(' ');
                    const linkNew = await prisma.link.create({
                        data: {
                            link: linkParts[1],
                            linkType: linkParts[0],
                            createdAt: new Date(),
                            public_Community_Business_ProfileId: communityBusinessProfile.id,
                        }
                    });
                    linksNew.push(linkNew);
                });
            }


            const updatedProfile = await prisma.publicCommunityBusinessProfile.patch({
                where: { userId: userId },
                data: {
                    statement: req.body.statement,
                    description: req.body.description,
                    address: req.body.address,
                    links: linksNew,
                    contactEmail: req.body.contactEmail,
                    contactPhone: req.body.contactPhone,
                    updatedAt: new Date(),
                }
            });
            return res.status(200).json(updatedProfile);

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);






module.exports = publicProfileRouter;