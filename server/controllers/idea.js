const passport = require('passport');
const express = require('express');
const ideaRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { checkIdeaThresholds } = require('../lib/prismaFunctions');
const { imagePathsToS3Url } = require('../lib/utilityFunctions');
const { deleteImage } = require('../lib/imageBucket');
const { isInteger, isEmpty } = require('lodash');
const { makeUpload } = require('../lib/imageBucket');
const { validateIdeaPostingAccess } = require("../helpers/idea/ideaHelpers.js");
const { UserSegmentRelationShipType } = require('@prisma/client');

const upload = makeUpload("idea-proposal").single('imagePath');

let error = '';
let errorMessage = '';
let errorStack = '';

// post request to create an idea
ideaRouter.post(
  '/create',
  [passport.authenticate('jwt', { session: false }), upload],
  async (req, res) => {
    let imagePath;
    try {
      if (req.file) {
        imagePath = req.file.key.substring(req.file.key.indexOf("/") + 1);
      }
      else {
        imagePath = null;
      }
      //check if user is in bad posting behavior table if so res.status(400).json({message: 'User is in bad posting behavior table'})
      const { id } = req.user;

      const user = await prisma.bad_Posting_Behavior.findFirst({
        where: {
          userId: id,
          post_comment_ban: true,
        },
      });

      if (user) {
        return res.status(400).json({
          message: 'User is in bad posting behavior table',
        });
      }

      //if there's no object in the request body
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: 'The objects in the request body are missing',
          details: {
            errorMessage: 'Creating an idea must supply necessary fields explicitly.',
            errorStack: 'necessary fields must be provided in the body with a valid id found in the database.',
          }
        })
      }

      let {
        categoryId,
        superSegmentId,
        segmentId,
        subSegmentId,
        banned,
        title,
        description,
        proposal_role,
        requirements,
        proposal_benefits,
        communityImpact,
        natureImpact,
        artsImpact,
        energyImpact,
        manufacturingImpact,
        supportingProposalId,
        state,
      } = req.body;

      // passport middleware provides this based on JWT
      const { email } = req.user;

      const theUserSegment = await prisma.userSegments.findMany({ where: { userId: id }, include: { segment: true } });
      const userSegments = []

      const { homeSuperSegId, workSuperSegId, schoolSuperSegId, homeSegmentId, workSegmentId, schoolSegmentId, homeSubSegmentId, workSubSegmentId, schoolSubSegmentId } = theUserSegment;

      if (!isInteger(categoryId)) {
        categoryId = parseInt(categoryId)
      }

      const validationResult = await validateIdeaPostingAccess({
        userId: id,
        subSegmentId,
        segmentId,
        superSegmentId,
        categoryId,
        banned,
        userSegments
      });

      if (validationResult.error) {
        return res.status(400).json(validationResult);
      }

      // Parse data
      const geoData = JSON.parse(req.body.geo);
      //if geoData parse failed
      if (!typeof geoData == "object") {
        error += 'Geo data parse error! ';
        errorMessage += 'Something is wrong about the text string of geo data! ';
        errorStack += 'Geo data json string parsing failed! '
      }

      const addressData = JSON.parse(req.body.addressData);

      if (!typeof addressData == "object") {
        error += 'Address data parse error! ';
        errorMessage += 'Something is wrong about the text string of address data! ';
        errorStack += 'Address data json string parsing failed! '
      }

      //If there's error in error holder
      if (error || errorMessage || errorStack) {
        await deleteImage("idea-proposal", imagePath); // delete image if idea/proposal creation errors out
        return res.status(400).json({
          message: error,
          details: {
            errorMessage: errorMessage,
            errorStack: errorStack
          }
        });
      }
      let notification_dismissed = false
      let quarantined_at = new Date()

      const segments = { connect : [] }

      if (segmentId) { 
        segments.connect.push( { segId: parseInt(segmentId) } )
      } 
      if (superSegmentId) { 
        segments.connect.push( { segId: parseInt(superSegmentId) } )
      } 
      if (subSegmentId) { 
        segments.connect.push( { segId: parseInt(subSegmentId) } )
      }

      const ideaData = {
        categoryId,
        authorId: id,
        imagePath: imagePath,
        title,
        description,
        proposal_role,
        requirements,
        proposal_benefits,
        communityImpact,
        natureImpact,
        artsImpact,
        energyImpact,
        manufacturingImpact,
        supportingProposalId,
        state,
        notification_dismissed,
        quarantined_at,
        segments: segments
      };

      // Create an idea and make the author JWT bearer
      const createdIdea = await prisma.idea.create({
        data: {
          geo: { create: geoData },
          address: { create: addressData },
          ...ideaData,
        },
        include: {
          geo: true,
          address: true,
          category: true,
          segments:true,
        }
      });

      res.status(201).json(createdIdea);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: "An error occured while trying to create an Idea.",
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });
    } finally {
      await prisma.$disconnect();
    }
  });

ideaRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to Idea Router'
      })
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      })
    }
  }
)

// Get all Ideas
ideaRouter.get(
  '/getall',
  async (req, res, next) => {
    try {
      const allIdeas = await prisma.idea.findMany({
        orderBy: {
          updatedAt: 'desc'
        }
      });
      await imagePathsToS3Url(allIdeas, "idea-proposal");
      console.log("IDeas here" + allIdeas)
      return res.status(200).json(allIdeas);
    } catch (error) {
      return res.status(400).json({
        message: "An error occured while trying to fetch all ideas",
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

// Get all ideas with aggregations
ideaRouter.post(
  '/getall/with-sort',
  async (req, res, next) => {
    try {
      const allIdeas = await prisma.idea.findMany(req.body);
      await imagePathsToS3Url(allIdeas, "idea-proposal");

      return res.status(200).json(allIdeas);
    } catch (error) {
      return res.status(400).json({
        message: "An error occured while trying to fetch all ideas",
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

ideaRouter.post('/getall/aggregations', async (req, res, next) => {
  try {
    let take = req.body.take;
    take = Number.isInteger(take) ? Number(take) : undefined;

    const ideas = await prisma.idea.findMany({
      take: take,
      include: {
        segments: {
          include: {
            parentSegment: true,
            children: true,
          }
        },
        author: {
          select: {
            fname: true,
          }
        },
        address: {
          select: {
            streetAddress: true,
          }
        },
        category: true,
        comments: {
          select: {
            id: true,
          }
        },
        ratings: {
          select: {
            id: true,
            rating: true,
          }
        },
      },
      orderBy: [
        { updatedAt: 'desc' }
      ]
    });

    // Process the results to match the expected format
    const processedIdeas = ideas.map(idea => {
      // Calculate ratings stats
      const ratings = idea.ratings || [];
      const comments = idea.comments || [];
      const totalRatings = ratings.length;
      const totalComments = comments.length;

      const ratingsSum = ratings.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRatings > 0 ? ratingsSum / totalRatings : 0;

      const posRatings = ratings.filter(r => r.rating > 0).length;
      const negRatings = ratings.filter(r => r.rating < 0).length;

      const engagements = totalRatings + totalComments;

      // Process segments
      const segmentData = idea.segments.map(segment => ({
        segId: segment.segId,
        segmentName: segment.name,
        parentSegmentName: segment.parentSegment?.name || null,
        segmentType: segment.segmentType,
      }));

      // Find one segment of each type (if exists)
      const superSegment = segmentData.find(s => s.segmentType === 'superSegment');
      const mainSegment = segmentData.find(s => s.segmentType === 'segment');
      const subSegment = segmentData.find(s => s.segmentType === 'subSegment');


      return {
        id: idea.id,
        authorId: idea.authorId,
        categoryId: idea.categoryId,
        title: idea.title,
        description: idea.description,
        proposal_role: idea.proposal_role,
        requirements: idea.requirements,
        proposal_benefits: idea.proposal_benefits,
        notification_dismissed: idea.notification_dismissed,
        quarantined_at: idea.quarantined_at,

        // Segment data
        segId: mainSegment?.segId || null,
        subSegId: subSegment?.segId || null,
        superSegId: superSegment?.segId || null,
        segmentName: mainSegment?.segmentName || null,
        subSegmentName: subSegment?.segmentName || null,

        // Impact data
        communityImpact: idea.communityImpact,
        natureImpact: idea.natureImpact,
        energyImpact: idea.energyImpact,
        manufacturingImpact: idea.manufacturingImpact,
        artsImpact: idea.artsImpact,

        // Engagement metrics
        engagements: engagements,
        ratingAvg: avgRating,
        commentCount: totalComments,
        ratingCount: totalRatings,
        posRatings: posRatings,
        negRatings: negRatings,

        // User data
        firstName: idea.author?.fname || '',
        streetAddress: idea.address?.streetAddress || '',

        // Status data
        state: idea.state,
        active: idea.active,
        banned: idea.banned,
        reviewed: idea.reviewed,
        updatedAt: idea.updatedAt,
        createdAt: idea.createdAt
      };
    });

    // Sort the processed results to match the original ordering
    const sortedResults = processedIdeas.sort((a, b) => {
      // First by rating count, descending
      if (b.ratingCount !== a.ratingCount) {
        return b.ratingCount - a.ratingCount;
      }
      // Then by rating average, descending
      if (b.ratingAvg !== a.ratingAvg) {
        return b.ratingAvg - a.ratingAvg;
      }
      // Then by update date, descending
      if (b.updatedAt !== a.updatedAt) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      // Finally by engagements, descending
      return b.engagements - a.engagements;
    });

    // Convert any BigInt to strings
    const finalResults = sortedResults.map(row => {
      const newRow = {};
      for (const key in row) {
        if (typeof row[key] === 'bigint') {
          newRow[key] = String(row[key]);
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });

    return res.status(200).json(finalResults);

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "An error occurred while trying to fetch all ideas",
      details: {
        errorMessage: error.message,
        errorStack: error.stack,
      }
    });
  } finally {
    await prisma.$disconnect();
  }
});

ideaRouter.post(
  '/getall/by-segment',
  async (req, res) => {
    let { segmentId, take } = req.body;

    if (!segmentId) {
      return res.status(400).json({ message: 'segmentId is required.' });
    }

    take = Number.isInteger(take) ? Number(take) : undefined;
    const takeClause = take ? `limit ${take}` : '';

    try {
      const rawData = await prisma.$queryRawUnsafe(`
        select
          i.id,
          i.author_id as "authorId",
          i.category_id as "categoryId",
          i.title,
          i.description,
          i.proposal_role,
          i.requirements,
          i.proposal_benefits,
          i.notification_dismissed,
          i.quarantined_at,
          i.segment_id as "segId",
          i.sub_segment_id as "subSegId",
          i.super_segment_id as "superSegId",
          i.community_impact as "communityImpact",
          i.nature_impact as "natureImpact",
          i.energy_impact as "energyImpact",
          i.manufacturing_impact as "manufacturingImpact",
          i.arts_impact as "artsImpact",
          coalesce(ic.total_comments + ir.total_ratings, 0) as engagements,
          coalesce(ir.avg_rating, 0) as "ratingAvg",
          coalesce(ic.total_comments, 0) as "commentCount",
          coalesce(ir.total_ratings, 0) as "ratingCount",
          coalesce(pr.pos_rating, 0) as "posRatings",
          coalesce(nr.neg_rating, 0) as "negRatings",
          coalesce(sn.segment_name, '') as "segmentName",
          coalesce(sbn.sub_segment_name, '') as "subSegmentName",
          coalesce(userfname.f_name, '') as "firstName",
          coalesce(userStreetAddress.street_address, '') as "streetAddress",
          i.state,
          i.active,
          i.banned,
          i.reviewed,
          i.updated_at as "updatedAt",
          i.created_at as "createdAt"
        from idea i
        left join (
            select idea_id, count(id) as total_comments
            from idea_comment
            group by idea_comment.idea_id
        ) ic on i.id = ic.idea_id
        left join (
            select idea_id, count(id) as total_ratings, avg(rating) as avg_rating
            from idea_rating
            group by idea_rating.idea_id
        ) ir on i.id = ir.idea_id
        left join (
            select idea_id, count(id) as neg_rating
            from idea_rating
            where rating < 0
            group by idea_id
        ) nr on i.id = nr.idea_id
        left join (
            select idea_id, count(id) as pos_rating
            from idea_rating
            where rating > 0
            group by idea_id
        ) pr on i.id = pr.idea_id
        left join (
            select seg_id, segment_name
            from segment
        ) sn on i.segment_id = sn.seg_id
        left join (
            select id, f_name
            from "user"
        ) userfname on i.author_id = userfname.id
        left join (
            select user_id, street_address
            from user_address
        ) userStreetAddress on i.author_id = userStreetAddress.user_id
        where i.segment_id = ${segmentId}
        order by
          "ratingCount" desc,
          "ratingAvg" desc,
          i.updated_at desc,
          engagements desc
        ${takeClause}
      `);

      const data = rawData.map((row) => {
        const newRow = {};
        for (const key in row) {
          if (typeof row[key] === 'bigint') {
            newRow[key] = String(row[key]);
          } else {
            newRow[key] = row[key];
          }
        }
        return newRow;
      });

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching ideas by segmentId:', error);
      return res.status(500).json({
        message: 'Error fetching ideas by segmentId.',
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  }
);


// Get all ideas from a specific author
ideaRouter.get(
  '/getall/:userId',
  async (req, res, next) => {
    let take = req.body.take;
    take = Number.isInteger(take) ? Number(take) : undefined;
    let takeClause = '';
    if (!!take) {
      takeClause = `limit ${take}`;
    }
    try {
      // TODO: if rating is adjusted raw query will break
      console.log("The data:" + req.params.userId)
      const rawData = await prisma.$queryRawUnsafe(`
        select
        i.id,
        i.author_id as "authorId",
        i.category_id as "categoryId",
        i.title,
        i.description,
        i.proposal_role,
        i.requirements,
        i.proposal_benefits,
        i.notification_dismissed,
        i.quarantined_at,
        seg.seg_id as "segId",
        seg.segment_name as "segmentName",
        subseg.seg_id as "subSegId",
        subseg.segment_name as "subSegmentName",
        superseg.seg_id as "superSegId",
        i.community_impact as "communityImpact",
        i.nature_impact as "natureImpact",
        i.energy_impact as "energyImpact",
        i.manufacturing_impact as "manufacturingImpact",
        i.arts_impact as "artsImpact",
        coalesce(ic.total_comments + ir.total_ratings, 0) as engagements,
        coalesce(ir.avg_rating, 0) as "ratingAvg",
        coalesce(ic.total_comments, 0) as "commentCount",
        coalesce(ir.total_ratings, 0) as "ratingCount",
        coalesce(pr.pos_rating, 0) as "posRatings",
        coalesce(nr.neg_rating, 0) as "negRatings",
        coalesce(userfname.f_name, '') as "firstName",
        coalesce(userStreetAddress.street_address, '') as "streetAddress",
        i.state,
        i.active,
        i.banned,
        i.reviewed,
        i.updated_at as "updatedAt",
        i.created_at as "createdAt"
          from idea i

          -- Aggregate total comments
          left join (
              select
                idea_id,
                count(id) as total_comments
              from idea_comment
              group by idea_comment.idea_id
          ) ic on i.id = ic.idea_id

          -- Aggregate total ratings and rating avg
          left join (
              select
                idea_id,
                count(id) as total_ratings,
                avg(rating) as avg_rating
              from idea_rating
              group by idea_rating.idea_id
          ) ir on	i.id = ir.idea_id

          -- Aggregate total neg ratings
          left join (
              select
                idea_id,
                count(id) as neg_rating
              from idea_rating
              where rating < 0
              group by idea_id
          ) nr on	i.id = nr.idea_id
           
          -- Aggregate total pos ratings
          left join (
              select
                idea_id,
                count(id) as pos_rating
              from idea_rating
              where rating > 0
              group by idea_id
          ) pr on	i.id = pr.idea_id

          -- Join for segment type (required)
          left join (
            select s.*, iseg."A" as idea_id
            from "_IdeaToSegments" iseg
            join segment s on s.seg_id = iseg."B"
            where s."segmentType" = 'segment'
          ) seg on seg.idea_id = i.id

          -- Join for subSegment type (optional)
          left join (
            select s.*, iseg."A" as idea_id
            from "_IdeaToSegments" iseg
            join segment s on s.seg_id = iseg."B"
            where s."segmentType" = 'subSegment'
          ) subseg on subseg.idea_id = i.id

          -- Join for superSegment type (optional)
          left join (
            select s.*, iseg."A" as idea_id
            from "_IdeaToSegments" iseg
            join segment s on s.seg_id = iseg."B"
            where s."segmentType" = 'superSegment'
          ) superseg on superseg.idea_id = i.id

          -- Aggregate author's first name
          left join  (
              select id, f_name
              from "user"
              ) userfname on i.author_id = userfname.id

          -- Aggregate author's address
          left join (
              select user_id, street_address
              from user_address
              ) userStreetAddress on i.author_id = userStreetAddress.user_id
            where i.author_id = '${req.params.userId}'
              
          order by
            "ratingCount" desc,
            "ratingAvg" desc,
            updated_at desc,
            engagements desc
            ${takeClause}
      
      `);
      const data = rawData.map((row) => {
        const newRow = {};
        for (const key in row) {
          if (typeof row[key] === 'bigint') {
            newRow[key] = String(row[key]);
          } else {
            newRow[key] = row[key];
          }
        }
        return newRow;
      });

      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({
        message: "An error occured while trying to fetch all ideas",
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

// Get all idea as well as relations with ideaId
ideaRouter.get(
  '/get/:ideaId',
  async (req, res, next) => {
    try {
      const parsedIdeaId = parseInt(req.params.ideaId);

      // check if id is valid
      if (!parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route parameter.`,
        });
      }

      const {
        isChampionable
      } = await checkIdeaThresholds(parsedIdeaId);

      const foundIdea = await prisma.idea.findUnique({
        where: { id: parsedIdeaId },
        include: {
          // TODO: Is this necessary? SQL query will join 9-10 times.
          geo: true,
          address: true,
          category: true,
          projectInfo: true,
          proposalInfo: {
            select: {
              id: true,
            },
          },
          champion: {
            include: {
              address: {
                select: {
                  postalCode: true,
                  streetAddress: true,
                }
              },
            }
          },
          author: {
            include: {
              address: {
                select: {
                  postalCode: true,
                  streetAddress: true,
                }
              },
              userSegment: {
                include: {
                  segment: true,
                }
              },
              userHandles: true,
            }
          },
          segments: true,
        }
      });
      if (!foundIdea) {
        return res.status(400).json({
          message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
        });
      }
      await imagePathsToS3Url([foundIdea], "idea-proposal");

      const result = { ...foundIdea, isChampionable };
      delete result.author.password;
      if (!!result.champion) {
        delete result.champion.password;
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: `An Error occured while trying to fetch idea with id ${req.params.ideaId}.`,
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

// Get all ideas with a specific proposalId
ideaRouter.get(
  '/get/proposal/:supportingProposalId',
  async (req, res, next) => {
    try {
      const parsedSupportingProposalId = parseInt(req.params.supportingProposalId);

      // check if id is valid
      if (!parsedSupportingProposalId) {
        return res.status(400).json({
          message: `A valid proposalId must be specified in the route parameter.`,
        });
      }

      const foundIdeas = await prisma.idea.findMany({
        where: {
          supportingProposalId: parsedSupportingProposalId
        },
        include: {
          geo: true,
          address: true,
          category: true,
          projectInfo: true,
          champion: {
            include: {
              address: {
                select: {
                  postalCode: true,
                  streetAddress: true,
                }
              }
            }
          },
        }
      });

      if (!foundIdeas) {
        return res.status(400).json({
          message: `The idea with that listed ID (${parsedSupportingProposalId}) does not exist.`,
        });
      }
      await imagePathsToS3Url(foundIdeas, "idea-proposal");

      return res.status(200).json(foundIdeas);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: `An Error occured while trying to fetch idea with id ${req.params.supportingProposalId}.`,
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
ideaRouter.put(
  '/updateState/:ideaId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {

      const { active, reviewed, banned, quarantined_at } = req.body;
      const { ideaId } = req.params;
      const parsedIdeaId = parseInt(ideaId);

      if (!ideaId || !parsedIdeaId) {
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

      console.log("reviewed: " + reviewed);
      console.log("active: " + active);
      console.log("parsedIdeaId: " + parsedIdeaId);
      console.log("foundIdea.authorId: " + foundIdea.authorId);
      console.log("foundIdea.title: " + foundIdea.title);
      try {
        if (reviewed == true && active == true) {
          await prisma.quarantine_Notifications.create({
            data: {
              ideaId: parsedIdeaId * 1,
              userId: foundIdea.authorId,
              ideaTitle: foundIdea.title,
            }
          });
        }
      } catch (error) {
        console.log("Error while creating quarantine notification: " + error);
      } finally {
        await prisma.$disconnect();
      }

      const updateIdea = await prisma.idea.update({
        where: {
          id: parsedIdeaId,
        },
        data: {
          active: active,
          reviewed: reviewed,
          banned: banned,
          quarantined_at: quarantined_at,
        },
      });
      console.log("Returns here")
      return res.status(200).json({
        message: "Idea succesfully updated",
        idea: updateIdea,
      });



    } catch (error) {
      return res.status(400).json({
        message: "An error occured while to update an Idea",
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

ideaRouter.put(
  '/updateNotificationState/:ideaId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {

      const { userId, notification_dismissed } = req.body;
      const { ideaId } = req.params;
      const parsedIdeaId = parseInt(ideaId);

      if (!ideaId || !parsedIdeaId) {
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

      const updateIdea = await prisma.idea.update({
        where: {
          id: parsedIdeaId,
        },
        data: {
          notification_dismissed: notification_dismissed,
        },
      });
      console.log("Returns here")
      return res.status(200).json({
        message: "Idea succesfully updated",
        idea: updateIdea,
      });

    } catch (error) {
      return res.status(400).json({
        message: "An error occured while to update an Idea",
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
// Put request to update data
ideaRouter.put(
  '/update/:ideaId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const { ideaId } = req.params;
      const parsedIdeaId = parseInt(ideaId);
      const {
        title,
        description,
        communityImpact,
        natureImpact,
        artsImpact,
        energyImpact,
        manufacturingImpact,
        active,
        // TODO: If these fields are not passed will break code
        geo: {
          lat,
          lon
        },
        address: {
          streetAddress,
          streetAddress2,
          city,
          country,
          postalCode,
        },
      } = req.body;

      if (!ideaId || !parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route paramater.`,
        });
      }

      // Check to see if idea with id exists
      const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId } });
      if (!foundIdea) {
        return res.status(400).json({
          message: `The idea with that listed ID (${ideaId}) does not exist.`,
        });
      }

      // Check to see if Idea is the requestee's idea by JWT
      const ideaOwnedByUser = foundIdea.authorId === loggedInUserId;
      if (!ideaOwnedByUser) {
        return res.status(401).json({
          message: `The user ${email} is not the author or an admin and therefore cannot edit this idea.`
        });
      }

      // Conditional add params to update only fields passed in 
      const updateGeoData = {
        ...lat && { lat },
        ...lon && { lon }
      }

      const updateAddressData = {
        ...streetAddress && { streetAddress },
        ...streetAddress2 && { streetAddress2 },
        ...city && { city },
        ...country && { country },
        ...postalCode && { postalCode },
      }

      const updateData = {
        ...title && { title },
        ...description && { description },
        ...communityImpact && { communityImpact },
        ...natureImpact && { natureImpact },
        ...artsImpact && { artsImpact },
        ...energyImpact && { energyImpact },
        ...manufacturingImpact && { manufacturingImpact },
        ...active && { active },
      };

      const updatedIdea = await prisma.idea.update({
        where: { id: parsedIdeaId },
        data: {
          geo: { update: updateGeoData },
          address: { update: updateAddressData },
          ...updateData,
        },
        include: {
          geo: true,
          address: true,
        }
      });

      console.log("Returns here")
      return res.status(200).json({
        message: "Idea succesfully updated",
        idea: updatedIdea,
      });
    } catch (error) {
      return res.status(400).json({
        message: "An error occured while to update an Idea",
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


// delete request to delete an idea
ideaRouter.delete(
  '/delete/:ideaId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { id: loggedInUserId, email } = req.user;
      console.log(req.user);
      const parsedIdeaId = parseInt(req.params.ideaId);

      // check if id is valid
      if (!parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route paramater.`,
        });
      }

      // Check to see if idea exists
      const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId } });
      if (!foundIdea) {
        return res.status(400).json({
          message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
        });
      }

      // Check to see if idea is owned by user
      const ideaOwnedByUser = foundIdea.authorId === loggedInUserId;
      if (!ideaOwnedByUser) {
        return res.status(401).json({
          message: `The user ${email} is not the author or an admin and therefore cannot delete this idea.`
        });
      }

      if (foundIdea.imagePath) {
        await deleteImage("idea-proposal", foundIdea.imagePath);
      }

      await prisma.ideaComment.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.ideaRating.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.ideaGeo.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.ideaAddress.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.userIdeaEndorse.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.proposal.deleteMany({ where: { ideaId: foundIdea.id } });
      const deletedIdea = await prisma.idea.delete({ where: { id: parsedIdeaId } });

      return res.status(200).json({
        message: "Idea succesfully deleted",
        deletedIdea: deletedIdea,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "An error occured while to delete an Idea",
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

ideaRouter.post(
  '/follow',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        return res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const userIdeaFollow = await prisma.userIdeaFollow.upsert({
        where: {
          user_idea_follow_unique: {
            userId: userId,
            ideaId: ideaId
          }
        },
        create: {
          userId: userId,
          ideaId: ideaId
        },
        update: {}
      })
      return res.status(200).json(userIdeaFollow);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "An error occured while to delete an Idea",
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

ideaRouter.post(
  '/unfollow',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        return res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const theUserIdeaFollow = await prisma.userIdeaFollow.findUnique({
        where: {
          user_idea_follow_unique: {
            userId: userId,
            ideaId: ideaId
          }
        }
      })

      if (!theUserIdeaFollow) {
        return res.status(400).json({
          message: `The user ${userId} does not follow the idea ${ideaId}`
        })
      }

      const userIdeaFollow = await prisma.userIdeaFollow.delete({ where: { id: theUserIdeaFollow.id } });
      return res.status(200).json(userIdeaFollow);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "An error occured while to delete an Idea",
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

ideaRouter.post(
  '/isFollowed',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: "Request body is empty!"
        })
      }

      const { userId, ideaId } = req.body;

      if (!userId || !ideaId) {
        return res.status(200).json({
          isFollowed: false
        })
      }

      const theUser = await prisma.user.findFirst({ where: { id: userId } });
      const theIdea = await prisma.idea.findFirst({ where: { id: parseInt(ideaId) } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const theUserIdeaFollow = await prisma.userIdeaFollow.findUnique({
        where: {
          user_idea_follow_unique: {
            userId: userId,
            ideaId: parseInt(ideaId)
          }
        }
      })
      const isFollowed = theUserIdeaFollow ? true : false;

      return res.status(200).json({
        isFollowed: isFollowed
      })
    } catch (error) {
      console.log(error);
      return res.status(400).json({
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

ideaRouter.get(
  '/getAllFollowedByUser/:userId',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          message: `"userId" is missing or empty from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      const userIdeaFollows = await prisma.userIdeaFollow.findMany({
        where: {
          userId: userId,
        }
      })

      let ideas = [];
      for await (const follow of userIdeaFollows) {
        const idea = await prisma.idea.findUnique({ where: { id: follow.ideaId } });
        ideas.push(idea);
      }
      return res.status(200).json(ideas);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
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

ideaRouter.post(
  '/endorse',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        return res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const userIdeaEndorse = await prisma.userIdeaEndorse.upsert({
        where: {
          user_idea_endorse_unique: {
            userId: userId,
            ideaId: ideaId
          }
        },
        create: {
          userId: userId,
          ideaId: ideaId
        },
        update: {}
      })
      return res.status(200).json(userIdeaEndorse);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "An error occured while to endorse an Idea",
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

ideaRouter.post(
  '/unendorse',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        return res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const theUserIdeaEndorse = await prisma.userIdeaEndorse.findUnique({
        where: {
          user_idea_endorse_unique: {
            userId: userId,
            ideaId: ideaId
          }
        }
      })

      if (!theUserIdeaEndorse) {
        return res.status(400).json({
          message: `The user ${userId} does not endorse the idea ${ideaId}`
        })
      }

      const userIdeaEndorse = await prisma.userIdeaEndorse.delete({ where: { id: theUserIdeaEndorse.id } });
      return res.status(200).json(userIdeaEndorse);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "An error occured while to unendorse an Idea",
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

ideaRouter.post(
  '/isEndorsed',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: "Request body is empty!"
        })
      }

      const { userId, ideaId } = req.body;

      if (!userId || !ideaId) {
        return res.status(200).json({
          isEndorsed: false
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: parseInt(ideaId) } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const theUserIdeaEndorse = await prisma.userIdeaEndorse.findUnique({
        where: {
          user_idea_endorse_unique: {
            userId: userId,
            ideaId: parseInt(ideaId)
          }
        }
      })
      const isEndorsed = theUserIdeaEndorse ? true : false;

      return res.status(200).json({
        isEndorsed: isEndorsed
      })
    } catch (error) {
      console.log(error);
      return res.status(400).json({
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

ideaRouter.get(
  '/getAllEndorsedByUser/:userId',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          message: `"userId" is missing or empty from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      const userIdeaEndorses = await prisma.userIdeaEndorse.findMany({
        where: {
          userId: userId,
        }
      })

      let ideas = [];
      for await (const endorse of userIdeaEndorses) {
        const idea = await prisma.idea.findUnique({ where: { id: endorse.ideaId } });
        await imagePathsToS3Url([idea]);
        ideas.push(idea);
      }
      return res.status(200).json(ideas);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
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

ideaRouter.get(
  '/getAllEndorsersByIdea/:ideaId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { ideaId } = req.params;

      if (!ideaId) {
        return res.status(400).json({
          message: `"ideaId" is missing or empty from the request body!`
        })
      }

      const theIdea = await prisma.idea.findUnique({ where: { id: parseInt(ideaId) } });

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const userIdeaEndorses = await prisma.userIdeaEndorse.findMany({
        where: {
          ideaId: parseInt(ideaId),
        }
      })

      let users = [];
      for await (const endorse of userIdeaEndorses) {
        const user = await prisma.user.findUnique({ where: { id: endorse.userId } });
        users.push(user);
      }
      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
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

ideaRouter.post(
  '/isFlagged',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: "Request body is empty!"
        })
      }

      const { userId, ideaId } = req.body;

      if (!userId || !ideaId) {
        return res.status(200).json({
          isFlagged: false
        })

      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!theUser) {
        return res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!ideaId) {
        return res.status(200).json({
          isFlagged: false
        })
      }

      const theIdea = await prisma.idea.findFirst({ where: { id: parseInt(ideaId) } });

      if (!theIdea) {
        return res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const theUserIdeaFlag = await prisma.ideaFlag.findMany({
        where: {
          flaggerId: userId,
          ideaId: parseInt(ideaId)
        }
      })

      const isFlagged = theUserIdeaFlag.length > 0 ? true : false;
      return res.status(200).send(isFlagged);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
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




module.exports = ideaRouter;
