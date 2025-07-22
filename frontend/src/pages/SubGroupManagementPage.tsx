/** 
 * SubGroupManagementPage.tsx
 * 
 * This page handles the management of subgroups, allowing users to view the subgroups they manage, 
 * add or remove users, and accept or reject user requests to join subgroups.
*/

import { useContext } from 'react';

// Context 
import { UserProfileContext } from '../contexts/UserProfile.Context';

// Components
import SubGroupManagementContent from '../components/content/SubGroupManagementContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Hooks
import { useGetSubGroupsManaged } from '../hooks/subGroupsHooks';

export default function SubGroupManagementPage() {

    // Get user token and profile from context
    const { token, user } = useContext(UserProfileContext);

    // Fetch subgroups managed by the user
    const { data: managedSubGroups, isLoading: subGroupsLoading } = useGetSubGroupsManaged(token);

    if (subGroupsLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className='wrapper'>
            <SubGroupManagementContent
                user={user} 
                token={token ?? ''}
                subGroups={managedSubGroups || []} 
            />
        </div>
    );
}