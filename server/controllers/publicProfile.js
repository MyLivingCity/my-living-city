const passport = require('passport');

const express = require('express');
const publicProfileRouter = express.Router();
const prisma = require('../lib/prismaClient');

const fs = require('fs');

// get request to get a community business profile
publicProfileRouter.post(
    '/communityBusinessProfile/:userId',
    async (req, res) => {
        try {
            const {userId} = req.params;
            console.log(userId);
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
                where: { userId: userId },
            });

            if (!foundCommunityBusiness) {
                const profileNew = await prisma.publicCommunityBusinessProfile.create({
                    data: {
                        userId: userId,
                        statement: "",
                        description: "",
                        links: [],
                        address: "",
                        contactEmail: "",
                        contactPhone: "",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        user: foundUser,
                    }           
                });
                return res.status(201).json(profileNew);
            } else {
                let resLinks = [];
                if (foundCommunityBusiness.links.length > 0){
                    foundCommunityBusiness.links.forEach((link) => {
                        resLinks.push((link.linkType + ' ' + link.link));
                    });
                }
                return res.send({
                    data: {
                        statement: foundCommunityBusiness.statement,
                        description: foundCommunityBusiness.description,
                        links: resLinks,
                        address: foundCommunityBusiness.address,
                        contactEmail: foundCommunityBusiness.contactEmail,
                        contactPhone: foundCommunityBusiness.contactPhone,
                    }
                });
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
publicProfileRouter.put(
    '/communityBusinessProfile',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.body.userId;
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
                    const linkNew = await prisma.link.upsert({
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


            const updatedProfile = await prisma.publicCommunityBusinessProfile.upsert({
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