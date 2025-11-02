const ADMIN_ROLES = require("../../constants/AdminRoles");
const prisma = require("../../lib/prismaClient");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Custom error class for date validation
class DateValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DateValidationError';
  }
}

// Validate user reach function
const validateUserReach = async (userReach) => {
  // Add validation logic here if needed
  return userReach;
};

const generateAdminEmail = async (userData) => {
  try {
    let uniqueEmailGenerated = false;
    while (!uniqueEmailGenerated) {
      const randomDigits = Math.floor(Math.random() * 99)
        .toString()
        .padStart(1, "0");
      const randomChars = Math.random().toString(35).substring(2, 4).toLowerCase();
      const adminmodEmail = `${userData.userType}${randomDigits}${randomChars}@mylivingcity.org`.toLowerCase();

      const adminmodUser = await prisma.user.findFirst({
        where: { email: adminmodEmail },
      });

      if (!adminmodUser) {
        return adminmodEmail;
      }
    }
  } catch (error) {
    throw error;
  }
};

const processAdminAccount = async (userData) => {
  try {
    if (ADMIN_ROLES.includes(userData.userType)) {
      const adminEmail = await generateAdminEmail(userData);
      return {
        ...userData,
        adminmodEmail: userData.email.toLowerCase(),
        email: adminEmail,
      };
    }
    return userData;
  } catch (error) {
    throw error;
  }
};

const processBusinessAccount = async (userData) => {
  try {
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
  } catch (error) {
    throw error;
  }
};


const processSchool = (userData) => {
  try {
    // Initialize schoolDetails, if it doesn't exist in userData, set to empty object
    let schoolDetails = userData.schoolDetails || {};

    // Handle program completion date
    if (schoolDetails.programCompletionDate) {
      const parsedDate = new Date(schoolDetails.programCompletionDate);
      
      if (isNaN(parsedDate.getTime())) {
        throw new DateValidationError("Invalid date for program completion date.");
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
    console.error('Error processing school details:', error);
    throw new Error('Failed to process school details');
  }
};

const processResidentialAccount = (userData) => {
  try {
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
  } catch (error) {
    throw error;
  }
};
const processUserSegments = (userData) => {
  const { userSegment, ...restUserData } = userData;
  const processedSegments = [];

  // Process home segment if exists
  if (userSegment.homeSegmentId) {
    processedSegments.push({
      userSegmentRelationship: 'HOME',
      segmentId: userSegment.homeSegmentId
    });
  }

  // Process work segment if exists
  if (userSegment.workSegmentId) {
    processedSegments.push({
      userSegmentRelationship: 'WORK',
      segmentId: userSegment.workSegmentId
    });
  }

  // Process school segment if exists
  if (userSegment.schoolSegmentId) {
    processedSegments.push({
      userSegmentRelationship: 'SCHOOL',
      segmentId: userSegment.schoolSegmentId
    });
  }

  // Add sub-segments if they exist - they use the same relationship types
  if (userSegment.homeSubSegmentId) {
    processedSegments.push({
      userSegmentRelationship: 'HOME',
      segmentId: userSegment.homeSubSegmentId
    });
  }

  if (userSegment.workSubSegmentId) {
    processedSegments.push({
      userSegmentRelationship: 'WORK',
      segmentId: userSegment.workSubSegmentId
    });
  }

  if (userSegment.schoolSubSegmentId) {
    processedSegments.push({
      userSegmentRelationship: 'SCHOOL',
      segmentId: userSegment.schoolSubSegmentId
    });
  }

  return {
    ...restUserData,
    userSegment: processedSegments
  };
};

module.exports = { processAdminAccount, processResidentialAccount, processBusinessAccount, processSchool, processUserSegments }