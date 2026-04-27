/** 
 * SubGroupMembersTable.tsx
 * 
 * Displays a table of members in a selected subgroup, allowing subgroup managers to
 * view member information and perform management actions such as removing users.
 * 
 * */ 

import { useEffect, useState } from 'react';
import { Table, Card, Dropdown, Row, Col, Modal, Button } from 'react-bootstrap';

// Types
import type { ISubGroupMember } from 'src/types/subgroup.types';

// Utility functions 
import { formatDateString } from '@lib/utils';

// API
import { removeUserFromSubGroup } from 'src/lib/api/subgroup.routes';

interface SubGroupMembersTableProps {
    token: string;
    subGroupId: string;
    subGroupName: string;
    members: ISubGroupMember[];
    refetchMembers: () => void;
}

export const SubGroupMembersTable: React.FC<SubGroupMembersTableProps> = ({
    token,
    subGroupId,
    subGroupName,
    members,
    refetchMembers
}) => {
    // Define table fields
    const fields: string[] = [
        'Email',
        'Organization',
        'First',
        'Last',
        'User Type',
        'Joined At',
        'Controls'
    ];

    // State for current members
    const [currentMembers, setCurrentMembers] = useState<ISubGroupMember[]>(members);

    // Confirmation modal state
    const [ showConfirmationModal, setShowConfirmationModal ] = useState<boolean>(false);
    const [ userToRemove, setUserToRemove ] = useState<ISubGroupMember| null>(null);

    // Notification modal state
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    // Function to handle opening the confirmation modal
    const confirmRemoveUser = (user: ISubGroupMember) => {
        setUserToRemove(user);
        setShowConfirmationModal(true);
    };

    // Effect to update current members when props change
    useEffect(() => {
        setCurrentMembers(members);
    }, [members]);

    // Function to handle removing a user from the subgroup
    const handleRemoveUser = async (userId: string) => {
        try {
            await removeUserFromSubGroup(token, subGroupId, userId);
            setModalMessage(`User removed from subgroup: ${subGroupName}`);
            setShowModal(true);
            await refetchMembers(); 
        } catch (error) {
            console.error('Error removing user from subgroup:', error);
            setModalMessage('Failed to remove user from subgroup. Please try again later.');
            setShowModal(true);
        }
    };

    return (
        <Row>
            <Col>
                <Card>
                    <Card.Header className='text-capitalize'>
                        Members of {subGroupName} 
                    </Card.Header>
                    <Card.Body>
                        <div className='table-responsive-lg'>
                            {members && members.length > 0 ? (
                                <Table bordered hover size='sm'>
                                    <thead>
                                        <tr>
                                            {fields.map((field, index) => (
                                                <th key={index}>{field}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentMembers.map((user, index) => (
                                            <tr key={index}>
                                                <td>{user.user.email}</td>
                                                <td>{user.user.organizationName || 'N/A'}</td>
                                                <td>{user.user.fname || 'N/A'}</td>
                                                <td>{user.user.lname || 'N/A'}</td>
                                                <td>{user.user.userType || 'N/A'}</td>
                                                <td>{formatDateString(user.updatedAt, false)}</td>
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
                                                        
                                                        {/* Dropdown menu for user actions */}
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                onClick={() => confirmRemoveUser(user)}
                                                                className='text-danger'
                                                            >
                                                                Remove User
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className='p-4 mb-4 bg-light rounded text-center text-muted'>
                                    <h5>No Members Available</h5>
                                    <p className='mb-0'>Add users to populate this subgroup</p>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Confirmation Modal */}
                <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Removal</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to remove <strong>{userToRemove?.user.email}</strong> from <strong>{subGroupName}?</strong></p> 
                        <p>This action cannot be undone</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => setShowConfirmationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant='danger'
                            onClick={async () => {
                                if (userToRemove) {
                                    await handleRemoveUser(userToRemove.user.id);
                                    setShowConfirmationModal(false);
                                }
                            }}
                        >
                            Remove User
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Notification Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Notification</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{modalMessage}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => setShowModal(false)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Col>
        </Row>
    );
};