const passport = require('passport');
const express = require('express');
const subgroupRouter = express.Router();
const prisma = require('../../lib/prismaClient');

const { isEmpty, isInteger, isString } = require('lodash');
const { UserType } = require('@prisma/client');



subgroupRouter.get('/getAll', async (req, res) => {
    try {
        const result = await prisma.subGroup.findMany({
            include: {
                region: { select: { name: true } },
                segment: { select: { name: true } },
                subSegment: { select: { name: true } },
                manager: {
                    select: {
                        id: true,
                        email: true,
                        adminmodEmail: true,
                        fname: true,
                        lname: true,
                    },
                },
            },
        });

        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: 'An error occurred while trying to retrieve Subgroups.',
            details: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
        });
    } finally {
        await prisma.$disconnect();
    }
});



subgroupRouter.get(
    '/getByName/:name',
    async (req, res) => {
        const { name } = req.params;

        try {
            const result = await prisma.subGroup.findMany({
                where: {
                    name: {
                        contains: name,
                    }
                }
            });

            if (!result || result.length === 0) {
                return res.status(404).json({ message: `No Subgroups found with name '${name}'` });
            }

            res.status(200).json(result);

        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: "An error occurred while trying to retrieve Subgroups by name.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
);


subgroupRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            console.log("create subgroup", req.body);

            // Get email and user id from JWT
            const { email, id } = req.user;

            // Find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where: { id },
                select: { userType: true }
            });

            // Only admins/mods can create subgroups
            if (!['SUPER_ADMIN', 'ADMIN', 'MOD'].includes(theUser.userType)) {
                return res.status(403).json({
                    message: "You don't have the right to add a subgroup!",
                    details: {
                        errorMessage: 'You must be an admin/mod to create a subgroup.',
                        errorStack: 'user must be an admin/mod to create a subgroup'
                    }
                });
            }

            // Extract fields from request body
            const {
                name,
                description,
                typeField,
                privacyField,
                regionId,
                segmentId,
                subSegmentId,
                managerId,
            } = req.body;

            // Create the subgroup
            const newSubGroup = await prisma.subGroup.create({
                data: {
                    name,
                    description,
                    typeField,
                    privacyField,
                    regionId,
                    segmentId,
                    subSegmentId,
                    manager: { connect: { id: managerId } },
                },
                include: {
                    manager: true,
                }
            });

            res.status(201).json(newSubGroup);

        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: "An error occurred while trying to create a Subgroup.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
);


subgroupRouter.delete(
    '/delete/:subGroupId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            // Get user info from JWT
            const { id } = req.user;

            // Find the requesting user
            const theUser = await prisma.user.findUnique({
                where: { id },
                select: { userType: true }
            });

            // Only admin/mod can delete subgroup
            if (!['SUPER_ADMIN', 'ADMIN', 'MOD'].includes(theUser.userType)) {
                return res.status(403).json({
                    message: "You don't have the right to delete a subgroup!",
                    details: {
                        errorMessage: 'You must be an admin/mod to delete a subgroup.',
                        errorStack: 'user must be admin/mod to delete subgroup'
                    }
                });
            }

            const { subGroupId } = req.params;

            // Check if subgroup exists
            const existingSubGroup = await prisma.subGroup.findUnique({
                where: { id: subGroupId }
            });

            if (!existingSubGroup) {
                return res.status(404).json({ message: `Subgroup with id ${subGroupId} not found.` });
            }

            // Delete the subgroup
            await prisma.subGroup.delete({
                where: { id: subGroupId }
            });

            res.sendStatus(204);
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: "An error occurred while trying to delete the subgroup.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
);


subgroupRouter.patch(
    '/update/:subGroupId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id: userId } = req.user;

            const theUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { userType: true }
            });

            // Only admin/mod can update
            if (!['SUPER_ADMIN', 'ADMIN', 'MOD'].includes(theUser.userType)) {
                return res.status(403).json({
                    message: "You don't have the right to update a subgroup!",
                    details: {
                        errorMessage: 'You must be an admin/mod to update a subgroup.',
                        errorStack: 'user must be admin/mod to update subgroup'
                    }
                });
            }

            const { subGroupId } = req.params;

            const {
                name,
                description,
                typeField,
                privacyField,
            } = req.body;

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    message: 'The objects in the request body are missing',
                    details: {
                        errorMessage: 'Updating a subgroup must supply necessary fields explicitly.',
                        errorStack: 'necessary fields must be provided in the body with valid values',
                    }
                });
            }

            const existingSubGroup = await prisma.subGroup.findUnique({
                where: { id: subGroupId }
            });

            if (!existingSubGroup) {
                return res.status(404).json({ message: `Subgroup with id ${subGroupId} not found.` });
            }

            // Update subgroup
            const updatedSubGroup = await prisma.subGroup.update({
                where: { id: subGroupId },
                data: {
                    name,
                    description,
                    typeField,
                    privacyField,
                },

                include: {
                    region: { select: { name: true } },
                    segment: { select: { name: true } },
                    subSegment: { select: { name: true } },
                    manager: {
                        select: {
                            id: true,
                            email: true,
                            adminmodEmail: true,
                            fname: true,
                            lname: true,
                        },
                    },
                }
            });

            res.status(200).json(updatedSubGroup);
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: "An error occurred while trying to update a subgroup.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
);


subgroupRouter.get('/eligibleManagers', async (req, res) => {
    try {
        const managers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                adminmodEmail: true,
                fname: true,
                lname: true,
            }
        });

        res.status(200).json(managers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching managers', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
});


module.exports = subgroupRouter;


