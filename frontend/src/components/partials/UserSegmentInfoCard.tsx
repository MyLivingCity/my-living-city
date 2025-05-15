import React, { useEffect, useState } from 'react';
import { Button, Card, Table } from 'react-bootstrap';
import { getMyUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { capitalizeString, getSegmentsFromUserSegments } from 'src/lib/utilityFunctions';
import { IUserSegment, UserSegmentRelationshipEnum } from './../../lib/types/data/segment.type';

interface UserSegmentInfoCardProps {
    email: string;
    id: string;
    token: string | null;
}

export const UserSegmentInfoCard: React.FC<UserSegmentInfoCardProps> = ({email, id, token}) => {
    const [showReq, setShowReq] = useState(false);
    const [update, setUpdate] = useState(false);
    const [userSegments, setUserSegments] = useState<IUserSegment[] | null>();
    const capitalizeString = (s: string) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    useEffect(()=>{
        async function fetchData() {
            const response = await getMyUserSegmentInfo(token!, id);
            setUserSegments(response || null);
        }
        fetchData();
    },[id, token]);

    const { homeSegments, workSegments, schoolSegments} = getSegmentsFromUserSegments(userSegments ?? undefined);

    return (

        <Card>
            <Card.Header>{capitalizeString(email)}'s Segment Info<Button onClick={()=>{setShowReq(b=>!b);}}className='float-right' size='sm'>{showReq ? 'Hide Details': 'View Details'}</Button></Card.Header>
            {showReq && 
            <Card.Body>
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th scope='col'>Home Segment</th>
                            <th scope='col'>Work Segment</th>
                            <th scope='col'>School Segment</th>
                            <th scope='col'>Home Sub-Segment</th>
                            <th scope='col'>Work Sub-Segment</th>
                            <th scope='col'>School Sub-Segment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{capitalizeString(homeSegments?.segment?.name || '')}</td>
                            <td>{capitalizeString(workSegments?.segment?.name || '')}</td>
                            <td>{capitalizeString(schoolSegments?.segment?.name || '')}</td>
                            <td>{capitalizeString(homeSegments?.subSegment?.name || '')}</td>
                            <td>{capitalizeString(workSegments?.subSegment?.name || '')}</td>
                            <td>{capitalizeString(schoolSegments?.subSegment?.name || '')}</td>
                        </tr>
                    </tbody>
                </Table>
            </Card.Body>}
            
        </Card>
    );
};