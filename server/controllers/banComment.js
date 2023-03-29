const passport = require('passport');
const express = require('express');
const banCommentRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { BanType } = require('@prisma/client');

banCommentRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id } = req.user;
            const foundComment = await prisma.ideaComment.findUnique({ where: { id: parseInt(req.body.commentId) } });
            if (!foundComment) {
                return res.status(400).json({
                    message: `The comment (${req.body.commentId}) does not exist.`,
                });
            }

            const commentAlreadyBanned = await prisma.commentBan.findFirst({ where: { commentId: req.body.commentId } });
            if (commentAlreadyBanned) {
                return res.status(400).json({
                    message: `This comment is already banned.`,
                    details: {
                        errorMessage: "A comment can only be banned once."
                    }
                });
            }

            const createdBan = await prisma.commentBan.create({
                data: {
                    commentId: req.body.commentId,
                    authorId: req.body.authorId,
                    banReason: req.body.banReason,
                    banMessage: req.body.banMessage,
                    bannedBy: id,
                }
            });

            const createBanHistory = await prisma.ban_History.create({
                data: {
                    userId: req.body.authorId,
                    type: BanType.COMMENT,
                    reason: req.body.banReason,
                    ideaId: foundComment.ideaId,
                    commentId: req.body.commentId,
                    modId: id,
                    message: req.body.banMessage,
                }
            });
            console.log("Created ban history: ", createBanHistory)
            res.status(200).json({
                message: `Successfully banned comment ${req.body.commentId}`,
                createdBan
            });
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to ban comment ${req.body.commentId}`,
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

banCommentRouter.get(
    '/getUndismissedNotification/:userId',
    async (req, res) => {
        try {
            const foundBan = await prisma.commentBan.findMany({
                where: { notificationDismissed: false, authorId: req.params.userId },
                include: { comment: true }
            });
            if (!foundBan) {
                return res.status(200).json({
                    message: "No comment bans found.",
                    foundBan
                });
            }
            res.status(200).send(foundBan);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to get undismissed comment notifications`,
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

banCommentRouter.get(
    '/getByCommentId/:banCommentId',
    async (req, res) => {
        try {
            const foundBan = await prisma.commentBan.findFirst({ where: { commentId: parseInt(req.params.banCommentId) } });
            if (!foundBan) {
                return res.status(400).json({
                    message: `The ban (${req.params.banCommentId}) does not exist.`,
                });
            }
            res.status(200).send(foundBan);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to get banned comment`,
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


banCommentRouter.put(
    '/dismissNotification/:banCommentId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const foundBan = await prisma.commentBan.findUnique({ where: { id: parseInt(req.params.banCommentId) } });
            if (!foundBan) {
                return res.status(400).json({
                    message: `The ban (${req.params.banCommentId}) does not exist.`,
                });
            }
            const updatedBan = await prisma.commentBan.update({
                where: { id: parseInt(req.params.banCommentId) },
                data: { notificationDismissed: true }
            });
            res.status(200).json({
                message: `Successfully dismissed notification for comment ban: ${req.params.banCommentId}`,
                updatedBan
            });
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to dismiss comment notification`,
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

banCommentRouter.delete(
    '/delete/:banCommentId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const foundBan = await prisma.commentBan.findFirst({ where: { commentId: parseInt(req.params.banCommentId) } });
            if (!foundBan) {
                return res.status(400).json({
                    message: `The ban (${req.params.banCommentId}) does not exist.`,
                });
            }
            const deletedBan = await prisma.commentBan.delete({ where: { id: foundBan.id } });
            res.status(200).json({
                message: `Successfully deleted comment ban: ${req.params.banCommentId}`,
                deletedBan
            });
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                message: `Error occurred when trying to delete comment ban`,
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

module.exports = banCommentRouter;
