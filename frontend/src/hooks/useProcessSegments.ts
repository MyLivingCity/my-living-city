import { useEffect, useState } from 'react';
import { ISegmentData } from 'src/lib/types/data/segment.type';

// Type definition for raw API response
export interface IRawSegment {
    segId: number;
    parentId: number | null;
    name: string;
    segmentType: 'superSegment' | 'segment' | 'subSegment';
}

export interface IRawUserSegment {
    id: number;
    userId: string;
    userSegmentRelationship: 'HOME' | 'WORK' | 'SCHOOL';
    segmentId: number;
    segment: IRawSegment;
}

/**
 * Custom hook to process raw segment data from API into ISegmentData format
 * Handles both raw API responses and pre-processed ISegmentData arrays
 * @param segData - Raw array of user segments from API
 * @returns processedSegData - Transformed and filtered segments ready for UI
 */
export const useProcessSegments = (segData: any[]) => {
    const [processedSegData, setProcessedSegData] = useState<ISegmentData[]>([]);

    useEffect(() => {
        let tempSegData: ISegmentData[] = [];

        if (Array.isArray(segData) && segData.length > 0) {
            // Check if data is raw API format (has segment property with segmentType)
            if ((segData as IRawUserSegment[])[0]?.segment?.segmentType) {
                // Transform raw API data
                tempSegData = (segData as IRawUserSegment[])
                    .map((userSegment) => {
                        const segment = userSegment.segment;

                        // Map segmentType to user-friendly segType
                        let segType: 'Super-Segment' | 'Segment' | 'Sub-Segment';
                        if (segment.segmentType === 'subSegment') {
                            segType = 'Sub-Segment';
                        } else if (segment.segmentType === 'superSegment') {
                            segType = 'Super-Segment';
                        } else {
                            segType = 'Segment';
                        }

                        // Map userSegmentRelationship to user-friendly userType
                        const userType = userSegment.userSegmentRelationship === 'HOME'
                            ? 'Resident'
                            : userSegment.userSegmentRelationship === 'WORK'
                                ? 'Worker'
                                : 'Student';

                        return {
                            id: segment.segId,
                            name: segment.name,
                            segType,
                            userType,
                        } as ISegmentData;
                    })
                    .filter((seg) => seg.name && seg.name.trim() !== '');
            } else {
                // Data is already in ISegmentData format
                tempSegData = (segData as ISegmentData[]).filter(
                    (seg) => seg.name && seg.name.trim() !== ''
                );
            }
        }

        setProcessedSegData(tempSegData);
        console.log('Processed segData for dropdown:', tempSegData);
    }, [segData]);

    return processedSegData;
};
