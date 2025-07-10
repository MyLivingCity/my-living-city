import React, { useState } from 'react';
import { Button, Card, Table, Dropdown } from 'react-bootstrap';
import { deleteUserSegmentById } from 'src/lib/api/userSegmentRequestRoutes';
import { ISegmentRequest } from 'src/lib/types/data/segment.type';
import { capitalizeFirstLetterEachWord } from 'src/lib/utilityFunctions';

interface UserSubGroupCardRequestProps {
    segReq: ISegmentRequest[] | undefined;
    token: string;
}

export const UserSubGroupRequestCard: React.FC<UserSubGroupCardRequestProps> = ({
    segReq,
    token,
}) => {
    const [showReq, setShowReq] = useState(false);
    const [update, setUpdate] = useState(false);

    return (
        <Card>
            <Card.Header>
                SubGroup Joining Requests
                <Button
                    onClick={() => { setShowReq((b) => !b); }}
                    className='float-right'
                    size='sm'
                >
                    {showReq ? 'Hide Requests' : 'View Requests'}
                </Button>
            </Card.Header>

            {showReq && (
                <Card.Body>
                    <div className='table-responsive-lg'>
                        <Table bordered hover size='sm'>
                            <thead>
                                <tr>
                                    <th scope='col'>Email</th>
                                    <th scope='col'>Organization</th>
                                    <th scope='col'>First</th>
                                    <th scope='col'>Last</th>
                                    <th scope='col'>User Type</th>
                                    <th scope='col'>Home Segment</th>
                                    <th scope='col'>School Segment</th>
                                    <th scope='col'>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>test@example.com</td>
                                    <td>Org A</td>
                                    <td>John</td>
                                    <td>Doe</td>
                                    <td>Educator</td>
                                    <td>Segment A</td>
                                    <td>SubGroup X</td>
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle 
                                                as='a'
                                                style={{
                                                    color: '#396642',
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    padding: 0,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Controls
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item 
                                                    onClick={() => alert('Approved!')}
                                                >
                                                    Approve
                                                </Dropdown.Item>
                                                <Dropdown.Item 
                                                    className='text-danger'
                                                    onClick={() => alert('Rejected!')}
                                                >
                                                    Reject
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            )}
        </Card>
    );
};