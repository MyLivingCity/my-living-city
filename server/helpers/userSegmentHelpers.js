const prisma = require('../lib/prismaClient');

/**
 * This function takes in the segment and subsegment ids from the request body and
 * returns the segment and subsegment data from the database.
 */
async function getSegmentInfo(segments, firstName, homeSegHandle, workSegHandle, schoolSegHandle ) {
  const { homeSegmentId,workSegmentId,schoolSegmentId,homeSubSegmentId,workSubSegmentId,schoolSubSegmentId } = segments;
  const segmentData = {
      homeSegmentId,
      workSegmentId,
      schoolSegmentId,
      homeSubSegmentId,
      workSubSegmentId,
      schoolSubSegmentId,
      homeSuperSegId: null,
      workSuperSegId: null,
      schoolSuperSegId: null,
      homeSuperSegName: '',
      workSuperSegName: '',
      schoolSuperSegName: '',
      homeSegmentName: '',
      workSegmentName: '',
      schoolSegmentName: '',
      homeSubSegmentName: '',
      workSubSegmentName: '',
      schoolSubSegmentName: '',
      homeSegHandle: '',
      workSegHandle: '',
      schoolSegHandle: ''
  };

  // Iterate through the segments and check if all values are integers or null
  for (let key of Object.keys(segments)) {
      if (segments[key] !== null && !Number.isInteger(segments[key])) {
          throw new Error(`${key} must be an integer or null.`);
      }
  }

  // A list of which segment and subsegment ids to fetch from the database
  const segmentAndSubsegmentIds = [
      { id: homeSegmentId, type: 'segment' },
      { id: workSegmentId, type: 'segment' },
      { id: schoolSegmentId, type: 'segment' },
      { id: homeSubSegmentId, type: 'subSegment' },
      { id: workSubSegmentId, type: 'subSegment' },
      { id: schoolSubSegmentId, type: 'subSegment' }
  ];
  
  // Make a list of promises to fetch the segment and subsegment data from the database
  const promises = segmentAndSubsegmentIds
      .filter(( seg ) => seg.id) // Filter out null IDs first
      .map(({ id, type }) =>
          type === 'segment'
              ? prisma.segments.findUnique({ where: { segId: id } })
              : prisma.subSegments.findUnique({ where: { id: id } })
      );

  // Keep track of which request is being checked.
  let counter = 0;
  // Store the results of the queries
  let homeSegmentData, workSegmentData, schoolSegmentData, homeSubSegmentData, workSubSegmentData, schoolSubSegmentData;
  await Promise.allSettled(promises).then((results) => {
      results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
              // If id not in data base throw error
              if (result.value === null) {
                  throw new Error(`Error fetching segment or subsegment data: ${JSON.stringify(segmentAndSubsegmentIds[index])}`);
              }
              while (segmentAndSubsegmentIds[counter]?.id === null && counter < 6) {
                  counter++;
              }
              if (counter === 0) {
                  homeSegmentData = result.value;
              } else if (counter === 1) {
                  workSegmentData = result.value;
              } else if (counter === 2) {
                  schoolSegmentData = result.value;
              } else if (counter === 3) {
                  homeSubSegmentData = result.value;
              } else if (counter === 4) {
                  workSubSegmentData = result.value;
              } else if (counter === 5) {
                  schoolSubSegmentData = result.value;
              }
              counter++;
          } else {
              throw new Error(`Error fetching segment or subsegment data: ${JSON.stringify(segmentAndSubsegmentIds[index])}`);
          }
      });
  });

  if(homeSegmentData) { 
    segmentData.homeSegmentName = homeSegmentData.name;
    segmentData.homeSuperSegId = homeSegmentData.superSegId;
    segmentData.homeSuperSegName = homeSegmentData.superSegName;
  }
  segmentData.homeSegHandle = `${firstName}@${homeSegHandle || ''}`; // default was address.streetAddress

  if (workSegmentData) {
      segmentData.workSegmentName = workSegmentData.name;
      segmentData.workSuperSegId = workSegmentData.superSegId;
      segmentData.workSuperSegName = workSegmentData.superSegName;
      segmentData.workSegHandle = `${firstName}@${workSegHandle || 'Work'}`; // default was Work_Details.company
  }

  if (schoolSegmentData) {
      segmentData.schoolSegmentName = schoolSegmentData.name;
      segmentData.schoolSuperSegId = schoolSegmentData.superSegId;
      segmentData.schoolSuperSegName = schoolSegmentData.superSegName;
      segmentData.schoolSegHandle = `${firstName}@${schoolSegHandle || 'School'}`; // default was School_Details.faculty
  }

  if (homeSubSegmentData) { segmentData.homeSubSegmentName = homeSubSegmentData.name; }
  if (workSubSegmentData) { segmentData.workSubSegmentName = workSubSegmentData.name; }
  if (schoolSubSegmentData) { segmentData.schoolSubSegmentName = schoolSubSegmentData.name; }

  return segmentData;
}

module.exports = {
  getSegmentInfo
}