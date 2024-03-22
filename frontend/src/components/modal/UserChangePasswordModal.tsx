import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface UserChangePasswordModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (newPassword: string) => void;
    modalUser: any;
}
const UserChangePasswordModal: React.FC<UserChangePasswordModalProps> = ({ show, onHide, onSubmit, modalUser  }) => {
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (modalUser) {
            onSubmit(newPassword);
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Change User Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId='newPassword'>
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder='Enter new password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant='primary' type='submit'>
                        Change Password
                    </Button>
                    <Button variant='secondary' onClick={onHide}>
                        Cancel
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UserChangePasswordModal;