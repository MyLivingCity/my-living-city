const passport = require('passport');
const express = require('express');
const publicProfileRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { Link } = require('@prisma/client');

const fs = require('fs');

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

            console.log("Hey I made it here!");

            const data = req.body;
            const { statement, description, links, address, contactEmail, contactPhone } = data;
            const updatedAt = new Date();


            let createdLinks = [];
            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const createdLink = await prisma.link.create({
                    data: {
                        link: link.link,
                        linkType: link.linkType,
                    },
                });
                createdLinks.push(createdLink);
            }

            console.log(createdLinks);

            const userProfile = await prisma.public_Community_Business_Profile.findFirst({
                where: { userId: userId },
            });


            if (!userProfile) {
            const result = await prisma.public_Community_Business_Profile.create({
                data: {
                    statement: statement,
                    description: description,
                    links: createdLinks,
                    address: address,
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                    updatedAt: updatedAt,
                },
            });
            res.status(201).json(result);
            } else {
            const result = await prisma.public_Community_Business_Profile.update({
                where: { id: userProfile.id },
                data: {
                    statement: statement,
                    description: description,
                    links: createdLinks,
                    address: address,
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                    updatedAt: updatedAt,
                },
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






module.exports = publicProfileRouter;