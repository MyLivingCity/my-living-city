import React, { useState } from 'react';
import { Button, Container, Form, Modal, Row } from 'react-bootstrap';
import { IUser } from 'src/lib/types/data/user.type';
import { useFormik } from 'formik';
import { IBanUserInput } from 'src/lib/types/input/banUser.input';
import { postCreateUserBan } from 'src/lib/api/banRoutes';
import { updateUser } from 'src/lib/api/userRoutes';
import { BAN_USER_TYPES } from 'src/lib/constants';

interface BanModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    modalUser: IUser;
    currentUser: IUser;
    token: string | null
};

interface FeedbackModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    message: string;
}

export const UserManagementBanModal = ({
    setShow,
    show,
    modalUser,
    currentUser,
    token
}: BanModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleClose = () => setShow(false);
    const submitHandler = async (values: IBanUserInput) => {
        try {
            setIsSubmitting(true);
            modalUser.banned = true;
            // POST to database
            const banInputValues: IBanUserInput = {
                userId: values.userId,
                banType: values.banType,
                banDuration: values.banDuration,
                banReason: values.banReason,
                banMessage: values.banMessage,
            };
            await postCreateUserBan(banInputValues, token);
            await updateUser(modalUser, token, currentUser);
            handleClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formik = useFormik<IBanUserInput>({
        initialValues: {
            userId: modalUser.id,
            banType: BAN_USER_TYPES.WARNING,
            banDuration: 0,
            banReason: '',
            banMessage: '',
        },
        onSubmit: submitHandler
    });

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
                            <Modal.Title>Ban User: {modalUser.email}</Modal.Title>
                        </Row>
                        <Row className='text-center'>
                        </Row>
                    </Container>
                </Modal.Header>
                <Form onSubmit={formik.handleSubmit}>
                    <Modal.Body>
                        <Form.Label>
                            Ban Type
                        </Form.Label>
                        <Form.Control
                            as='select'
                            name='banType'
                            onChange={formik.handleChange}
                            value={formik.values.banType}
                        >
                            <option value={BAN_USER_TYPES.WARNING}>Warning</option>
                            <option value={BAN_USER_TYPES.POST_BAN}>Post Ban</option>
                            <option value={BAN_USER_TYPES.SYS_BAN}>System Ban</option>
                        </Form.Control>
                        <br />
                        <Form.Label>
                            Ban Duration
                        </Form.Label>
                        <Form.Control
                            as='select'
                            name='banDuration'
                            onChange={formik.handleChange}
                            value={formik.values.banDuration}
                            required
                        >
                            <option selected value=''>Select Ban Duration...</option>
                            <option value={7}>7 Days</option>
                            <option value={14}>14 Days</option>
                            <option value={30}>30 Days</option>
                            <option value={60}>60 Days</option>
                            <option value={90}>3 Months</option>
                            <option value={180}>6 Months</option>
                            <option value={365}>1 Year</option>
                            <option value={99999}>Indefinitely</option>
                        </Form.Control>
                        <br />
                        <Form.Label>
                            Ban Reason
                        </Form.Label>
                        <Form.Control
                            as='select'
                            name='banReason'
                            onChange={formik.handleChange}
                            value={formik.values.banReason}
                            required
                        >
                            <option selected value=''>Select Ban Reason...</option>
                            <option>Abuse of flagging privileges</option>
                            <option>Posting abuse or non-conforming content</option>
                            <option>Breach of user agreement</option>
                            <option>Incomplete Submission</option>
                            <option>Off Topic</option>
                            <option>Other</option>
                        </Form.Control>
                        <br />
                        <Form.Label>Ban Additional Details</Form.Label>
                        <Form.Control
                            as='textarea'
                            rows={5}
                            name='banMessage'
                            placeholder='Additional Details for Ban'
                            onChange={formik.handleChange}
                            value={formik.values.banMessage}
                            required
                        />
                    </Modal.Body>
                    <Modal.Footer className='d-flex flex-column'>
                        <div className='w-100 d-flex justify-content-end'>
                            <Button
                                className='mr-3'
                                type='submit'
                                disabled={isSubmitting ? true : false}
                            >Ban
                            </Button>
                            <Button
                                className='mr-3'
                                variant='secondary'
                                onClick={handleClose}
                            >Cancel
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};
