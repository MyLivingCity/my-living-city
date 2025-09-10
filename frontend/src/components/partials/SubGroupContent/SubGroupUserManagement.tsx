/** 
 * SubGroupManagementContent.tsx
 * 
 * Displays a user management card for subgroups with filters and user controls
 * Includes filtering by email, organization, first name and last name.
 * Allows adding users to the subgroup by calling the addUserToSubGroup API.
*/

import React, { useContext, useState } from 'react';
import { Form, Table, Row, Col, Card, Button, Dropdown, Modal} from 'react-bootstrap';

// Types
import { IUser } from 'src/lib/types/data/user.type';

// API
import { addUserToSubGroup } from 'src/lib/api/subGroupRoutes';

interface SubGroupManagementContentProps {
    user : IUser | null;
    token: string | null;
    users: IUser[] | undefined;
    subGroupId: string;
    refetchUsersInSubGroup: () => void;
}

const SubGroupManagementContent: React.FC<SubGroupManagementContentProps> = ({
    user,
    token,
    users = [], 
    subGroupId,
    refetchUsersInSubGroup
}) => {

    // Filter States
    const [emailFilter, setEmailFilter] = useState<string>('');
    const [organizationFilter, setOrganizationFilter] = useState<string>('');
    const [firstNameFilter, setFirstNameFilter] = useState<string>('');
    const [lastNameFilter, setLastNameFilter] = useState<string>('');

    // Toggle display of requests table
    const [showReq, setShowReq] = useState(false);

    // Apply filtering to the users list
    const filteredUsersList = users.filter((u) => {
        const emailMatch = u.email.toLowerCase().includes(emailFilter.toLowerCase());
        const orgMatch = u.organizationName?.toLowerCase().includes(organizationFilter.toLowerCase());
        const firstNameMatch = u.fname?.toLowerCase().includes(firstNameFilter.toLowerCase());
        const lastNameMatch = u.lname?.toLowerCase().includes(lastNameFilter.toLowerCase());

        return emailMatch && orgMatch && firstNameMatch && lastNameMatch;
    });

    // Modal state for confirmation dialog
    const [ showModal, setShowModal ] = useState<boolean>(false);
    const [ modalMessage, setModalMessage ] = useState<string>(''); 

    const handleAddUser = async (userId: string) => {
        try {
            if (!token || !subGroupId) {
                setModalMessage('Missing token or subgroup ID');
                setShowModal(true);
                return;
            }
            
            const res = await addUserToSubGroup(token, subGroupId, userId);
            setModalMessage(`User ${res.email} added successfully to subgroup: ${res.subGroupName}`);
            setShowModal(true);

            await refetchUsersInSubGroup(); 
        } catch (error) {
            console.error('Error adding user:', error);
            setModalMessage('Failed to add user. Please try again.');
            setShowModal(true);
        };
    };

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
                    {showReq ? 'Hide Users' : 'View Users'}
                </Button>
            </Card.Header> 

            {showReq && (
                <Card.Body>
                    <Form>
                        {/* Filter Inputs */}
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
                                        <th>Email</th>
                                        <th>Organization</th>
                                        <th>First</th>
                                        <th>Last</th>
                                        <th>User Type</th>
                                        <th>Controls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsersList.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.email}</td>
                                            <td>{user.organizationName || 'N/A'}</td>
                                            <td>{user.fname || 'N/A'}</td>
                                            <td>{user.lname || 'N/A'}</td>
                                            <td>{user.userType || 'N/A'}</td>
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
                                                        <Dropdown.Item onClick={() => handleAddUser(user.id)}>
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
            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Notification</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer className='d-flex justify-content-center'>
                    <Button variant='secondary' onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default SubGroupManagementContent;