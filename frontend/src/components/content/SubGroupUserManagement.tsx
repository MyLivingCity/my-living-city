import React, { useContext, useState } from 'react';
import { Form, Table, Row, Col, Card, Button, Dropdown} from 'react-bootstrap';
import { IUser } from 'src/lib/types/data/user.type';

// interface IUser {
//     email: string;
//     organization?: string;
//     firstName?: string;
//     lastName?: string;
//     userType?: string;
//     homeSegment?: string;
//     schoolSegment?: string;
//     workSegment?: string;
// }

// const dummyUsers: IUser[] = [
//     {
//         email: 'julia.green@example.com',
//         organization: 'EcoFuture Org',
//         firstName: 'Julia',
//         lastName: 'Green',
//         userType: 'Educator',
//         homeSegment: 'Downtown',
//         schoolSegment: 'Sustainability School',
//         workSegment: 'Environmental Initiatives'
//     },
//     {
//         email: 'sam.tech@example.com',
//         organization: 'RemoteTech',
//         firstName: 'Sam',
//         lastName: 'Techman',
//         userType: 'Developer',
//         homeSegment: 'Uptown',
//         schoolSegment: 'Tech High',
//         workSegment: 'Engineering Hub'
//     },
//     {
//         email: 'lee.urban@example.com',
//         organization: 'CityBuild',
//         firstName: 'Lee',
//         lastName: 'Urban',
//         userType: 'Planner',
//         homeSegment: 'East Side',
//         schoolSegment: 'Urban Academy',
//         workSegment: 'Municipal Office'
//     }
// ];

interface SubGroupManagementContentProps {
    users: IUser[] | undefined;
    token: string | null;
    user : IUser | null;
}

const SubGroupManagementContent: React.FC<SubGroupManagementContentProps> = ({
    users = [], 
    token,
    user,
}) => {

    // Filter States
    const [emailFilter, setEmailFilter] = useState<string>('');
    const [organizationFilter, setOrganizationFilter] = useState<string>('');
    const [firstNameFilter, setFirstNameFilter] = useState<string>('');
    const [lastNameFilter, setLastNameFilter] = useState<string>('');

    // Apply filtering to the users list
    const filteredUsersList = users.filter((u) => {
        const emailMatch = u.email.toLowerCase().includes(emailFilter.toLowerCase());
        const orgMatch = u.organizationName?.toLowerCase().includes(organizationFilter.toLowerCase());
        const firstNameMatch = u.fname?.toLowerCase().includes(firstNameFilter.toLowerCase());
        const lastNameMatch = u.lname?.toLowerCase().includes(lastNameFilter.toLowerCase());

        return emailMatch && orgMatch && firstNameMatch && lastNameMatch;
    });

    // State for showing requests and updating
    const [showReq, setShowReq] = useState(false);
    const [update, setUpdate] = useState(false);

    console.log(users);

    return (
        <Card>
            <Card.Header>
                SubGroup User Management
                <Button
                    onClick={() => {
                        setShowReq((b) => !b);
                    }}
                    className='float-right'
                    size='sm'
                >
                    {showReq ? 'Hide Requests' : 'View Requests'}
                </Button>
            </Card.Header> 

            {showReq && (
                <Card.Body>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label className='fw-bold'>Filter Users</Form.Label>
                                    <Row>
                                        {/* Email Filter */}
                                        <Col>
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type='email'
                                                onChange={(e) => setEmailFilter(e.target.value)}
                                                placeholder='Filter email'
                                                size='sm'
                                            />
                                        </Col>

                                        {/* Organization Filter */}
                                        <Col>
                                            <Form.Label>Organization</Form.Label>
                                            <Form.Control
                                                type='text'
                                                onChange={(e) => setOrganizationFilter(e.target.value)}
                                                placeholder='Filter organization'
                                                size='sm'
                                            />
                                        </Col>
                                    </Row>

                                    <Row className='mt-3'>
                                        {/* First Name Filter */}
                                        <Col>
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                type='text'
                                                onChange={(e) => setFirstNameFilter(e.target.value)}
                                                placeholder='Filter first name'
                                                size='sm'
                                            />
                                        </Col>

                                        {/* Last Name Filter */}
                                        <Col>
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                type='text'
                                                onChange={(e) => setLastNameFilter(e.target.value)}
                                                placeholder='Filter last name'
                                                size='sm'
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Table for users */}
                        <div className='table-responsive-lg mt-3'>
                            <Table bordered hover size='sm' className='mt-4'>
                                <thead>
                                    <tr>
                                        <th scope='col' className='text-center align-middle'>Email</th>
                                        <th scope='col' className='text-center align-middle'>Organization</th>
                                        <th scope='col' className='text-center align-middle'>First</th>
                                        <th scope='col' className='text-center align-middle'>Last</th>
                                        <th scope='col' className='text-center align-middle'>User Type</th>
                                        <th scope='col' className='text-center align-middle'>Controls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsersList.map((user, index) => (
                                        <tr key={index}>
                                            <td className='text-start align-middle'>{user.email}</td>
                                            <td className='text-center align-middle'>{user.organizationName || 'N/A'}</td>
                                            <td className='text-center align-middle'>{user.fname || 'N/A'}</td>
                                            <td className='text-center align-middle'>{user.lname || 'N/A'}</td>
                                            <td className='text-center align-middle'>{user.userType || 'N/A'}</td>
                                            <td className='text-center align-middle'>
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
                                                        <Dropdown.Item onClick={() => alert('User Added')}>
                                                            Add User
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Form>
                </Card.Body>
            )}
        </Card>
    );
};

export default SubGroupManagementContent;