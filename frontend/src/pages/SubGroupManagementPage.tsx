import { useContext } from 'react';
import { useAllUsers, useUserWithJwtVerbose } from 'src/hooks/userHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import SubGroupManagementContent from '../components/content/SubGroupManagementContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export interface SubGroup {
    name: string;
    createdAt: string;
    visibility: 'Public' | 'Private' | 'Test';
    groupType: 'Virtual' | 'Nested';
    nestedUnder: string | 'None (Virtual Group)';
}

//* Dummy data for subgroups
//* This should be replaced with actual data fetched from the backend
const dummySubGroups: SubGroup[] = [
    {
        name: 'SubGroup A',
        createdAt: '2024-01-01',
        visibility: 'Public',
        groupType: 'Virtual',
        nestedUnder: 'None (Virtual Group)',
    },
    {
        name: 'SubGroup B',
        createdAt: '2024-03-15',
        visibility: 'Private',
        groupType: 'Nested',
        nestedUnder: 'Main Group 2',
    },
    {
        name: 'SubGroup C',
        createdAt: '2024-05-10',
        visibility: 'Public',
        groupType: 'Nested',
        nestedUnder: 'Main Group 3',
    },
];

export default function SubGroupManagementPage() {
    const { token, user } = useContext(UserProfileContext);
    const { data: userData, isLoading: userLoading } = useAllUsers(token);

    if (userLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className='wrapper'>
            <SubGroupManagementContent 
                subGroups={dummySubGroups} 
                token={token ?? ''} 
                users={userData!}
            />
        </div>
    );
}