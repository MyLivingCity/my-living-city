/** 
 * SubGroupRequestCard.tsx
 * 
 * Display subgroups join requests and rejected requests in collapsible tables,
 * with controls for approving, rejecting, or removing users rejected from the subgroup.
*/

import React, { useState } from 'react';
import { Button, Card, Table, Dropdown, Modal } from 'react-bootstrap';

// Types
import type { ISubGroupMember } from 'src/types/subgroup.types';

// Utility functions 
import { formatDateString } from 'src/lib/utils';

// API
import { updateUserRequestStatusInSubGroup, removeRejectedUserRequestFromSubGroup } from 'src/lib/api/subgroup.routes';

interface UserSubGroupCardRequestProps {
    token: string;
    subGroupId: string;
    joinRequests: ISubGroupMember[] | undefined;
    rejectedUsers: ISubGroupMember[] | undefined;
    refetchUsersInSubGroup: () => void; 
}

export const UserSubGroupRequestCard: React.FC<UserSubGroupCardRequestProps> = ({
    token,
    subGroupId,
    joinRequests,
    rejectedUsers,
    refetchUsersInSubGroup,
}) => {
    // Toggle visibility of requests tables
    const [showReq, setShowReq] = useState(false);

    // Modal state for confirmation dialog
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    const handleRequestAction = async (userId: string, action: 'APPROVED' | 'REJECTED') => {
        try {
            await updateUserRequestStatusInSubGroup(token, subGroupId, userId, action);
            setModalMessage(`User request ${action.toLowerCase()} successfully`);
            setShowModal(true);
            refetchUsersInSubGroup(); 
        } catch (error) {
            console.error('Error updating user request status:', error);
            setModalMessage(`Failed to ${action.toLowerCase()} user request`);
            setShowModal(true);
        };
    };

    const handleRemoveRejectedUser = async (userId: string) => {
        try {
            await removeRejectedUserRequestFromSubGroup(token, subGroupId, userId);
            setModalMessage('Rejected user request removed successfully');
            setShowModal(true);
            refetchUsersInSubGroup();
        } catch (error) {
            console.error('Error removing rejected user request:', error);
            setModalMessage('Failed to remove rejected user request');
            setShowModal(true); 
        };
    };

    const pendingFields = [
        'Email',
        'Organization',
        'First Name',
        'Last Name',
        'User Type',
        'Requested At',
        'Actions'
    ];

    const rejectedFields = [
        'Email',
        'Organization',
        'First Name',
        'Last Name',
        'User Type',
        'Rejected At',
        'Actions'
    ];

    return (
        <Card>
            <Card.Header>
                SubGroup Requests
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
                    {/* Pending Requests Table */}
                    <div className='table-responsive-lg'>
                        <h6>Pending Requests</h6>
                        {joinRequests && joinRequests.length > 0 ? (
                            <Table bordered hover size='sm'>
                                <thead>
                                    <tr>
                                        {pendingFields.map((field, index) => (
                                            <th key={index}>{field}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {joinRequests?.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.user.email}</td>
                                            <td>{user.user.organizationName}</td>
                                            <td>{user.user.fname}</td>
                                            <td>{user.user.lname}</td>
                                            <td>{user.user.userType}</td>
                                            <td>{formatDateString(user.joinedAt, false)}</td>
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
                                                            onClick={() => handleRequestAction(user.user.id, 'APPROVED')}
                                                        >
                                                            Approve
                                                        </Dropdown.Item>
                                                        <Dropdown.Item 
                                                            className='text-danger'
                                                            onClick={() => handleRequestAction(user.user.id, 'REJECTED')}
                                                        >
                                                            Reject
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className='text-muted'>No pending requests available</p>
                        )}
                    </div>

                    {/* Rejected Requests Table */}
                    <div className='table-responsive-lg mt-4'>
                        <h6>Rejected Requests</h6>
                        {rejectedUsers && rejectedUsers.length > 0 ? (
                            <Table bordered hover size='sm'>
                                <thead>
                                    <tr>
                                        {rejectedFields.map((field, index) => (
                                            <th key={index}>{field}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rejectedUsers?.map((user, index) => (
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

                                                    <Dropdown.Menu>
                                                        <Dropdown.Item 
                                                            className='text-danger'
                                                            onClick={() => handleRemoveRejectedUser(user.user.id)}
                                                        >
                                                            Remove
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className='text-muted'>No rejected requests available</p>
                        )}
                    </div>
                </Card.Body>
            )}

            {/* Modal for notifications */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title >Notification</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};