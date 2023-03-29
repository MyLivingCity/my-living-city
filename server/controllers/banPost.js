const passport = require('passport');
const express = require('express');
const banPostRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { BanType } = require('@prisma/client');

banPostRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id } = req.user;
            const foundPost = await prisma.idea.findUnique({ where: { id: req.body.postId } });
            if (!foundPost) {
                return res.status(400).json({
                    message: `The post (${req.body.postId}) does not exist.`,
                });
            }

            const postAlreadyBanned = await prisma.postBan.findFirst({ where: { postId: req.body.postId } });
            if (postAlreadyBanned) {
                return res.status(400).json({
                    message: `This post is already banned.`,
                    details: {
                        errorMessage: "A post can only be banned once."
                    }
                });
            }

            const createdBan = await prisma.postBan.create({
                data: {
                    postId: req.body.postId,
                    authorId: req.body.authorId,
                    banReason: req.body.banReason,
                    banMessage: req.body.banMessage,
                    bannedBy: id,
                }
            });

            const createBanHistory = await prisma.ban_History.create({
                data: {
                    userId: req.body.authorId,
                    type: BanType.IDEA,
                    reason: req.body.banReason,
                    ideaId: req.body.postId,
                    modId: id,
                    message: req.body.banMessage,
                }
            });
            console.log("Created ban history: ", createBanHistory)
            res.status(200).json({
                message: `Successfully banned post: ${req.body.postId}`,
                createdBan
            });
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to ban post: ${req.body.postId}`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

banPostRouter.get(
    '/getUndismissedNotification/:userId',
    async (req, res) => {
        try {
            const foundBan = await prisma.postBan.findMany({
                where: { notificationDismissed: false, authorId: req.params.userId },
                include: { post: true }
            });
            if (!foundBan) {
                return res.status(200).json({
                    message: "No post bans found.",
                    foundBan
                });
            }
            res.status(200).send(foundBan);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to get undismissed notifications`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

banPostRouter.get(
    '/getByPostId/:banPostId',
    async (req, res) => {
        try {
            const foundBan = await prisma.postBan.findFirst({ where: { postId: parseInt(req.params.banPostId) } });
            if (!foundBan) {
                return res.status(400).json({
                    message: `The ban (${req.params.banPostId}) does not exist.`,
                });
            }
            res.status(200).send(foundBan);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to get banned post`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

banPostRouter.put(
    '/dismissNotification/:banPostId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const foundBan = await prisma.postBan.findUnique({ where: { id: parseInt(req.params.banPostId) } });
            if (!foundBan) {
                return res.status(400).json({
                    message: `The ban (${req.params.banPostId}) does not exist.`,
                });
            }
            const updatedBan = await prisma.postBan.update({
                where: { id: parseInt(req.params.banPostId) },
                data: { notificationDismissed: true }
            });
            res.status(200).json({
                message: `Successfully dismissed notification for ban: ${req.params.banPostId}`,
                updatedBan
            });
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to dismiss notification`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

banPostRouter.delete(
    '/delete/:banPostId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const foundBan = await prisma.postBan.findFirst({ where: { postId: parseInt(req.params.banPostId) } });
            if (!foundBan) {
                return res.status(400).json({
                    message: `The ban (${req.params.banPostId}) does not exist.`,
                });
            }
            const deletedBan = await prisma.postBan.delete({ where: { id: foundBan.id } });
            res.status(200).json({
                message: `Successfully deleted ban: ${req.params.banPostId}`,
                deletedBan
            });
        } catch (error) {
            console.log(error.stack);
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to delete ban`,
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

module.exports = banPostRouter;
