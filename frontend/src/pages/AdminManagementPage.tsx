import React, { useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { AdminManagementContent } from 'src/components/content/AdminManagementContent';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useAllUsers } from 'src/hooks/userHooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { IUser } from 'src/lib/types/data/user.type';
import { useAllBanDetails } from 'src/hooks/banHooks';
import { useAllSuperSegments } from 'src/hooks/segmentHooks';
import { ISuperSegment } from 'src/lib/types/data/segment.type';
import { ISegment } from 'src/lib/types/data/segment.type';
import { useAllSegments } from 'src/hooks/segmentHooks';
import { IUserSegment } from 'src/lib/types/data/segment.type';
import { useAllUserSegments } from 'src/hooks/userSegmentHooks';


// Extends Route component props with idea title route param
interface AdminManagementPropsLegacy extends RouteComponentProps<{}> {
  // Add custom added props here 
  users: IUser[]; 
  token: string | null; 
  user: IUser | null;
  segs: ISuperSegment[];
  subSeg: ISegment;
  userSegement: IUserSegment[];

}

const AdminManagementPage: React.FC<AdminManagementPropsLegacy> = ({}) => {
  const { token } = useContext(UserProfileContext);
  const { user } = useContext(UserProfileContext);
  const { data: userData, isLoading: userLoading} = useAllUsers(token);
  const { data: banData, isLoading: banLoading} = useAllBanDetails();
  const { data: segData = [], isLoading: segLoading} = useAllSuperSegments();
  const { data: subSegData = [], isLoading: subSegLoading} = useAllSegments();

 

  if (userLoading || banLoading || segLoading || subSegLoading) {
    return(
      <div className="wrapper">
      <LoadingSpinner />
      </div>
    )
  }

  // TODO: Create non blocking error handling

  return (
    <div className="wrapper">
      <AdminManagementContent  users={userData!}token={token} user={user}  bans={banData} segs={segData} subSeg={subSegData} />
    </div>
  );
}

export default AdminManagementPage