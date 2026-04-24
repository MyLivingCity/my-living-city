/** 
 * SubGroupManagementContent.tsx
 * 
 * Component for managing a selected subgroup, this includes:
 * - SubGroupSelector: Display and select a subgroup to manage
 * - SubGroupMembersTable: Shows current members of the subgroup
 * - UserSubGroupRequestCard: Displays join and rejected requests
 * - SubGroupUserManagement: Allows management of user not in the subgroup to add them to the subgroup
*/

import React, {useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

// Partial components
import { UserSubGroupRequestCard } from 'src/components/content/subgroup/SubgroupRequestCard';
import { SubGroupSelector } from '@components/content/subgroup/SubgroupSelector';
import { SubGroupMembersTable } from '@components/content/subgroup/SubgroupMembersTable';
import SubGroupUserManagement from '@components/content/subgroup/SubgroupUserManagement';
import LoadingSpinner from '@components/ui/misc/Loading.Spinner';

// Types
import type { IUser } from 'src/types/user.types';
import type { ISubGroup } from 'src/types/subgroup.types';

// Hooks
import { useGetUserNotInSubGroup, useGetUserInSubGroup } from 'src/Hooks/subgroupHooks';

interface SubGroupManagementContentProps {
    user: IUser | null;
    token: string;
    subGroups: ISubGroup[];
}

const SubGroupManagementContent: React.FC<SubGroupManagementContentProps> = ({
    user,
    token,
    subGroups,
}) => {
    // State for selected subgroup name and details
    const [subGroupName, setSubGroupName] = useState<string>(' ');
    const [selectedSubGroup, setSelectedSubGroup] = useState<ISubGroup | null>(null);
    
    // Fetch users in the selected subgroup
    const { data: usersInSubGroup, isLoading: userInSubGroupLoading, refetch: refetchUsersInSubGroup  } = useGetUserInSubGroup(token, selectedSubGroup?.id || '');

    // Filter users based on their member status
    const currentMembers = usersInSubGroup ? usersInSubGroup!.filter((user) => user.status === 'APPROVED') : [];
    const joinRequests = usersInSubGroup ? usersInSubGroup.filter((user) => user.status === 'PENDING') : [];
    const rejectedUsers = usersInSubGroup ? usersInSubGroup.filter((user) => user.status === 'REJECTED') : [];

    // Fetch users not in the selected subgroup
    const { data: usersNotInSubGroup, isLoading: usersNotInSubGroupLoading } = useGetUserNotInSubGroup(token, selectedSubGroup?.id || '');

    // Initialize default subgroup from localStorage or first in list
    useEffect(() => {
        if (subGroups && subGroups.length > 0) {
            const savedSubGroupName = localStorage.getItem('selectedSubGroupName');

            if (savedSubGroupName && subGroups.some(sg => sg.name.toLowerCase() === savedSubGroupName.toLowerCase())) {
                setSubGroupName(savedSubGroupName);
            } else {
                const defaultName = subGroups[0].name.toLowerCase();
                setSubGroupName(defaultName);
            }
        }
    }, [subGroups]);

    // Update selectedSubGroup based on selected name
    useEffect(() => {
        const match = subGroups && subGroups.find(
            (sg) => sg.name.toLowerCase() === subGroupName.toLowerCase()
        );
        setSelectedSubGroup(match || null);
    }, [subGroupName, subGroups]);

    // Save selected subgroup members to local state
    useEffect(() => {
        if (subGroupName.trim() !== '') {
            localStorage.setItem('selectedSubGroupName', subGroupName);
        }
    }, [subGroupName]);

    if (userInSubGroupLoading || usersNotInSubGroupLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }
    
    return (
        <Container className='mb-4 mt-4'>
            <h2 className='pb-2 pt-2 display-6'>SubGroup Manager</h2>
            <SubGroupSelector
                subGroupName={subGroupName}
                selectedSubGroup={selectedSubGroup}
                subGroups={subGroups}
                setSubGroupName={setSubGroupName}
            />

            <br />

            <SubGroupMembersTable 
                token={token} 
                subGroupId={selectedSubGroup?.id || ''}
                subGroupName={subGroupName}
                members={currentMembers}
                refetchMembers={refetchUsersInSubGroup}
            />

            <br />

            <UserSubGroupRequestCard 
                token={token}
                subGroupId={selectedSubGroup?.id || ''}
                joinRequests={joinRequests}
                rejectedUsers={rejectedUsers}
                refetchUsersInSubGroup={refetchUsersInSubGroup} 
            />

            <br />

            <SubGroupUserManagement 
                user={user}
                token={token}
                subGroupId={selectedSubGroup?.id || ''}
                users={usersNotInSubGroup} 
                refetchUsersInSubGroup={refetchUsersInSubGroup}
            /> 
        </Container>
    );
}; 

export default SubGroupManagementContent;