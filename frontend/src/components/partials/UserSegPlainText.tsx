import React, { useEffect, useState } from 'react';
import { getMyUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { capitalizeString } from 'src/lib/utilityFunctions';
import { IUserSegment, SegmentType, UserSegmentRelationshipEnum } from 'src/lib/types/data/segment.type';

interface UserSegPlainTextProps {
  email: string;
  id: string;
  token: string | null;
}

export const UserSegPlainText: React.FC<UserSegPlainTextProps> = ({
    email,
    id,
    token,
}) => {
    const [userSegments, setUserSegments] = useState<IUserSegment[] | null>(null);

    useEffect(() => {
        async function fetchData() {
            const response = await getMyUserSegmentInfo(token!, id);
            setUserSegments(response|| null);

        }
        fetchData();
    }, [id, token]);

    // Extract the home segment as a string
    const homeSegment = userSegments?.find(seg => seg.userSegmentRelationship == UserSegmentRelationshipEnum.HOME && seg.segment?.segmentType == SegmentType.segment)?.segment?.name;

    return <>{homeSegment}</>;
};