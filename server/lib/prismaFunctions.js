const {
  PROJECT_RATING_AVG,
  PROJECT_RATING_COUNT,
  PROPOSAL_RATING_AVG,
  PROPOSAL_RATING_COUNT
} = require("./constants");
const prisma = require('../lib/prismaClient');


/**
 * Checks to see if a certain idea with given id meets the thresholds specified in the
 * environment variables. Returns an object that has fields that are booleans to signify
 * if an idea meets specific thresholds.
 * 
 * @param { string | number } ideaId The idea id that identifies the idea that will be checked
 * @returns An object that has fields that flag if the idea meets the thresholds found in env vars
 */
const checkIdeaThresholds = async (ideaId) => {
  let thresholdObject = {
    triggerProposalAdvancement: false,
    triggerProjectAdvancement: false,
    isChampionable: false,
  }

  // Check if idea exists and throws error that will be caught in endpoint 
  const parsedIdeaId = parseInt(ideaId);
  const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId } });

  if (!foundIdea) {
    throw new Error(`The idea with that listed ID (${parsedIdeaId}) does not exist.`)
  }

  const ratingAggregations = await prisma.ideaRating.aggregate({
    where: { ideaId },
    avg: {
      rating: true
    },
    count: true,
  });

  console.log(ratingAggregations);
  const ratingAvg = ratingAggregations.avg.rating || 0;
  const ratingCount = ratingAggregations.count || 0;

  // Check if idea meets Proposal thresholds
  if (
    PROPOSAL_RATING_AVG <= ratingAvg &&
    PROPOSAL_RATING_COUNT <= ratingCount &&
    foundIdea.state === 'IDEA'
  ) {
    console.log("Meets Proposal Threshold")
    thresholdObject.triggerProposalAdvancement = true;
  }

  // Check if idea meets Project thresholds
  if (
    PROJECT_RATING_AVG <= ratingAvg &&
    PROJECT_RATING_COUNT <= ratingCount && (
      foundIdea.state === 'IDEA' ||
      foundIdea.state === 'PROPOSAL'
    )
  ) {
    thresholdObject.triggerProjectAdvancement = true;
  }


  // Check if idea has champion
  // TODO: Specify and check if idea is championable
  if (
    foundIdea.championId == null &&
    PROPOSAL_RATING_AVG <= ratingAvg &&
    PROPOSAL_RATING_COUNT <= ratingCount
  ) {
    thresholdObject.isChampionable = true;
  }

  console.log(thresholdObject);

  return thresholdObject;
}

module.exports = {
  checkIdeaThresholds
}