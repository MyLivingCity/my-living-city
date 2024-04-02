import React, { useContext } from 'react';
import { useAllSegmentRequests, useAllSegments, useAllSuperSegments } from 'src/hooks/segmentHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import SegmentManagementContent from '../components/content/SegmentManagementContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';


export default function SegmentManagementPage() {

    const { data, isLoading } = useAllSegments();
    const { data: superSegments, isLoading: superSegmentsLoading } = useAllSuperSegments();
    const { token, user } = useContext(UserProfileContext);

    const segReq = useAllSegmentRequests(token);
    
    if (isLoading || segReq.isLoading || superSegmentsLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className='wrapper'>
            <SegmentManagementContent superSegments={superSegments } segments={ data } token = {token} segReq={segReq.data}/>
        </div>
    );
}
