const passport = require('passport');
const express = require('express');
const banUserRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { UserType, BanType } = require('@prisma/client');

banUserRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id } = req.user;
            console.log(id);
            const foundUser = await prisma.user.findUnique({ where: { id: req.body.userId } });
            if (!foundUser) {
                return res.status(400).json({
                    message: `The user with that listed ID (${req.body.userId}) does not exist.`,
                });
            }
            if (foundUser.banned) {
                return res.status(400).json({
                    message: `This user is already banned.`,
                    details: {
                        errorMessage: "A user can only be banned once."
                    }
                });
            }
            const createdBan = await prisma.userBan.create({
                data: {
                    userId: req.body.userId,
                    banType: req.body.banType,
                    banReason: req.body.banReason,
                    banMessage: req.body.banMessage,
                    bannedBy: id,
                    banUntil: new Date(Date.now() + (parseInt(req.body.banDuration) * 24 * 60 * 60 * 1000)),
                    banDuration: parseInt(req.body.banDuration),
                }
            });
            const createBanHistory = await prisma.ban_History.create({
                data: {
                    userId: req.body.userId,
                    type: BanType.USER,
                    reason: req.body.banReason,
                    userBanType: req.body.banType,
                    userBannedUntil: new Date(Date.now() + (parseInt(req.body.banDuration) * 24 * 60 * 60 * 1000)),
                    modId: id,
                    message: req.body.banMessage,
                }
            });
            console.log("Created ban history: ", createBanHistory);
            res.status(200).json({
                message: `Successfully banned user ${req.body.userId}`,
                createdBan
            });
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to ban user ${req.body.userId}`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }
    }
)

banUserRouter.get(
    '/getAll',
    async (req, res) => {
        try {
            const allBans = await prisma.userBan.findMany();
            res.status(200).json(allBans)
        } catch (error) {
            res.status(400).json({
                message: `Error occurred when trying to get all banned users`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }
    }
)

banUserRouter.get(
    '/get/:userId',
    async (req, res) => {
        try {
            const userBan = await prisma.userBan.findMany({
                where: {
                    userId: req.params.userId
                },
                orderBy: {
                    id: "desc"
                }
            });
            if (userBan) {
                res.status(200).json(userBan)
            } else {
                res.status(400).json({
                    message: `The user with that listed ID (${req.params.userId}) has never been banned.`
                })
            }
        } catch (error) {
            console.log(error.stack);
            res.status(400).json({
                message: `Error occurred when trying to get banned user ${req.params.userId}`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }
    }
)

banUserRouter.get(
    '/getMostRecent/:userId',
    async (req, res) => {
        try {
            const userBan = await prisma.userBan.findFirst({
                where: {
                    userId: req.params.userId
                },
                orderBy: {
                    id: "desc"
                }
            });
            if (userBan) {
                res.status(200).json(userBan)
            } else {
                res.status(200).json({
                    message: `The user with that listed ID (${req.params.userId}) has never been banned.`
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: `Error occurred when trying to get banned user ${req.params.userId}`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }
    }
)

banUserRouter.get(
    '/getMostRecentWithToken',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id } = req.user;
            console.log(`From banToken: ${id}`)
            const userBanInfo = await prisma.userBan.findFirst({
                where: {
                    userId: id
                },
                orderBy: {
                    id: "desc"
                }
            });
            if (!userBanInfo) {
                res.status(200).send(false)
            } else {
                res.status(200).json(userBanInfo);
            }
        } catch (err) {
            res.status(400).json({
                message: `Error occurred when trying to check if current session user is banned.`,
                details: {
                    errorMessage: err.message,
                    errorStack: err.stack
                }
            });
        }
    }
);

banUserRouter.put(
    '/update/:userId',
    async (req, res) => {
        try {
            const mostRecentUserBan = await prisma.userBan.findFirst({
                where: {
                    userId: req.params.userId
                },
                orderBy: {
                    id: "desc"
                }
            });
            if (!mostRecentUserBan) {
                console.log("Modifying Ban error !mostRecentUserBan: ");
                return res.status(400).json({
                    message: `${req.params.userId} has no record of being banned.`
                })
            }
            const updateBan = await prisma.userBan.update({
                where: {
                    id: mostRecentUserBan.id
                },
                data: req.body
            })
            if (!updateBan) {
                console.log("Modifying Ban error !updateBan: ");
                return res.status(404).json({ message: "Update on ban is unsuccessful" });
            }
            return res.status(200).json(updateBan);
        } catch (err) {
            console.log("Modifying Ban error catch: ");
            console.log(err.stack)
            return res.status(400).json({
                message: `Error occurred when trying to update ban.`,
                details: {
                    errorMessage: err.message,
                    errorStack: err.stack
                }
            });
        }
    }
)

// banRouter.delete(
//     '/delete/:userId',
//     async (req, res) => {
//         try {
//             const deletedBan = await prisma.ban.delete({
//                 where: {
//                     userId: req.params.userId
//                 }
//             })
//             res.status(200).json({
//                 message: `User ${req.params.userId} successfully removed from ban table`,
//                 deletedBan
//             })
//         } catch (error) {
//             console.log(error);
//             res.status(400).json({
//                 message: `Error occurred when trying to get unban user ${req.params.userId}`,
//                 details: {
//                     errorMessage: error.message,
//                     errorStack: error.stack,
//                 }
//             });
//         }
//     }
// )

banUserRouter.get(
    '/getAllPassedDate',
    async (req, res) => {
        try {
            // Get banned users from user table
            const bannedUsers = await prisma.user.findMany({
                where: {
                    banned: true
                }
            })
            let bannedUserIds = bannedUsers.map(bannedUser => bannedUser.id);

            // Find all banned users most recent ban
            const bans = await prisma.userBan.findMany({
                where: {
                    userId: {
                        in: bannedUserIds
                    },
                },
                orderBy: { id: "desc" },
                distinct: ['userId'],
            })
            // Create array of expired banned userIds
            let expiredBanUserIds = [];
            bans.map(ban => { if (ban.banUntil <= new Date(Date.now())) expiredBanUserIds.push(ban.userId) });
            console.log("Expired Ban UserIds: " + expiredBanUserIds);
            res.status(200).json(expiredBanUserIds);
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: `Error occurred when trying to get unban users`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }
    }
);

// Not sure if necessary anymore
banUserRouter.delete(
    '/deletePassedBanDate',
    async (req, res) => {
        try {
            const deletedBans = await prisma.ban.deleteMany({
                where: {
                    banUntil: {
                        lte: new Date(Date.now())
                    }
                }
            });
            res.status(200).json({
                message: `Successfully removed from users ban table`,
                deletedBans
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: `Error occurred when trying to get unban users`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        }
    }
)


module.exports = banUserRouter;
