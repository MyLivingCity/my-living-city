import React, { useContext } from 'react';
import { useAllSegmentRequests, useAllSegments } from 'src/hooks/segmentHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import SegmentManagementContent from '../components/content/SegmentManagementContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';


export default function SegmentManagementPage() {

    const { data, isLoading } = useAllSegments();
    const { token, user } = useContext(UserProfileContext);
   
    const segReq = useAllSegmentRequests(token);
    
    if (isLoading || segReq.isLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }
  
    return (
        <div className='wrapper'>
            <SegmentManagementContent segments={ data } token = {token} segReq={segReq.data}/>
        </div>
    );
}
