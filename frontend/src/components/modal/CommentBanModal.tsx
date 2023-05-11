import React, { useState } from 'react'
import { Button, Container, Form, Modal, Row, Col } from 'react-bootstrap';
import { IComment } from 'src/lib/types/data/comment.type';
import { useFormik } from "formik";
import { IBanCommentInput } from 'src/lib/types/input/banComment.input';
import { postCreateCommentBan } from 'src/lib/api/banRoutes';
import { updateCommentStatus } from 'src/lib/api/commentRoutes';

interface BanModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    comment: IComment;
    postLink: string;
    authorName: string;
    token: string | null
};

interface FeedbackModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    message: string;
}

export const CommentBanModal = ({
    setShow,
    show,
    comment,
    postLink,
    authorName,
    token
}: BanModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleClose = () => setShow(false);
    const submitHandler = async (values: IBanCommentInput) => {
        try {
            setIsSubmitting(true);
            // POST to database
            comment.bannedComment = true;
            comment.active = false;
            comment.reviewed = true;
            const banCommentInputValues: IBanCommentInput = {
                commentId: values.commentId,
                authorId: values.authorId,
                banReason: values.banReason,
                banMessage: values.banMessage,
            }
            await postCreateCommentBan(banCommentInputValues, token);
            await updateCommentStatus(token, comment.id.toString(), comment.active, comment.reviewed, comment.bannedComment, comment.quarantined_at);
            handleClose();
        } catch (error) {
            console.log(error)
        } finally {
            setIsSubmitting(false);
        }
    }

    const formik = useFormik<IBanCommentInput>({
        initialValues: {
            commentId: comment.id,
            authorId: comment.authorId,
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
                            <Modal.Title>Ban Comment</Modal.Title>
                        </Row>
                        <Row className='text-center'>
                        </Row>
                    </Container>
                </Modal.Header>
                <Form onSubmit={formik.handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={"auto"}>
                                <b>Comment Parent Post Link:</b> {<a href={postLink} target="_blank">Link</a>}
                            </Col>
                        </Row>
                        <Row>
                            <Col md={"auto"}>
                                <b>Comment Content:</b> {comment.content}
                            </Col>
                        </Row>
                        <Row>
                            <Col md={"auto"}>
                                <b>Comment Author Name:</b> {authorName}
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
