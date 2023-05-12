import React, { useEffect, useState } from 'react';
import { getMyUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { capitalizeString } from 'src/lib/utilityFunctions';
import { IUserSegment } from './../../lib/types/input/register.input';

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
  const [userSegment, setUserSegment] = useState<IUserSegment | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await getMyUserSegmentInfo(token!, id);
      if (response) {
        setUserSegment(response);
      } else {
        setUserSegment(null);
      }
    }
    fetchData();
  }, [id, token]);

  // Extract the home segment as a string
  const homeSegment = userSegment?.homeSegmentName
    ? capitalizeString(userSegment.homeSegmentName)
    : '';

  return <>{homeSegment}</>;
};