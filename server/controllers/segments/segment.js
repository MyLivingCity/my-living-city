const passport = require('passport');
const express = require('express');
const segmentRouter = express.Router();
const prisma = require('../../lib/prismaClient');

const { isEmpty, isInteger, isString } = require('lodash');
const { UserType } = require('@prisma/client');

segmentRouter.post(
  '/create',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      console.log("create segment", req.body)
      let error = '';
      let errorMessage = '';
      let errorStack = '';
      //get email and user id from request
      const { email, id } = req.user;
      //find the requesting user in the database
      const theUser = await prisma.user.findUnique({
        where: { id: id },
        select: { userType: true }
      });
      //User must be admin to create segment
      if (theUser.userType == 'SUPER_ADMIN' || theUser.userType == 'ADMIN' || theUser.userType == 'MOD') {
        // Support legacy payload { superSegId } and new payload { parentSuperSegId }
        const { country, province, name, parentSuperSegId, superSegId } = req.body;

        console.log(req.body);

        // Super segments are stored in the unified segments table with segmentType=superSegment
        let theSuperSeg = null;
        const resolvedParentId = (parentSuperSegId ?? superSegId);
        if (resolvedParentId !== undefined && resolvedParentId !== null && resolvedParentId !== '') {
          const parsed = parseInt(resolvedParentId);
          if (!isNaN(parsed)) {
            theSuperSeg = await prisma.segments.findUnique({ where: { segId: parsed } });
          }
        }

        //if there's no object in the request body
        if (isEmpty(req.body)) {
          return res.status(400).json({
            message: 'The objects in the request body are missing',
            details: {
              errorMessage: 'Creating a segment must supply necessary fields explicitly.',
              errorStack: 'necessary fields must be provided in the body with valid values',
            }
          })
        }
        //if country field is missing
        if (!country || !isString(country)) {
          error += 'A segment must has a country field. ';
          errorMessage += 'Creating a segment must explicitly be supplied with a country field. ';
          errorStack += 'cuntry must be provided in the body with a valid value. ';
        }

        //if province is missing
        if (!province || !isString(province)) {
          error += 'A segment must has a province field. ';
          errorMessage += 'Creating a segment must explicitly be supplied with a province field. ';
          errorStack += 'province must be provided in the body with a valid value. ';
        }

        if (!name || !isString(name)) {
          error += 'A segment must has a name field. ';
          errorMessage += 'Creating a segment must explicitly be supplied with a name field. ';
          errorStack += 'name must be provided in the body with a valid value. ';
        }

        if (!theSuperSeg || theSuperSeg.segmentType !== 'superSegment') {
          error += 'A segment must have a Super Segment with a valid ID. ';
          errorMessage += 'Creating a segment must explicitly be supplied with a valid super segmentId field referencing a super segment. ';
          errorStack += 'Valid super segment segId must be provided in the body. ';
        }

        //If there's error in error holder
        if (error || errorMessage || errorStack) {
          return res.status(400).json({
            message: error,
            details: {
              errorMessage: errorMessage,
              errorStack: errorStack
            }
          });
        }

        //create a segement table item
        const created = await prisma.segments.create({
          data: {
            country: country,
            province: province,
            name: name,
            parentId: theSuperSeg.segId, // parent relationship
            segmentType: 'segment'
          }
        });

        const response = {
          segId: created.segId,
          name: created.name,
          country: created.country,
          province: created.province,
          parentId: created.parentId,
          parentSegment: theSuperSeg ? {
            segId: theSuperSeg.segId,
            name: theSuperSeg.name,
            country: theSuperSeg.country,
            province: theSuperSeg.province,
            segmentType: theSuperSeg.segmentType
          } : undefined,
          segmentType: created.segmentType,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt
        };

        res.status(200).json(response);
      } else {
        return res.status(403).json({
          message: "You don't have the right to add a segment!",
          details: {
            errorMessage: 'In order to create a segment, you must be an admin user.',
            errorStack: 'user must be an admin if they want to create a segment',
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occured while trying to create a segment.",
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

segmentRouter.get(
  '/getAll',
  async (req, res) => {
    try {
      // Preload all super segments for fallback matching
      const superSegs = await prisma.segments.findMany({
        where: { segmentType: 'superSegment' },
        select: { segId: true, name: true, country: true, province: true, segmentType: true }
      });
      const result = await prisma.segments.findMany({
        include: { parentSegment: true }
      });
      res.status(200).send(result.map(s => {
        let parentSegment = s.parentSegment ? {
          segId: s.parentSegment.segId,
          name: s.parentSegment.name,
          country: s.parentSegment.country,
          province: s.parentSegment.province,
          segmentType: s.parentSegment.segmentType
        } : undefined;
        // Fallback: infer parentSegment by country/province if missing and segment is a child
        if (!parentSegment && s.segmentType === 'segment') {
          const inferred = superSegs.find(ss => ss.country?.toLowerCase() === s.country?.toLowerCase() && ss.province?.toLowerCase() === s.province?.toLowerCase());
          if (inferred) {
            parentSegment = {
              segId: inferred.segId,
              name: inferred.name,
              country: inferred.country,
              province: inferred.province,
              segmentType: inferred.segmentType
            };
          }
        }
        return {
          segId: s.segId,
          name: s.name,
          country: s.country,
          province: s.province,
          parentId: s.parentId,
          parentSegment: parentSegment,
          lat: s.lat,
          lon: s.lon,
          radius: s.radius,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          segmentType: s.segmentType
        };
      }));
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occured while trying to retrieve segments.",
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

segmentRouter.get(
  '/getByType/:type',
  async (req, res) => {
    try {
      const { type } = req.params;

      const validTypes = ['segment', 'superSegment', 'subSegment'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid segment type",
          validTypes
        });
      }

      const superSegs = await prisma.segments.findMany({
        where: { segmentType: 'superSegment' },
        select: { segId: true, name: true, country: true, province: true, segmentType: true }
      });
      const result = await prisma.segments.findMany({
        where: { segmentType: type },
        include: { parentSegment: true }
      });

      res.status(200).send(result.map(s => {
        let parentSegment = s.parentSegment ? {
          segId: s.parentSegment.segId,
          name: s.parentSegment.name,
          country: s.parentSegment.country,
          province: s.parentSegment.province,
          segmentType: s.parentSegment.segmentType
        } : undefined;
        if (!parentSegment && s.segmentType === 'segment') {
          const inferred = superSegs.find(ss => ss.country?.toLowerCase() === s.country?.toLowerCase() && ss.province?.toLowerCase() === s.province?.toLowerCase());
          if (inferred) {
            parentSegment = {
              segId: inferred.segId,
              name: inferred.name,
              country: inferred.country,
              province: inferred.province,
              segmentType: inferred.segmentType
            };
          }
        }
        return {
          segId: s.segId,
          name: s.name,
          country: s.country,
          province: s.province,
          parentId: s.parentId,
          parentSegment: parentSegment,
          lat: s.lat,
          lon: s.lon,
          radius: s.radius,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          segmentType: s.segmentType
        };
      }));
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occurred while trying to retrieve segments.",
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

segmentRouter.get(
  '/getChildren/:parentId',
  async (req, res) => {
    try {
      const parentId = parseInt(req.params.parentId);

      if (isNaN(parentId)) {
        return res.status(400).json({
          message: "Invalid parent ID format. Must be a number."
        });
      }

      const result = await prisma.segments.findMany({
        where: {
          parentId: parentId
        },
        include: {
          children: true, // Include nested children if needed
          // You can include other relations if needed
          // userReach: true,
          // userSegment: true,
          // ideas: true
        }
      });

      if (!result || result.length === 0) {
        return res.status(404).json({
          message: `No children segments found for parent ID: ${parentId}`
        });
      }

      res.status(200).send(result);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occurred while trying to retrieve child segments.",
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

// segmentRouter.get(
//     '/getByProv',
//     async(req,res) => {
//         try{
//             const {province, country} = req.body;
//             const result = await prisma.segments.findMany(
//                 where:{province: province}
//             );
//             console.log(result);
//             res.status(200).send(result);
//         }catch(error){
//             console.log(error);
//             res.status(400).json({
//                 message: "An error occured while trying to retrieve segments.",
//                 details: {
//                     errorMessage: error.message,
//                     errorStack: error.stack,
//                 }
//             });
//         }finally{
//             await prisma.$disconnect();
//         }
//     }
// );

segmentRouter.get(
  '/getBySuperSegId/:superSegId',
  async (req, res) => {
    try {
      let { superSegId } = req.params;
      superSegId = parseInt(superSegId, 10);
      if (!isInteger(superSegId)) {
        return res.status(400).json("super segment id is invalid. ")
      }

      // Verify the parent super segment exists in unified table
      const theSuperSegment = await prisma.segments.findUnique({ where: { segId: superSegId } });
      if (!theSuperSegment || theSuperSegment.segmentType !== 'superSegment') {
        return res.status(404).json("super segment id is not in the database! ")
      }

      // Fetch segments where parentId equals the super segment's segId
      const segments = await prisma.segments.findMany({
        where: { parentId: superSegId, segmentType: 'segment' }
      });

      res.status(200).json(segments);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occured while trying to retrieve segments.",
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

segmentRouter.get(
  '/getBySegmentId/:segmentId',
  async (req, res, next) => {
    try {
      const parsedSegId = parseInt(req.params.segmentId);

      // Check if id is valid
      if (!parsedSegId) {
        return res.status(400).json({
          message: `A valid segmentId must be specified in the route parameter`
        });
      }
      if (parsedSegId) {
        const foundSegment = await prisma.segments.findUnique({
          where: { segId: parsedSegId }
        });
        if (foundSegment) {
          res.status(200).json(foundSegment);
        }
        if (!foundSegment) {
          return res.status(400).json({
            message: `The segment with listed ID (${parsedSegId}) does not exist.`,
          });
        }
      } else {
        res.status(404).json("segmentId is not found!");
      }





    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to fetch all segments",
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

segmentRouter.get(
  '/getBySubSegmentId/:SubSegmentId',
  async (req, res, next) => {
    try {
      const parsedSubSegId = parseInt(req.params.SubSegmentId);

      // // Check if id is valid
      // if (!parsedSubSegId) {
      //     res.status(404).json("subSegmentId is not found!");
      //     //return res.sendStatus(204);
      // }

      if (parsedSubSegId) {
        const foundSubSegment = await prisma.subSegments.findUnique({
          where: { id: parsedSubSegId }
        });
        if (foundSubSegment) {
          res.status(200).json(foundSubSegment);
        }
        if (!foundSubSegment) {
          return res.status(404).json({
            message: `The subSegment with listed ID (${parsedSubSegId}) does not exist.`,
          });
        }

      } else {
        res.status(404).json("subSegmentId is not found!");
      }


    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to fetch all subSegments",
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

segmentRouter.delete(
  '/delete/:segmentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      //get email and user id from request
      const { email, id } = req.user;
      //find the requesting user in the database
      const theUser = await prisma.user.findUnique({
        where: { id: id },
        select: { userType: true }
      });
      //Only admin can delete segment
      if (theUser.userType == 'SUPER_ADMIN' || theUser.userType == 'ADMIN') {
        const { segmentId } = req.params;
        const parsedSegmentId = parseInt(segmentId);
        const theSegment = await prisma.segments.findUnique({
          where: {
            segId: parsedSegmentId
          }
        });

        if (!theSegment) {
          return res.status(404).json("the segment need to be deleted not found!");
        } else {
          await prisma.userReach.deleteMany({
            where: {
              segId: parsedSegmentId
            }
          });

          await prisma.subSegments.deleteMany({
            where: {
              segId: parsedSegmentId
            }
          });

          await prisma.segments.delete({
            where: {
              segId: parsedSegmentId
            }
          });
          res.sendStatus(204);
        }
      } else {
        return res.status(403).json({
          message: "You don't have the right to delete a segment!",
          details: {
            errorMessage: 'In order to delete a segment, you must be an admin user.',
            errorStack: 'user must be an admin if they want to delete a segment',
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occured while trying to delete a segment.",
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

segmentRouter.post(
  '/update/:segmentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      //get email and user id from request
      const { email, id } = req.user;
      //find the requesting user in the database
      const theUser = await prisma.user.findUnique({
        where: { id: id },
        select: { userType: true }
      });
      //User must be admin to create segment
      if (theUser.userType == 'SUPER_ADMIN' || theUser.userType == 'ADMIN') {
        const { segmentId } = req.params;

        const parsedSegmentId = parseInt(segmentId);

        const { country, province, name, superSegId, superSegName } = req.body;

        console.log(req.body);

        let error = '';
        let errorMessage = '';
        let errorStack = '';

        //if there's no object in the request body
        if (isEmpty(req.body)) {
          return res.status(400).json({
            message: 'The objects in the request body are missing',
            details: {
              errorMessage: 'Updating a segment must supply necessary fields explicitly.',
              errorStack: 'necessary fields must be provided in the body with valid values',
            }
          })
        }
        //find the segment which need to be updated
        const theSegment = await prisma.segments.findUnique({
          where: {
            segId: parsedSegmentId
          }
        });

        if (!theSegment) {
          res.status(404).json("the segment need to be updated not found!");
        } else {

          if (country && !isString(country)) {
            error += 'A segment must has a country field. ';
            errorMessage += 'Updating a segment must explicitly be supplied with a country field. ';
            errorStack += 'cuntry must be provided in the body with a valid value. ';
          }

          if (province && !isString(province)) {
            error += 'A segment must has a province field. ';
            errorMessage += 'Updating a segment must explicitly be supplied with a province field. ';
            errorStack += 'province must be provided in the body with a valid value. ';
          }

          if (name && !isString(name)) {
            error += 'A segment must has a name field. ';
            errorMessage += 'Updating a segment must explicitly be supplied with a name field. ';
            errorStack += 'name must be provided in the body with a valid value. ';
          }

          // For update, allow changing parent super segment via parentSuperSegId
          const { parentSuperSegId } = req.body;
          let parentIdUpdate = undefined;
          if (parentSuperSegId !== undefined) {
            const parsedParent = parseInt(parentSuperSegId);
            if (!isInteger(parsedParent)) {
              error += 'Parent super segment id must be an integer. ';
              errorMessage += 'Updating a segment must be supplied with a valid integer parent super segment id. ';
              errorStack += 'parentSuperSegId must be a valid integer. ';
            } else {
              const parentSuperSeg = await prisma.segments.findUnique({ where: { segId: parsedParent } });
              if (!parentSuperSeg || parentSuperSeg.segmentType !== 'superSegment') {
                error += 'Parent super segment id must reference a super segment. ';
                errorMessage += 'parentSuperSegId must reference an existing super segment row. ';
                errorStack += 'parentSuperSegId invalid or not a super segment. ';
              } else {
                parentIdUpdate = parsedParent;
              }
            }
          }

          //If there's error in error holder
          if (error || errorMessage || errorStack) {
            return res.status(400).json({
              message: error,
              details: {
                errorMessage: errorMessage,
                errorStack: errorStack
              }
            });
          }

          const updated = await prisma.segments.update({
            where: { segId: parsedSegmentId },
            data: {
              country: country,
              province: province,
              name: name,
              parentId: parentIdUpdate
            }
          });
          const response = {
            segId: updated.segId,
            name: updated.name,
            country: updated.country,
            province: updated.province,
            parentId: updated.parentId,
            segmentType: updated.segmentType,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
          };
          res.status(200).json(response);
        }
      } else {
        return res.status(403).json({
          message: "You don't have the right to update a segment!",
          details: {
            errorMessage: 'In order to delete a segment, you must be an admin or business user.',
            errorStack: 'user must be an admin if they want to delete a segment',
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occured while trying to update a segment.",
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

//get segment by name endpoint

segmentRouter.post(
  '/getByName',
  async (req, res) => {
    let error = '';
    let errorMessage = '';
    let errorStack = '';
    try {
      //if there's no object in the request body
      if (isEmpty(req.body)) {
        return res.status(400).json({
          message: 'The objects in the request body are missing',
          details: {
            errorMessage: 'Finding a segment must supply necessary fields explicitly.',
            errorStack: 'necessary fields must be provided in the body with valid values',
          }
        })
      }

      const { country, province, segName } = req.body;

      if (!country) {
        error += 'Query must has a country field. ';
        errorMessage += 'Query must explicitly be supplied with a country field. ';
        errorStack += 'cuntry must be provided in the body with a valid value. ';
      }

      if (!isString(country) || country.length < 2 || country.length > 40) {
        error += 'Country value must be valid ';
        errorMessage += 'Country must be string with 2-40 characters ';
        errorStack += 'Country must be string with 2-40 characters ';
      }

      if (!province) {
        error += 'Query must has a province field. ';
        errorMessage += 'Query must explicitly be supplied with a province field. ';
        errorStack += 'Province must be provided in the body with a valid value. ';
      }

      if (!isString(province) || province.length < 2 || province.length > 40) {
        error += 'Province value must be valid ';
        errorMessage += 'Province must be string with 2-40 characters ';
        errorStack += 'Province must be string with 2-40 characters ';
      }

      if (!segName) {
        error += 'Query must has a segName field. ';
        errorMessage += 'Query must explicitly be supplied with a segName field. ';
        errorStack += 'segName must be provided in the body with a valid value. ';
      }

      if (!isString(segName) || segName.length < 2 || segName.length > 40) {
        error += 'segName value must be valid ';
        errorMessage += 'segName must be string with 2-40 characters ';
        errorStack += 'segName must be string with 2-40 characters ';
      }

      //If there's error in error holder
      if (error || errorMessage || errorStack) {
        return res.status(400).json({
          message: error,
          details: {
            errorMessage: errorMessage,
            errorStack: errorStack
          }
        });
      }

      const result = await prisma.segments.findFirst({
        where: {
          country: country,
          province: province,
          name: { contains: segName }
        }
      });

      // if(!result){
      //     return res.status(404).json("Segment not found!");
      // }

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "An error occured while trying to find a segment.",

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

segmentRouter.get(
  '/aggregateInfo/:segmentId',
  async (req, res) => {
    try {
      const segmentId = parseInt(req.params.segmentId);

      // Find users who have this segment as HOME / WORK / SCHOOL via UserSegments relation
      const home = await prisma.userSegments.findMany({ where: { segmentId, userSegmentRelationship: 'HOME' } });
      const work = await prisma.userSegments.findMany({ where: { segmentId, userSegmentRelationship: 'WORK' } });
      const student = await prisma.userSegments.findMany({ where: { segmentId, userSegmentRelationship: 'SCHOOL' } });

      const allUsers = [...home, ...work, ...student];
      const uniqueUserIds = [];
      allUsers.forEach(us => {
        if (us && us.userId && !uniqueUserIds.includes(us.userId)) {
          uniqueUserIds.push(us.userId);
        }
      });

      // Find ideas associated to this segment via the many-to-many relation
      const ideas = await prisma.idea.findMany({
        where: {
          segments: { some: { segId: segmentId } }
        },
        select: { id: true }
      });

      const ideaIds = ideas.map(i => i.id);

      // Count proposals and projects that reference these ideas
      const proposalsCount = ideaIds.length ? await prisma.proposal.count({ where: { ideaId: { in: ideaIds } } }) : 0;
      const projectsCount = ideaIds.length ? await prisma.project.count({ where: { ideaId: { in: ideaIds } } }) : 0;

      // Sub-segments are stored in Segments table with parentId referencing this segment
      const subSegments = await prisma.segments.findMany({ where: { parentId: segmentId, segmentType: 'subSegment' } });

      const superSegment = await prisma.segments.findFirst({ where: { segId: segmentId } });

      const subsegmentNames = subSegments.map((subSegment) => subSegment.name);

      const result = {
        totalUsers: uniqueUserIds.length,
        residents: home.length,
        workers: work.length,
        students: student.length,
        ideas: ideaIds.length,
        proposals: proposalsCount,
        projects: projectsCount,
        superSegmentName: superSegment ? superSegment.name : null,
        subSegmentsCount: subSegments.length,
        subSegments: subsegmentNames,
      };

      res.status(200).json(result);

    } catch (error) {
      console.log(error);
      res.status(400).end();
    } finally {
      await prisma.$disconnect();
    }
  }
)

segmentRouter.get(
  '/usersInfo/:segmentId',
  async (req, res) => {
    try {
      const home = await prisma.user.findMany({
        where: {
          OR: [
            { userSegments: { is: { homeSegmentId: parseInt(req.params.segmentId) } } },
            { userSegments: { is: { workSegmentId: parseInt(req.params.segmentId) } } },
            { userSegments: { is: { schoolSegmentId: parseInt(req.params.segmentId) } } }
          ],
          NOT: [
            { userType: UserType.ADMIN },
            { userType: UserType.SUPER_ADMIN },
            { userType: UserType.MOD }
          ]
        },
        include: {
          userSegments: true,
          Work_Details: true,
          School_Details: true,
          address: true
        }
      })

      const work = home.filter((user) => user.userSegments?.workSegmentId === parseInt(req.params.segmentId));
      const student = home.filter((user) => user.userSegments?.schoolSegmentId === parseInt(req.params.segmentId));

      const segment = await prisma.segments.findFirst({
        where: {
          segId: parseInt(req.params.segmentId)
        },
        include: {
          superSegment: true,
          SubSegments: true
        }
      })

      const allUsers = [...home, ...work, ...student];
      const uniqueUser = [];
      allUsers.forEach(user => {
        if (!uniqueUser.includes(user.id)) {
          uniqueUser.push(user.id);
        }
      });

      const result = {
        "segId": req.params.segmentId,
        "totalUsers": uniqueUser.length,
        "users": home,
        "residents": home,
        "workers": work,
        "students": student,
        "segment": segment
      }

      res.status(200).json(result);

    } catch (error) {
      console.log(error);
      res.status(400).end();
    } finally {
      await prisma.$disconnect();
    }
  }
)

module.exports = segmentRouter;