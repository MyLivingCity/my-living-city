import React, { useContext } from 'react';
import { useAllSegments } from 'src/hooks/segmentHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import SubgroupManagementContent from '../components/content/SubgroupCreationContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SubgroupManagementPage() {
    const { data, isLoading } = useAllSegments();
    const { token } = useContext(UserProfileContext);

    if (isLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className='wrapper'>
            <SubgroupManagementContent segments={data} token={token ?? ''} />
        </div>
    );
}
