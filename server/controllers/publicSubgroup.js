const express = require('express');
const publicSubgroupRouter = express.Router();
const prisma = require('../lib/prismaClient');

publicSubgroupRouter.get(
    '/public/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: `A valid userId must be specified in the route paramater.`,
                });
            }

            const publicSubgroups = await prisma.SubGroup.findMany({
                where: {
                    privacyField: 'PUBLIC',
                    managerId: {not: userId},
                    members: {
                        none: {
                            userId: userId,

                        }
                    },
                    
                },
                select: {
                    id: true,
                    name: true,
                    region: {
                        select: {
                            name: true
                        }
                    },
                    segment: {
                        select: {
                            name: true
                        }
                    },
                    subSegment: {
                        select: {
                            name: true
                        }
                    },
                    description: true
                },
                orderBy: { name: 'asc' }
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

module.exports = publicSubgroupRouter;