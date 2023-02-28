const passport = require('passport');
const express = require('express');
const badPostBehaviorRouter = express.Router();
const prisma = require('../lib/prismaClient');

badPostBehaviorRouter.put(
    '/incrementBadPostCount/:ideaId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const { ideaId } = req.params;
        try {
            const foundIdea = await prisma.idea.findUnique({ where: { id: parseInt(ideaId) } });
            if (!foundIdea) {
                return res.status(400).json({
                    message: 'Idea not found',
                });
            }
            
            //check for user with authorId in bad posting behaviour table, if found then update their badPostCount in bad posting behaviour table else create a new entry
            const user = await prisma.bad_Posting_Behavior.findFirst({
                where: {
                    userId: foundIdea.authorId,
                },
            });

            if (user) {
                //update badPostCount
                console.log("Bad post count: " + user.bad_post_count);
                await prisma.bad_Posting_Behavior.updateMany({
                    where: {
                        userId: foundIdea.authorId,
                    },
                    data: {
                        bad_post_count: user.bad_post_count + 1,
                    },
                });
                res.status(200).json({
                    message: 'Bad post count updated',
                });
            } else {
                //create new entry
                await prisma.bad_Posting_Behavior.create({
                    data: {
                        userId: foundIdea.authorId,
                        bad_post_count: 1,
                    },
                });

                res.status(200).json({
                    message: 'Bad post count created',
                });
            }
        } catch (error) {
            res.status(400).json({
                message: 'Bad post count not updated',
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

module.exports = badPostBehaviorRouter;