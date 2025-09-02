const express = require('express');
const subGroupRequestRouter = express.Router();
const prisma = require('../lib/prismaClient');

subGroupRequestRouter.get(
    '/getAllRequest/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const publicSubgroups = await prisma.SubGroupMember.findMany({
                where: { userId },
                select: {
                    id: true,
                    subGroup: {
                        select: {
                            name: true,
                        }
                    },
                    status: true,
                    joinedAt: true
                },
                orderBy: [{joinedAt: 'desc'}]
            });

            return res.status(200).json(publicSubgroups);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

subGroupRequestRouter.post(
    '/createRequest/:userId/:subGroupId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            const subGroupId = req.params.subGroupId;
            if (!userId || !subGroupId) {
                return res.status(400).json({
                    message: `A valid userId or subGroupId must be specified in the route paramater.`,
                });
            }

            const requestExist = await prisma.SubGroupMember.findUnique({
                where: {
                    userId_subGroupId: {
                        userId: userId,
                        subGroupId: subGroupId
                    }
                }
            });

            if (requestExist) {
                return res.status(409).json({
                    message: `Request already exists`,
                });
            }

            const request = await prisma.SubGroupMember.create({
                data: {
                    userId: userId,
                    subGroupId: subGroupId
                },
            });

            return res.status(200).json(request);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        } finally {
            await prisma.$disconnect();
        }
    }
);

module.exports = subGroupRequestRouter;