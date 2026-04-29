import { prisma } from "src/prisma/client";

// const ADMIN_ROLES = require("../../constants/AdminRoles");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Custom error class for date validation
class DateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateValidationError";
  }
}

// Validate user reach function
export const validateUserReach = async (userReach) => {
  // Add validation logic here if needed
  return userReach;
};

export const generateAdminEmail = async (userData) => {
  const uniqueEmailGenerated = false;
  while (!uniqueEmailGenerated) {
    const randomDigits = Math.floor(Math.random() * 99)
      .toString()
      .padStart(1, "0");
    const randomChars = Math.random()
      .toString(35)
      .substring(2, 4)
      .toLowerCase();
    const adminmodEmail =
      `${userData.userType}${randomDigits}${randomChars}@mylivingcity.org`.toLowerCase();

    const adminmodUser = await prisma.user.findFirst({
      where: { email: adminmodEmail },
    });

    if (!adminmodUser) {
      return adminmodEmail;
    }
  }
};

export const processAdminAccount = async (userData) => {
  if (ADMIN_ROLES.includes(userData.userType)) {
    const adminEmail = await generateAdminEmail(userData);
    return {
      ...userData,
      adminmodEmail: userData.email.toLowerCase(),
      email: adminEmail,
    };
  }
  return userData;
};

export const processBusinessAccount = async (userData) => {
  if (["BUSINESS", "COMMUNITY"].includes(userData.userType)) {
    const stripeCustomer = await stripe.customers.create({
      email: userData.email.toLowerCase(),
    });

    const userReachRequest = await validateUserReach(userData.userReach);

    return {
      ...userData,
      stripeAccount: {
        stripeId: stripeCustomer.id,
        status: "incomplete",
      },
      userReachRequest,
    };
  }
  return userData;
};

export const processSchool = (userData) => {
  try {
    // Initialize schoolDetails, if it doesn't exist in userData, set to empty object
    const schoolDetails = userData.schoolDetails || {};

    // Handle program completion date
    if (schoolDetails.programCompletionDate) {
      const parsedDate = new Date(schoolDetails.programCompletionDate);

      if (isNaN(parsedDate.getTime())) {
        throw new DateValidationError(
          "Invalid date for program completion date.",
        );
      }

      schoolDetails.programCompletionDate = parsedDate;
    } else {
      schoolDetails.programCompletionDate = null;
    }

    // Return processed school details
    return {
      ...schoolDetails,
    };
  } catch (error) {
    if (error instanceof DateValidationError) {
      throw error; // Propagate validation errors
    }
    // Handle unexpected errors
    console.error("Error processing school details:", error);
    throw new Error("Failed to process school details");
  }
};

export const processResidentialAccount = (userData) => {
  if (userData.userType !== "RESIDENTIAL") {
    return userData;
  }

  const schoolDetails = processSchool(userData.schoolDetails);
  const workDetails = userData.workDetails || {};

  return {
    ...userData,
    schoolDetails,
    workDetails,
  };
};

export const processUserSegments = (userData) => {
  const { userSegment, ...restUserData } = userData;
  const processedSegments = [];

  // Process home segment if exists
  if (userSegment.homeSegmentId) {
    processedSegments.push({
      userSegmentRelationship: "HOME",
      segmentId: userSegment.homeSegmentId,
    });
  }

  // Process work segment if exists
  if (userSegment.workSegmentId) {
    processedSegments.push({
      userSegmentRelationship: "WORK",
      segmentId: userSegment.workSegmentId,
    });
  }

  // Process school segment if exists
  if (userSegment.schoolSegmentId) {
    processedSegments.push({
      userSegmentRelationship: "SCHOOL",
      segmentId: userSegment.schoolSegmentId,
    });
  }

  // Add sub-segments if they exist - they use the same relationship types
  if (userSegment.homeSubSegmentId) {
    processedSegments.push({
      userSegmentRelationship: "HOME",
      segmentId: userSegment.homeSubSegmentId,
    });
  }

  if (userSegment.workSubSegmentId) {
    processedSegments.push({
      userSegmentRelationship: "WORK",
      segmentId: userSegment.workSubSegmentId,
    });
  }

  if (userSegment.schoolSubSegmentId) {
    processedSegments.push({
      userSegmentRelationship: "SCHOOL",
      segmentId: userSegment.schoolSubSegmentId,
    });
  }

  return {
    ...restUserData,
    userSegment: processedSegments,
  };
};

export const createUser = async (userData) => {
  try {
    // Destructure all the related data
    const {
      id, // Prisma generates this via @default(cuid())
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
          create: geo,
        },
        // Address data
        address: {
          create: address,
        },
        // User segment data - modified according to schema
        userSegment: {
          create: userSegment.map((segment) => ({
            userSegmentRelationship: segment.userSegmentRelationship,
            segment: {
              connect: {
                segId: segment.segmentId,
              },
            },
          })),
        },
        // Segment request data
        segmentRequest: {
          create: segmentRequest || [],
        },
        // User reach data
        userReach: {
          create: userReachRequest || [],
        },
        // School details
        School_Details: {
          create: schoolDetails || {},
        },
        // Work details
        Work_Details: {
          create: workDetails || {},
        },
        // Stripe account if exists
        ...(stripeAccount && {
          stripe: {
            create: stripeAccount,
          },
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
            segment: true,
          },
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
    console.error("Error creating user:", error);
    throw new Error("Failed to create user in database");
  }
};
