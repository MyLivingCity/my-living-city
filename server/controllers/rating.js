const passport = require('passport');

const express = require('express');
const ideaRatingRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { checkIdeaThresholds } = require('../lib/prismaFunctions');

ideaRatingRouter.get(
  '/test/:ideaId',
  async (req, res, next) => {
    try {
      const parsedIdeaId = parseInt(req.params.ideaId);
      let thresholds = await checkIdeaThresholds(parsedIdeaId);
      res.json(thresholds);
      // res.json({
      //   route: 'welcome to the Idea Rating Router'
      // })
    } catch (error) {
      res.status(400).json({
        message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      })
    }
  }
)

ideaRatingRouter.get(
  '/getall',
  async (req, res, next) => {
    try {
      const allIdeaRating = await prisma.ideaRating.findMany();

      res.status(200).json(allIdeaRating);
    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to fetch all Idea Ratings",
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

// Get all ratings under idea id including aggregations
ideaRatingRouter.get(
  '/getall/:ideaId/aggregations',
  async (req, res, next) => {
    try {
      const parsedIdeaId = parseInt(req.params.ideaId);

      // check if id is valid
      if (!parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route paramater.`,
        });
      }

      const ratings = await prisma.ideaRating.findMany({ where: { ideaId: parsedIdeaId } });
      const posRatings = await prisma.ideaRating.aggregate({
        where: {
          ideaId: parsedIdeaId,
          rating: {
            gt: 0
          }
        },
        count: true
      })
      const negRatings = await prisma.ideaRating.aggregate({
        where: {
          ideaId: parsedIdeaId,
          rating: {
            lt: 0
          }
        },
        count: true
      })
      const aggregates = await prisma.ideaRating.aggregate({
        where: { ideaId: parsedIdeaId },
        avg: {
          rating: true
        },
        count: true,
      })

      const summary = {
        ratingAvg: aggregates.avg.rating,
        ratingCount: aggregates.count,
        posRatings: posRatings.count,
        negRatings: negRatings.count,
      }

      res.status(200).json({
        ratings,
        summary,
      });
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to fetch all ratings under idea ${req.params.ideaId}.`,
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

// Get all ratings under idea id
ideaRatingRouter.get(
  '/getall/:ideaId',
  async (req, res, next) => {
    try {
      const parsedIdeaId = parseInt(req.params.ideaId);

      // check if id is valid
      if (!parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route paramater.`,
        });
      }

      const ratings = await prisma.ideaRating.findMany({ where: { ideaId: parsedIdeaId } });

      res.status(200).json(ratings);
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to fetch all ratings under idea ${req.params.ideaId}.`,
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

// Create a rating under an idea
ideaRatingRouter.post(
  '/create/:ideaId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const { rating, ratingExplanation } = req.body;
      const parsedIdeaId = parseInt(req.params.ideaId);

      // check if id is valid
      if (!parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route paramater.`,
        });
      }

      const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId } });
      if (!foundIdea) {
        return res.status(400).json({
          message: `The idea with that listed ID (${ideaId}) does not exist.`,
        });
      }

      // Check if user already submitted rating under "idea"
      const userAlreadyCreatedRating = await prisma.ideaRating.findFirst({
        where: {
          authorId: loggedInUserId,
          ideaId: parsedIdeaId,
        }
      });
      if (userAlreadyCreatedRating) {
        return res.status(400).json({
          message: `You have already rated this idea. You cannot rate an idea twice.`,
          details: {
            errorMessage: "A rating can only be voted on once."
          }
        });
      }

      const createdRating = await prisma.ideaRating.create({
        data: {
          rating,
          ratingExplanation,
          authorId: loggedInUserId,
          ideaId: parsedIdeaId,
        }
      });

      // has fields "triggerProposalAdvancement", "triggerProjectAdvancement", "isChampionable".
      // Logic for "isChampionable" is not implemented yet.
      const {
        triggerProposalAdvancement,
        triggerProjectAdvancement,
      } = await checkIdeaThresholds(parsedIdeaId);

      let updatedIdea = null;
      // Advance Idea to Proposal if thresholds are met 
      if (triggerProposalAdvancement) {
        console.log("Updating idea to Proposal state");
        updatedIdea = await prisma.idea.update({
          where: { id: parsedIdeaId },
          data: {
            state: 'PROPOSAL',

          },
        });
      }

      // Advance Proposal to Project if Thresholds and conditions are met
      if (triggerProjectAdvancement) {
        console.log("Updating idea to Project state");
        updatedIdea = await prisma.idea.update({
          where: { id: parsedIdeaId },
          data: {
            state: 'PROJECT',
            projectInfo: {
              create: {
                description: 'Project has been initialized.'
              }
            }
          }
        })
      }

      res.status(200).json({
        message: `Rating succesfully created under Idea ${parsedIdeaId}`,
        rating: createdRating,
        updatedIdea,
      });
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to create a rating for idea ${req.params.ideaId}.`,
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

// Create a rating under an idea
ideaRatingRouter.put(
  '/update/:ratingId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const { rating, ratingExplanation } = req.body;
      const parsedRatingId = parseInt(req.params.ratingId);

      // check if id is valid
      if (!parsedRatingId) {
        return res.status(400).json({
          message: `A valid ratingId must be specified in the route paramater.`,
        });
      }

      // Check to see if rating exists
      const foundRating = await prisma.ideaRating.findUnique({ where: { id: parsedRatingId } });
      if (!foundRating) {
        return res.status(400).json({
          message: `The rating with the listed ID (${commentId}) does not exist.`,
        });
      }

      // Check if rating is owned by requestee
      const ratingOwnedByUser = foundRating.authorId === loggedInUserId;
      if (!ratingOwnedByUser) {
        return res.status(401).json({
          message: `The user ${email} is not the author or an admin and therefore cannot edit this rating.`
        });
      }

      // Conditional add params to update only fields passed in 
      const updateData = {
        ...rating && { rating }, // TODO: 0 is valid input and is also falsy will not be updated
        ...ratingExplanation && { ratingExplanation }
      };

      const updatedRating = await prisma.ideaRating.update({
        where: { id: parsedRatingId },
        data: updateData
      });

      res.status(200).json({
        message: "Rating succesfully updated",
        rating: updatedRating,
      });
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to edit rating ${req.params.ratingId}.`,
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

// delete a rating by ID
ideaRatingRouter.delete(
  '/delete/:ratingId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const parsedRatingId = parseInt(req.params.ratingId);

      // check if id is valid
      if (!parsedRatingId) {
        return res.status(400).json({
          message: `A valid ratingId must be specified in the route paramater.`,
        });
      }

      // Check to see if comment exists
      const foundRating = await prisma.ideaRating.findUnique({ where: { id: parsedRatingId } });
      if (!foundRating) {
        return res.status(400).json({
          message: `The rating with the listed ID (${commentId}) does not exist.`,
        });
      }

      // Check if comment is requestee's comment
      const ratingOwnedByUser = foundRating.authorId === loggedInUserId;
      if (!ratingOwnedByUser) {
        return res.status(401).json({
          message: `The user ${email} is not the author or an admin and therefore cannot delete this comment.`
        });
      }

      const deletedRating = await prisma.ideaRating.delete({ where: { id: parsedRatingId } });

      res.status(200).json({
        message: "Rating succesfully deleted",
        deletedRating,
      });
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to delete rating ${req.params.ratingId}.`,
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

ideaRatingRouter.get(
  '/aggregate/:ideaId',
  async (req, res, next) => {
    try {
      const parsedIdeaId = parseInt(req.params.ideaId);

      // Check if idea exists
      const foundIdea = await prisma.idea.findFirst({
        where: {
          id: parsedIdeaId
        }
      });
      if (!foundIdea) {
        return res.status(400).json({
          message: `The Idea with listed id ${parsedIdeaId} does not exist.`,
        });
      }

      // Grab data
      const negativeRatings = await prisma.ideaRating.aggregate({
        where: {
          ideaId: parsedIdeaId,
          rating: {
            lt: 0
          }
        },
        count: true,
      });

      const positiveRatings = await prisma.ideaRating.aggregate({
        where: {
          ideaId: parsedIdeaId,
          rating: {
            gt: 0
          }
        },
        count: true,
      });
      const aggregations = await prisma.ideaRating.aggregate({
        where: {
          ideaId: parsedIdeaId,
        },
        avg: {
          rating: true,
        },
        count: true,
      });

      // Shape data
      const result = {
        count: aggregations.count,
        avg: aggregations.avg.rating,
        negativeRatings: {
          count: negativeRatings.count,
        },
        positiveRatings: {
          count: positiveRatings.count,
        },
      };
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to check the ratings of idea #${req.params.ideaId}.`,
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

module.exports = ideaRatingRouter;