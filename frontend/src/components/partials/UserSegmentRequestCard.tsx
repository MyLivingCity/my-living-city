import React, { useState } from 'react'
import {Button, Card, Table} from 'react-bootstrap';
import { deleteUserSegmentById } from 'src/lib/api/userSegmentRequestRoutes';
import { ISegmentRequest } from 'src/lib/types/data/segment.type';
import { capitalizeFirstLetterEachWord } from 'src/lib/utilityFunctions';
interface UserSegmentCardRequestProps {
    segReq: ISegmentRequest[] | undefined;
    token: string;
}

export const UserSegmentRequestCard: React.FC<UserSegmentCardRequestProps> = ({segReq, token}) => {

    const [showReq, setShowReq] = useState(false);
    const [update, setUpdate] = useState(false);
        return (
        <Card>
            <Card.Header>Segment and SubSegment Requests<Button onClick={()=>{setShowReq(b=>!b)}}className="float-right" size="sm">{showReq ? 'Hide Requests': 'View Requests'}</Button></Card.Header>
            {showReq && 
            <Card.Body>
            <Table bordered hover>
            <thead>
                <tr>
                <th scope="col">Segment Name</th>
                <th scope="col">Sub-Segment Name</th>
                <th scope="col">Country</th>
                <th scope="col">Province</th>
                <th scope="col">Controls</th>
                </tr>
            </thead>
            <tbody>
            {segReq?.map((req: ISegmentRequest, index: number) => (
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
                ))}
            </tbody>
            </Table>
            </Card.Body>}
            
        </Card>
        );
}