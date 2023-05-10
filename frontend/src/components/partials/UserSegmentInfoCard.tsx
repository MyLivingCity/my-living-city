import React, { useEffect, useState } from 'react'
import { Button, Card, Table } from 'react-bootstrap';
import { getMyUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { capitalizeString } from 'src/lib/utilityFunctions';
import { IUserSegment } from './../../lib/types/input/register.input';

interface UserSegmentInfoCardProps {
    email: string;
    id: string;
    token: string | null;
}

export const UserSegmentInfoCard: React.FC<UserSegmentInfoCardProps> = ({email, id, token}) => {
    const [showReq, setShowReq] = useState(false);
    const [update, setUpdate] = useState(false);
    const [userSegment, setUserSegment] = useState<IUserSegment | null>();
    useEffect(()=>{
        async function fetchData() {
            const response = await getMyUserSegmentInfo(token!, id);
            if(response) {
                setUserSegment(response);
            }else{
                setUserSegment(null);
            } 
        }
        fetchData();
    },[id, token])
        return (

        <Card>
            <Card.Header>{capitalizeString(email)}'s Segment Info<Button onClick={()=>{setShowReq(b=>!b)}}className="float-right" size="sm">{showReq ? "Hide Details": "View Details"}</Button></Card.Header>
            {showReq && 
            <Card.Body>
            <Table bordered hover>
            <thead>
                <tr>
                <th scope="col">Home Segment</th>
                <th scope="col">Work Segment</th>
                <th scope="col">School Segment</th>
                <th scope="col">Home Sub-Segment</th>
                <th scope="col">Work Sub-Segment</th>
                <th scope="col">School Sub-Segment</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{userSegment ? userSegment.homeSegmentName : ''}</td>
                    <td>{userSegment ? userSegment.workSegmentName : ''}</td>
                    <td>{userSegment ? userSegment.schoolSegmentName : ''}</td>
                    <td>{userSegment ? userSegment.homeSubSegmentName : ''}</td>
                    <td>{userSegment ? userSegment.workSubSegmentName : ''}</td>
                    <td>{userSegment ? userSegment.schoolSubSegmentName : ''}</td>
                </tr>
            {/* {segReq?.map((req: ISegmentRequest, index: number) => (
                <tr key={req.id}>
                    <td>{req.segmentName ? capitalizeFirstLetterEachWord(req.segmentName) : ''}</td>
                    <td>{req.subSegmentName ? capitalizeFirstLetterEachWord(req.subSegmentName) : ''}</td>
                    <td>{req.country}</td>
                    <td>{req.province}</td>
                    <td><Button size="sm" variant="outline-danger" onClick={()=>{
                        deleteUserSegmentById(String(req.id), token);
                        segReq.splice(index,1);
                        setUpdate(b=>!b);
                    }}>Delete</Button></td>
                </tr>
                ))} */}
            </tbody>
            </Table>
            </Card.Body>}
            
        </Card>
        );
}