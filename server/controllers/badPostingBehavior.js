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

badPostBehaviorRouter.put(
    '/incrementPostFlagCount/:ideaId',
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

            //check for user with authorId in bad posting behaviour table, if found then update their postFlagCount in bad posting behaviour table else create a new entry
            const user = await prisma.bad_Posting_Behavior.findFirst({
                where: {
                    userId: foundIdea.authorId,
                },
            });

            if (user) {
                //update postFlagCount
                console.log("Post flag count: " + user.post_flag_count);
                await prisma.bad_Posting_Behavior.updateMany({
                    where: {
                        userId: foundIdea.authorId,
                    },
                    data: {
                        post_flag_count: user.post_flag_count + 1,
                    },
                });
                res.status(200).json({
                    message: 'Post flag count updated',
                });
            } else {
                //create new entry
                await prisma.bad_Posting_Behavior.create({
                    data: {
                        userId: foundIdea.authorId,
                        post_flag_count: 1,
                    },
                });

                res.status(200).json({
                    message: 'Post flag count created',
                });
            }
        } catch (error) {
            res.status(400).json({
                message: 'Post flag count not updated',
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

//update the bad_post_count and post_flag_count to 0 
badPostBehaviorRouter.put(
    '/resetBadPostCount/:ideaId',
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

            const user = await prisma.bad_Posting_Behavior.findFirst({
                where: {
                    userId: foundIdea.authorId,
                },
            });

            if (user) {
                //update bad_post_count and post_flag_count to 0
                await prisma.bad_Posting_Behavior.updateMany({
                    where: {
                        userId: foundIdea.authorId,
                    },
                    data: {
                        bad_post_count: 0,
                        post_flag_count: 0,
                    },
                });
                res.status(200).json({
                    message: 'Bad post count and post flag count reset',
                });
            } else {
                res.status(200).json({
                    message: 'Bad post count and post flag count not reset',
                });
            }
        } catch (error) {
            res.status(400).json({
                message: 'Bad post count and post flag count not reset',
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


//check if user has bad_post_count and post_flag_count greater than or equal to 3, if yes then update their post_comment_ban to true
badPostBehaviorRouter.put(
    '/checkUser/:userId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const { userId } = req.params;
        try {
            const user = await prisma.bad_Posting_Behavior.findFirst({
                where: {
                    userId: userId,
                },
            });
            if (user) {
                if (user.bad_post_count >= 3 || user.post_flag_count >= 3) {
                    //update post_comment_ban to true
                    await prisma.user.updateMany({
                        where: {
                            id: userId,
                        },
                        data: {
                            post_comment_ban: true,
                        },
                    });
                    res.status(200).json({
                        message: 'User banned',
                    });
                } else {
                    res.status(200).json({
                        message: 'User not banned',
                    });
                }
            } else {
                res.status(200).json({
                    message: 'User not banned',
                });
            }
        } catch (error) {
            return res.status(400).json({
                message: 'User has too many bad/flagged posts. Post was NOT submittted.',
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

badPostBehaviorRouter.get(
    //get all users from bad_posting_behavior table
    '/getAll',
    async (req, res) => {
        try {
            const result = await prisma.bad_Posting_Behavior.findMany();
            res.status(200).send(result);
        } catch (error) {
            res.status(400).json({
                message: 'Users not found',
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

//get all data from bad_posting_behavior table based on userId
badPostBehaviorRouter.get(
    '/getBadPostingBehavior',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id } = req.user;
            const user = await prisma.bad_Posting_Behavior.findFirst({
                where: {
                    userId: id,
                },
            });
            if (user) {
                res.status(200).send(user);
            } else {
                //send null
                res.status(200).send(null);
            }
        } catch (error) {
            res.status(400).json({
                message: 'User not found',
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

badPostBehaviorRouter.put(
    '/checkThreshhold',
    async (req, res) => {
        try {
            //find the threshhold in threshhold table with the id of 3
            const threshhold = await prisma.threshhold.findUnique({
                where: {
                    id: 3,
                },
            });
            const badPostingBehavior = await prisma.bad_Posting_Behavior.findMany();
            badPostingBehavior.forEach(async (user) => {
                total = user.bad_post_count + user.post_flag_count;
                if (total >= threshhold.number) {
                    //update post_comment_ban to true
                    console.log('user', user);
                    console.log('user.userId', user.userId);
                    console.log('user.bad_post_count', user.bad_post_count);
                    console.log('user.post_flag_count', user.post_flag_count);
                    console.log('5threshhold.number', threshhold.number);
                    await prisma.bad_Posting_Behavior.updateMany({
                        where: {
                            userId: user.userId,
                        },
                        data: {
                            post_comment_ban: true,
                        },
                    });
                }
            });
            res.status(200).send('checkBadPostingThreshhold complete');
        } catch (error) {
            res.status(400).json({
                message: 'checkBadPostingThreshhold failed',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                },
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

module.exports = badPostBehaviorRouter;