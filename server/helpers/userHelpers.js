const prisma = require('../lib/prismaClient');

/**
 * Checks if a user is authorized to create a new user of a certain role
 * or in a certain Super Segment or Segment.
 * 
 * @param userToCreate user that is being created
 * @param user user that is creating the new user
 */
function checkUserCreationAuthorization(userToCreate, user) {
  // TODO implement this function
  console.error('\x1b[31m%s\x1b[0m', 'Unimplemented checkUserCreationAuthorization');
  console.error('userToCreate:', userToCreate)
  console.error('userCreatingAccount:', user)
  return true // or false
}

/**
 * Inserts or updates a user segment entry in the UserSegments table.
 * 
 * If a matching user segment already exists (e.g., by user, relationship, and segment type),
 * it will be updated with the new `segmentId`. If it does not exist, a new entry will be created.
 * 
 * @param {Object|null} existing - The existing userSegment entry, if found (e.g., via findFirst).
 * @param {string} userId - The ID of the user associated with the segment.
 * @param {number|null} segmentId - The ID of the segment to associate with the user.
 * @param {'HOME' | 'WORK' | 'SCHOOL'} relationship - The type of user-segment relationship.
 */
const upsertUserSegment = async (existing, userId, segmentId, relationship) => {
  if (existing) {
    await prisma.userSegments.update({
      where: { id: existing.id },
      data: { segmentId },
    });
  } else {
    await prisma.userSegments.create({
      data: {
        userId,
        userSegmentRelationship: relationship,
        segmentId,
      },
    });
  }
};


module.exports = {
  checkUserCreationAuthorization,
  upsertUserSegment
}