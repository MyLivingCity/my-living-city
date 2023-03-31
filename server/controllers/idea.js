const passport = require('passport');

const express = require('express');
const ideaRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { checkIdeaThresholds } = require('../lib/prismaFunctions');
const { isInteger, isEmpty } = require('lodash');

const fs = require('fs');

const multer = require('multer');

//multer storage policy, including file destination and file naming policy
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/ideaImage');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

//file filter policy, only accept image file
const theFileFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/tiff' || file.mimetype === 'image/webp' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('file format not supported'), false);
  }
}

//const variable for 10MB max file size in bytes
const maxFileSize = 10485760;

//multer upload project, setting receiving mode and which key components to use
const upload = multer({ storage: storage, limits: { fileSize: maxFileSize }, fileFilter: theFileFilter }).single('imagePath');


// post request to create an idea
ideaRouter.post(
  '/create',
  passport.authenticate('jwt', { session: false }),
  //upload.single('imagePath'),
  async (req, res) => {

    upload(req, res, async function (err) {
      //multer error handling method
      let error = '';
      let errorMessage = '';
      let errorStack = '';
      if (err) {
        console.log(err);
        error += err + ' ';
        errorMessage += err + ' ';
        errorStack += err + ' ';
      };
      try {

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

        console.log(req.body);

        // passport middleware provides this based on JWT
        const { email } = req.user;

        const theUserSegment = await prisma.userSegments.findFirst({ where: { userId: id } });

        const { homeSuperSegId, workSuperSegId, schoolSuperSegId, homeSegmentId, workSegmentId, schoolSegmentId, homeSubSegmentId, workSubSegmentId, schoolSubSegmentId } = theUserSegment;

        //Image path holder
        let imagePath = '';
        //if there's req.file been parsed by multer
        if (req.file) {
          //console.log(req.file);
          imagePath = req.file.path;
        }

        let { categoryId, superSegmentId, segmentId, subSegmentId, banned, title,
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
          //TODO
        } = req.body;
        console.log(req.body)

        if (supportingProposalId) {
          supportingProposalId = parseInt(supportingProposalId);
        }
        categoryId = parseInt(categoryId);

        if (subSegmentId) {
          subSegmentId = parseInt(subSegmentId);
        } else if (segmentId) {
          segmentId = parseInt(segmentId);
        } else if (superSegmentId) {
          superSegmentId = parseInt(superSegmentId);
        }

        banned = (banned === 'true');

        if (banned === true) {
          error += 'You are banned';
          errorMessage += 'You must be un-banned before you can post ideas';
          errorStack += 'Users can not post ideas with a pending ban status of true';
        }
        // Check if category id is added
        if (!categoryId || !isInteger(categoryId)) {
          error += 'An Idea must be under a specific category.';
          errorMessage += 'Creating an idea must explicitly be supplied with a "categoryId" field.';
          errorStack += '"CategoryId" must be defined in the body with a valid id found in the database.';
        } else {
          const theCategory = await prisma.category.findUnique({ where: { id: categoryId } });

          if (!theCategory) {
            error += 'An Idea must be under a valid category.';
            errorMessage += 'Creating an idea must explicitly be supplied with valid a "categoryId" field.';
            errorStack += '"CategoryId" must be defined in the body with a valid id found in the database.';
          }
        }

        if (isInteger(subSegmentId)) {
          theSubSegment = await prisma.subSegments.findUnique({ where: { id: subSegmentId } });

          if (!theSubSegment) {
            error += 'Sub segment id must be valid.';
            errorMessage += 'Creating an idea must explicitly be supplied with a valid "subSegmentId" field.';
            errorStack += '"subSegmentId" must be provided with a valid id found in the database.';
          } else if (subSegmentId == homeSubSegmentId || subSegmentId == workSubSegmentId || subSegmentId == schoolSubSegmentId) {
            segmentId = theSubSegment.segId;

            const theSegment = await prisma.segments.findUnique({ where: { segId: segmentId } });

            superSegmentId = theSegment.superSegId;
          } else {
            error += 'You must belongs to the subSemgent you want to post to. ';
            errorMessage += 'Your subsegment ids don\'t match the subsegment id you porvided. ';
            errorStack += 'User does\'t belongs to the subsegment he/she wants to post idea to. '
          }
        } else if (isInteger(segmentId)) {
          const theSegment = await prisma.segments.findUnique({ where: { segId: segmentId } });

          if (!theSegment) {
            error += 'An Idea must belong to a municipality.';
            errorMessage += 'Creating an idea must explicitly be supplied with a valid "segmentId" field.';
            errorStack += '"segmentId" must be defined in the body with a valid id found in the database.';
          } else if (segmentId == homeSegmentId || segmentId == workSegmentId || segmentId == schoolSegmentId) {
            superSegmentId = theSegment.superSegId;
          } else {
            error += 'You must belongs to the semgent you want to post to. ';
            errorMessage += 'Your segment ids don\'t match the segment id you porvided. ';
            errorStack += 'User does\'t belongs to the segment he/she wants to post idea to. '
          }
        } else if (isInteger(superSegmentId)) {
          const theSuperSegment = await prisma.superSegment.findUnique({ where: { superSegId: superSegmentId } });

          if (!theSuperSegment) {
            error += 'An Idea must belong to a area.';
            errorMessage += 'Creating an idea must explicitly be supplied with a valid "superSegmentId" field.';
            errorStack += '"segmentId" must be defined in the body with a valid id found in the database.';
          } else if (superSegmentId != homeSuperSegId && superSegmentId != workSuperSegId && superSegmentId != schoolSegmentId) {
            error += 'You must belongs to the superSemgent you want to post to. ';
            errorMessage += 'Your subsegment ids don\'t match the superSegment id you porvided. ';
            errorStack += 'User does\'t belongs to the superSegment he/she wants to post idea to. '
          }
        } else {
          error += 'An idea must belongs to a area';
          errorMessage += 'Creating an idea must explicitly be supplied with a valid "superSegmentId" or "segmentId" or "subSegmentId" field.';
          errorStack += 'One of the area id must explicitly be supplied with a valid id found in the database. '
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
          //multer is a kind of middleware, if file is valid, multer will add it to upload folder. Following code are responsible for deleting files if error happened.
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
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
        const ideaData = {
          categoryId,
          superSegmentId,
          segmentId,
          subSegmentId,
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
        };

        // Create an idea and make the author JWT bearer
        const createdIdea = await prisma.idea.create({
          data: {
            geo: { create: geoData },
            address: { create: addressData },
            ...ideaData
          },
          include: {
            geo: true,
            address: true,
            category: true,
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

  }
)

ideaRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to Idea Router'
      })
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
      console.log(allIdeas)
      res.status(200).json(allIdeas);
    } catch (error) {
      res.status(400).json({
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
      console.log(req.body);
      const allIdeas = await prisma.idea.findMany(req.body);

      res.status(200).json(allIdeas);
    } catch (error) {
      res.status(400).json({
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

ideaRouter.post(
  '/getall/aggregations',
  async (req, res, next) => {
    const take = req.body.take;
    let takeClause = '';
    if (!!take) {
      takeClause = `limit ${take}`;
    }
    try {
      // TODO: if rating is adjusted raw query will break
      const data = await prisma.$queryRaw(`
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
          -- Aggregate idea segment name
          left join (
              select seg_id, segment_name
              from segment
              ) sn on i.segment_id = sn.seg_id
          -- Aggregate idea sub segment name
          left join (
              select id, sub_segment_name
              from sub_segment
              ) sbn on i.sub_segment_id = sbn.id
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
          order by
            "ratingCount" desc,
            "ratingAvg" desc,
            updated_at desc,
            engagements desc
        ${takeClause}
        ;
      `);

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({
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

// Get all ideas from a specific author
ideaRouter.get(
  '/getall/:userId',
  async (req, res, next) => {
    try {
      const allIdeas = await prisma.$queryRaw(`
        select
          i.id,
          i.author_id as "authorId",
          i.category_id as "categoryId",
          i.title,
         
          i.description,
          i.notification_dismissed,
          i.segment_id,
          i.sub_segment_id,
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
            -- Aggregate idea segment name
            left join (
                select seg_id, segment_name
                from segment
                ) sn on i.segment_id = sn.seg_id
            -- Aggregate idea sub segment name
            left join (
                select id, sub_segment_name
                from sub_segment
                ) sbn on i.sub_segment_id = sbn.id
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
        ;
      `);

      res.status(200).json(allIdeas);
    } catch (error) {
      res.status(400).json({
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
          author: {
            include: {
              address: {
                select: {
                  postalCode: true,
                  streetAddress: true,
                }
              }
            }
          },
          segment: true,
          subSegment: true,
          superSegment: true,
          supportedProposal: true
        }
      });
      if (!foundIdea) {
        return res.status(400).json({
          message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
        });
      }

      const result = { ...foundIdea, isChampionable };
      delete result.author.password;
      if (!!result.champion) {
        delete result.champion.password;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({
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

      const foundIdea = await prisma.idea.findMany({
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

      if (!foundIdea) {
        return res.status(400).json({
          message: `The idea with that listed ID (${parsedSupportingProposalId}) does not exist.`,
        });
      }

      res.status(200).json(foundIdea);
    } catch (error) {
      console.error(error);
      res.status(400).json({
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

      const {active, reviewed, banned, quarantined_at} = req.body;
      const {ideaId} = req.params;
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
      res.status(200).json({
        message: "Idea succesfully updated",
        idea: updateIdea,
      });



    } catch (error) {
      res.status(400).json({
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
      res.status(200).json({
        message: "Idea succesfully updated",
        idea: updateIdea,
      });

    } catch (error) {
      res.status(400).json({
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
      res.status(200).json({
        message: "Idea succesfully updated",
        idea: updatedIdea,
      });
    } catch (error) {
      res.status(400).json({
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
          message: `The idea with that listed ID (${ideaId}) does not exist.`,
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
        if (fs.existsSync(foundIdea.imagePath)) {
          fs.unlinkSync(foundIdea.imagePath);
        }
      }

      const deleteComment = await prisma.ideaComment.deleteMany({ where: { ideaId: foundIdea.id } });
      const deleteRating = await prisma.ideaRating.deleteMany({ where: { ideaId: foundIdea.id } });
      const deletedGeo = await prisma.ideaGeo.deleteMany({ where: { ideaId: foundIdea.id } });
      const deleteAddress = await prisma.ideaAddress.deleteMany({ where: { ideaId: foundIdea.id } });
      const deletedIdea = await prisma.idea.delete({ where: { id: parsedIdeaId } });

      res.status(200).json({
        message: "Idea succesfully deleted",
        deletedIdea: deletedIdea,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        res.status(400).json({
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
      res.status(200).json(userIdeaFollow);
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        res.status(400).json({
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
        res.status(400).json({
          message: `The user ${userId} does not follow the idea ${ideaId}`
        })
      }

      const userIdeaFollow = await prisma.userIdeaFollow.delete({ where: { id: theUserIdeaFollow.id } });
      res.status(200).json(userIdeaFollow);
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: "Request body is empty!"
        })
      }

      const { userId, ideaId } = req.body;

      if (!userId || !ideaId) {
        res.status(200).json({
          isFollowed: false
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: parseInt(ideaId) } });

      if (!theUser) {
        res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        res.status(400).json({
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

      res.status(200).json({
        isFollowed: isFollowed
      })
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: `"userId" is missing or empty from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!theUser) {
        res.status(400).json({
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
      res.status(200).json(ideas);
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        res.status(400).json({
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
      res.status(200).json(userIdeaEndorse);
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: "Request body is empty!"
        })
      }

      let { userId, ideaId } = req.body;
      ideaId = parseInt(ideaId);

      if (!userId || !ideaId) {
        res.status(400).json({
          message: `"userId" and/or "ideaId" is missing from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

      if (!theUser) {
        res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        res.status(400).json({
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
        res.status(400).json({
          message: `The user ${userId} does not endorse the idea ${ideaId}`
        })
      }

      const userIdeaEndorse = await prisma.userIdeaEndorse.delete({ where: { id: theUserIdeaEndorse.id } });
      res.status(200).json(userIdeaEndorse);
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: "Request body is empty!"
        })
      }

      const { userId, ideaId } = req.body;

      if (!userId || !ideaId) {
        res.status(200).json({
          isEndorsed: false
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const theIdea = await prisma.idea.findUnique({ where: { id: parseInt(ideaId) } });

      if (!theUser) {
        res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!theIdea) {
        res.status(400).json({
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

      res.status(200).json({
        isEndorsed: isEndorsed
      })
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: `"userId" is missing or empty from the request body!`
        })
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!theUser) {
        res.status(400).json({
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
        ideas.push(idea);
      }
      res.status(200).json(ideas);
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: `"ideaId" is missing or empty from the request body!`
        })
      }

      const theIdea = await prisma.idea.findUnique({ where: { id: parseInt(ideaId) } });

      if (!theIdea) {
        res.status(400).json({
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
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
        res.status(400).json({
          message: "Request body is empty!"
        })
      }

      const { userId, ideaId } = req.body;

      if (!userId || !ideaId) {
        res.status(200).json({
          isFlagged: false
        })

      }

      const theUser = await prisma.user.findMany({ where: { id: userId } });

      if (!theUser) {
        res.status(400).json({
          message: `User with id ${userId} cannot be found or does not exists!`
        })
      }

      if (!ideaId) {
        res.status(200).json({
          isFlagged: false
        })
      }
      console.log("ideaIdBEAR: ", ideaId)
      const theIdea = await prisma.idea.findFirst({ where: { id: parseInt(ideaId) } });

      if (!theIdea) {
        res.status(400).json({
          message: `Idea with id ${ideaId} cannot be found or does not exists!`
        })
      }

      const theUserIdeaFlag = await prisma.ideaFlag.findFirst({
        where: {
          flaggerId: userId,
          ideaId: parseInt(ideaId)
        }
      })
      const isFlagged = theUserIdeaFlag ? true : false;
      res.status(200).json({
        isFlagged: isFlagged
      })
    } catch (error) {
      console.log(error);
      res.status(400).json({
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