import React, { useState } from 'react'
import { Button, Container, Form, Modal, Row, Col } from 'react-bootstrap';
import { IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { useFormik } from "formik";
import { IBanPostInput } from 'src/lib/types/input/banPost.input';
import { postCreatePostBan } from 'src/lib/api/banRoutes';
import { updateIdeaStatus } from 'src/lib/api/ideaRoutes';

interface BanModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    post: IIdeaWithAggregations;
    token: string | null
};

interface FeedbackModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    message: string;
}

export const PostBanModal = ({
    setShow,
    show,
    post,
    token
}: BanModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleClose = () => setShow(false);
    const submitHandler = async (values: IBanPostInput) => {
        try {
            setIsSubmitting(true);
            // POST to database
            post.banned = true;
            post.active = false;
            post.reviewed = true;
            const banPostInputValues: IBanPostInput = {
                postId: values.postId,
                authorId: values.authorId,
                banReason: values.banReason,
                banMessage: values.banMessage,
            }
            await postCreatePostBan(banPostInputValues, token);
            await updateIdeaStatus(token, post.id.toString(), post.active, post.reviewed, post.banned, post.quarantined_at);
            handleClose();
        } catch (error) {
            console.log(error)
        } finally {
            setIsSubmitting(false);
        }
    }

    const formik = useFormik<IBanPostInput>({
        initialValues: {
            postId: post.id,
            authorId: post.authorId,
            banReason: "",
            banMessage: "",
        },
        onSubmit: submitHandler
    });

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static" // Disallow clicking outside of modal to close modal
                centered
                size='lg'
                keyboard={false} // Disallow esc key to close modal
            >
                <Modal.Header closeButton>
                    <Container>
                        <Row className='justify-content-center'>
                            <Modal.Title>Ban Post: {post.title}</Modal.Title>
                        </Row>
                        <Row className='text-center'>
                        </Row>
                    </Container>
                </Modal.Header>
                <Form onSubmit={formik.handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={"auto"}>
                                <b>Post Title: </b>{post.title}
                                <p />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={"auto"}>
                                <b>Post Description: </b>{post.description}
                                <p />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={"auto"}>
                                <b>Post Author Name: </b>{post.firstName}
                                <p />
                            </Col>
                        </Row>
                        <p />
                        <Form.Label>
                            Ban Reason
                        </Form.Label>
                        <Form.Control
                            as="select"
                            name="banReason"
                            onChange={formik.handleChange}
                            value={formik.values.banReason}
                            required
                        >
                            <option selected value=''>Select Ban Reason...</option>
                            <option>Posting abuse or non-conforming content</option>
                            <option>Breach of user agreement</option>
                            <option>Incomplete Submission</option>
                            <option>Off Topic</option>
                            <option>Other</option>
                        </Form.Control>
                        <br />
                        <Form.Label>Ban Details</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            name="banMessage"
                            placeholder="Details for Ban"
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
                                variant="secondary"
                                onClick={handleClose}
                            >Cancel
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}
