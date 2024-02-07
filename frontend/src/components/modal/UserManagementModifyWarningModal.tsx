import React, { useState } from 'react';
import { Button, Container, Card, Modal, Row } from 'react-bootstrap';
import { IUser } from 'src/lib/types/data/user.type';
import { FindBanDetailsWithStaleTime } from 'src/hooks/banHooks';
import { updateUserBan } from 'src/lib/api/banRoutes';
import { updateUser } from 'src/lib/api/userRoutes';

interface ModifyWarningModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    modalUser: IUser;
    currentUser: IUser;
    warnedUserIds: String[];
    token: string | null
};

interface FeedbackModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    message: string;
}

export const UserManagementModifyWarningModal = ({
    setShow,
    show,
    modalUser,
    currentUser,
    warnedUserIds,
    token
}: ModifyWarningModalProps) => {
    const { data: modalUserBanData, error, isLoading, isError } = FindBanDetailsWithStaleTime(modalUser.id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleClose = () => setShow(false);
    const removeWarningUser = async () => {
        try {
            let warnedUserIdIndex = warnedUserIds.indexOf(modalUser.id);
            warnedUserIds.splice(warnedUserIdIndex, 1);
            setIsSubmitting(true);
            // await deleteBan(modalUser.id, token)
            handleClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const banUser = async () => {
        try {
            let warnedUserIdIndex = warnedUserIds.indexOf(modalUser.id);
            warnedUserIds.splice(warnedUserIdIndex, 1);
            setIsSubmitting(true);
            modalUser.banned = true;
            await updateUser(modalUser, token, currentUser);
            await updateUserBan(modalUserBanData!, token);
            handleClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isError) {
        console.log(error);
        return (
            <div className='wrapper'>
                <p>
                    Error occured while trying to retrieve warning details. Please try again later.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <Modal
                show={show}
                size='lg'
                centered>
            </Modal>
        );
    }

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop='static' // Disallow clicking outside of modal to close modal
                centered
                size='lg'
                keyboard={false} // Disallow esc key to close modal
            >
                <Modal.Header closeButton>
                    <Container>
                        <Row className='justify-content-center'>
                            <Modal.Title>Modify Warning for User: {modalUser.email}</Modal.Title>
                        </Row>
                        <Row className='text-center'>
                        </Row>
                    </Container>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>
                            <h5>Reason</h5>
                            <hr />
                            {modalUserBanData?.banReason}
                        </Card.Body>
                    </Card>
                    <p />
                    <Card>
                        <Card.Body>
                            <h5>Details</h5>
                            <hr />
                            {modalUserBanData?.banMessage}
                        </Card.Body>
                    </Card>
                    <p />
                    <Card>
                        <Card.Body>
                            <h5>Warned Until</h5>
                            <hr />
                            {new Date(modalUserBanData!.banUntil).toLocaleString()}
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer className='d-flex flex-column'>
                    <div className='w-100 d-flex justify-content-end'>
                        <Button
                            className='mr-3'
                            variant='danger'
                            onClick={banUser}
                            disabled={isSubmitting ? true : false}
                        >Ban
                        </Button>
                        <Button
                            className='mr-3'
                            variant='warning'
                            onClick={removeWarningUser}
                            disabled={isSubmitting ? true : false}
                        >Remove Warning
                        </Button>
                        <Button
                            className='mr-3'
                            variant='secondary'
                            onClick={handleClose}
                        >Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};
