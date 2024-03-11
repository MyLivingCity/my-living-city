import React, { useState } from 'react';
import { Button, Container, Card, Modal, Row } from 'react-bootstrap';
import { FindCommentBanDetailsWithStaleTime } from 'src/hooks/banHooks';
import { IComment } from 'src/lib/types/data/comment.type';
import { updateCommentStatus } from 'src/lib/api/commentRoutes';
import { deleteCommentBan } from 'src/lib/api/banRoutes';

interface UnbanModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    comment: IComment;
    token: string | null
};

// interface FeedbackModalProps {
//     setShow: React.Dispatch<React.SetStateAction<boolean>>;
//     show: boolean;
//     message: string;
// }

export const CommentUnbanModal = ({
    setShow,
    show,
    comment,
    token
}: UnbanModalProps) => {
    const { data: modalCommentBanData, isLoading: modalCommentBanIsLoading, isError: modalCommentBanIsError } = FindCommentBanDetailsWithStaleTime(comment.id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleClose = () => setShow(false);
    const unbanComment = async () => {
        try {
            setIsSubmitting(true);
            comment.bannedComment = false;
            comment.reviewed = false;
            updateCommentStatus(token, comment.id.toString(), comment.active, comment.reviewed, comment.bannedComment, comment.quarantined_at);
            deleteCommentBan(comment.id, token);
            handleClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (modalCommentBanIsError) {
        return (
            <div className='wrapper'>
                <p>
                    Error occured while trying to retrieve ban details. Please try again later.
                </p>
            </div>
        );
    }

    if (modalCommentBanIsLoading) {
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
                            <Modal.Title>Unban Comment: {comment.content}</Modal.Title>
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
                            {modalCommentBanData?.banReason}
                        </Card.Body>
                    </Card>
                    <p />
                    <Card>
                        <Card.Body>
                            <h5>Details</h5>
                            <hr />
                            {modalCommentBanData?.banMessage}
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer className='d-flex flex-column'>
                    <div className='w-100 d-flex justify-content-end'>
                        <Button
                            className='mr-3'
                            onClick={unbanComment}
                            disabled={isSubmitting ? true : false}
                        >Unban
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
