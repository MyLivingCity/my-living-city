    const prisma = require('../lib/prismaClient');

    /**
     * Cleans an address by removing leading numbers and spaces.
     * @param {string} address - The full address string to clean.
     * @returns {string} - The cleaned address.
     */
        function cleanAddress(address) {
            return address?.replace(/^\d+\s*/, '') || '';
        }

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
    ].filter((seg) => seg.id !== undefined && seg.id !== null);    

    // segmentAndSubsegmentIds.forEach(({ id, type }) => {
    //      console.log(`Preparing query for ${type} with ID: ${id}`);
    // });

    const promises = segmentAndSubsegmentIds.map(({ id, type }) => {
        if (type === 'segment') {
            return prisma.segments.findUnique({ where: { segId: id } });
        } else {
            return prisma.subSegments.findUnique({ where: { id: id } });
        }
    });

    // Store the results of the queries
    let homeSegmentData, workSegmentData, schoolSegmentData, homeSubSegmentData, workSubSegmentData, schoolSubSegmentData;
    await Promise.allSettled(promises).then((results) => {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                
                if (result.value === null) {
                    throw new Error(
                        `Error fetching segment or subsegment data: ${JSON.stringify(
                            segmentAndSubsegmentIds[index]
                        )}`
                    );
                }

                const { id, type } = segmentAndSubsegmentIds[index];
                // console.log(`Fetched ${type} with ID ${id}:`, result.value);

                if (type === 'segment') {
                    if (id === homeSegmentId) homeSegmentData = result.value;
                    if (id === workSegmentId) workSegmentData = result.value;
                    if (id === schoolSegmentId) schoolSegmentData = result.value;
                } else if (type === 'subSegment') {
                    if (id === homeSubSegmentId) homeSubSegmentData = result.value;
                    if (id === workSubSegmentId) workSubSegmentData = result.value;
                    if (id === schoolSubSegmentId) schoolSubSegmentData = result.value;
                }

            } else {
                throw new Error(
                    `Error fetching segment or subsegment data: ${JSON.stringify(
                        segmentAndSubsegmentIds[index]
                    )}`
                );
            }
        });
    });


    if(homeSegmentData) { 
        segmentData.homeSegmentName = homeSegmentData.name;
        segmentData.homeSuperSegId = homeSegmentData.superSegId;
        segmentData.homeSuperSegName = homeSegmentData.superSegName;
    }
    segmentData.homeSegHandle = `${firstName}@${homeSegHandle || ''}`;

    if (workSegmentData) {
        segmentData.workSegmentName = workSegmentData.name;
        segmentData.workSuperSegId = workSegmentData.superSegId;
        segmentData.workSuperSegName = workSegmentData.superSegName;
        segmentData.workSegHandle = `${firstName}@${workSegHandle || 'Work'}`;
    }

    if (schoolSegmentData) {
        segmentData.schoolSegmentName = schoolSegmentData.name;
        segmentData.schoolSuperSegId = schoolSegmentData.superSegId;
        segmentData.schoolSuperSegName = schoolSegmentData.superSegName;
        segmentData.schoolSegHandle = `${firstName}@${schoolSegHandle || 'School'}`;
        }

    if (homeSubSegmentData) { segmentData.homeSubSegmentName = homeSubSegmentData.name; 
    }
    if (workSubSegmentData) { segmentData.workSubSegmentName = workSubSegmentData.name;
    }
    if (schoolSubSegmentData) { segmentData.schoolSubSegmentName = schoolSubSegmentData.name; }


    return segmentData;
    }

    module.exports = {
    getSegmentInfo,
    cleanAddress
    }