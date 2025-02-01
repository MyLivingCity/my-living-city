const prisma = require("../../../lib/prismaClient");

const createUser = async (userData) => {
  try {
    // Destructure all the related data
    const {
      geo,
      address,
      userSegment, // This will now need to include segmentHandle and userSegmentRelationship
      segmentRequest,
      userReachRequest,
      schoolDetails,
      workDetails,
      stripeAccount,
      hashedPassword,
      // Remove data that's already been processed into other fields
      confirmPassword,
      reachSegmentIds,
      userReach,
      ...mainUserData
    } = userData;

    const createdUser = await prisma.user.create({
      data: {
        // Geo data
        geo: {
          create: geo
        },
        // Address data
        address: {
          create: address
        },
        // User segment data - modified according to new schema
        userSegment: {
          create: userSegment.map(segment => ({
            segmentHandle: segment.segmentHandle || "",
            userSegmentRelationship: segment.userSegmentRelationship,
            segment: {
              connect: {
                segId: segment.segmentId
              }
            }
          }))
        },
        // Segment request data
        segmentRequest: {
          create: segmentRequest || []
        },
        // User reach data
        userReach: {
          create: userReachRequest || []
        },
        // School details
        School_Details: {
          create: schoolDetails || {}
        },
        // Work details
        Work_Details: {
          create: workDetails || {}
        },
        // Stripe account if exists
        ...(stripeAccount && {
          stripe: {
            create: stripeAccount
          }
        }),
        // Main user data
        ...mainUserData,
        password: hashedPassword,
      },
      // Include all relations in the return
      include: {
        geo: true,
        address: true,
        userSegment: {
          include: {
            segment: true
          }
        },
        stripe: true,
        segmentRequest: true,
        userReach: true,
        School_Details: true,
        Work_Details: true,
      },
    });

    // Remove sensitive data before returning
    const userToReturn = {
      ...createdUser,
      password: undefined,
      passCode: undefined,
    };

    return userToReturn;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user in database');
  }
};
module.exports = createUser
