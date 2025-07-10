import React, {useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { SubGroup } from '../../pages/SubGroupManagementPage';
import { UserSubGroupRequestCard } from '../partials/SubGroupContent/SubGroupRequestCard';
import { SubGroupSelector } from '../content/SubGroupSelector';
import { SubGroupMembersTable } from '../content/SubGroupMembersTable';
import SubGroupUserManagement from './SubGroupUserManagement';
import { IUser } from 'src/lib/types/data/user.type';

interface SubGroupManagementContentProps {
    subGroups: SubGroup[];
    token: string;
    users: IUser[] | undefined
}

export interface FakeUser {
    email: string;
    organization: string;
    first: string;
    last: string;
    userType: string;
    homeSegment: string;
    schoolSegment: string;
}

//* Dummy data for users in subgroups
//* This should be replaced with actual data fetched from the backend
const fakeUsersBySubGroup: Record<string, FakeUser[]> = {
    'subgroup a': [
        {
            email: 'green.jane@example.com',
            organization: 'EcoFuture Org',
            first: 'Jane',
            last: 'Green',
            userType: 'Educator',
            homeSegment: 'Downtown',
            schoolSegment: 'Sustainability School'
        },
        {
            email: 'recycle.tom@example.com',
            organization: 'GreenLoop',
            first: 'Tom',
            last: 'Cycle',
            userType: 'Student',
            homeSegment: 'Uptown',
            schoolSegment: 'Riverdale High'
        }
    ],
    'subgroup b': [
        {
            email: 'sam.digital@example.com',
            organization: 'RemoteAid',
            first: 'Sam',
            last: 'Digital',
            userType: 'Volunteer',
            homeSegment: 'Online',
            schoolSegment: 'N/A'
        }
    ],
    'subgroup c': [
        {
            email: 'alex.brick@example.com',
            organization: 'UrbanUnity',
            first: 'Alex',
            last: 'Brick',
            userType: 'Community Member',
            homeSegment: 'Maple Street',
            schoolSegment: 'Maple Secondary'
        },
        {
            email: 'lee.foundation@example.com',
            organization: 'CivicBuild',
            first: 'Lee',
            last: 'Foundation',
            userType: 'Engineer',
            homeSegment: 'Oak Block',
            schoolSegment: 'CityTech'
        }
    ]
};

const SubGroupManagementContent: React.FC<SubGroupManagementContentProps> = ({
    subGroups,
    token,
    users
}) => {
    const [subGroupName, setSubGroupName] = useState<string>(' ');
    const [selectedSubGroup, setSelectedSubGroup] = useState<SubGroup | null>(null);

    // Initialize default subgroup
    useEffect(() => {
        if (subGroups && subGroups.length > 0) {
            const defaultName = subGroups[0].name.toLowerCase();
            setSubGroupName(defaultName);
        }
    }, [subGroups]);

    // Update selectedSubGroup based on selected name
    useEffect(() => {
        const match = subGroups && subGroups.find(
            (sg) => sg.name.toLowerCase() === subGroupName.toLowerCase()
        );
        setSelectedSubGroup(match || null);
    }, [subGroupName, subGroups]);
    
    return (
        <Container className='mb-4 mt-4'>
            <h2 className='pb-2 pt-2 display-6'>SubGroup Manager</h2>
            <SubGroupSelector
                subGroups={subGroups}
                subGroupName={subGroupName}
                setSubGroupName={setSubGroupName}
                selectedSubGroup={selectedSubGroup}
            />

            <br />

            <SubGroupMembersTable 
                subGroupName={subGroupName}
                members={fakeUsersBySubGroup[subGroupName] || []}
                token={''} 
            />

            <br />
      
            <UserSubGroupRequestCard 
                segReq={undefined} 
                token={''} 
            />

            <br />

            <SubGroupUserManagement 
                user={null}
                users={users} 
                token={''}
            />
            
        </Container>
    );
}; 

export default SubGroupManagementContent;