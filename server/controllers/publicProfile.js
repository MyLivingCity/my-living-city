const passport = require('passport');

const express = require('express');
const publicProfileRouter = express.Router();
const prisma = require('../lib/prismaClient');

const fs = require('fs');

// Get profile by userId
publicProfileRouter.get(
    '/communityBusinessProfile/:userId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const result = await prisma.publicCommunityBusinessProfile.findUnique({
                where: { userId: userId },
            });

            if (!result) {
                return res.status(400).json({
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

// Update profile, create if the profile does not exist.
publicProfileRouter.put(
    '/communityBusinessProfile/:userId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const data = req.body;
            const { statement, description, links, address, contactEmail, contactPhone } = data;
            const updatedAt = new Date();

            const result = await prisma.publicCommunityBusinessProfile.upsert({
                where: { userId: userId },
                update: {
                    statement: statement,
                    description: description,
                    links: links,
                    address: address,
                    contactEmail: contactEmail,
                    contactPhone: contactPhone,
                    updatedAt: updatedAt,
                },
                create: {
                    userId: userId,
                    statement: statement,
                    description: description,
                    links: links,
                    address: address,
                    contactEmail: contactEmail,
                    contactPhone: contactPhone,
                    createdAt: updatedAt,
                    updatedAt: updatedAt,
                },
            });

            if (!result) {
                return res.status(400).json({
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






module.exports = publicProfileRouter;