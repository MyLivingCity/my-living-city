import React, { useState } from 'react';
import { Button, Container, Card, Modal, Row } from 'react-bootstrap';
import { FindPostBanDetailsWithStaleTime } from 'src/hooks/banHooks';
import { IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { updateIdeaStatus } from 'src/lib/api/ideaRoutes';
import { deletePostBan } from 'src/lib/api/banRoutes';

interface UnbanModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    post: IIdeaWithAggregations;
    token: string | null
};

// interface FeedbackModalProps {
//     setShow: React.Dispatch<React.SetStateAction<boolean>>;
//     show: boolean;
//     message: string;
// }

export const PostUnbanModal = ({
    setShow,
    show,
    post,
    token
}: UnbanModalProps) => {
    const { data: modalPostBanData, isLoading: modalPostBanIsLoading, isError: modalPostBanIsError } = FindPostBanDetailsWithStaleTime(post.id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleClose = () => setShow(false);
    const unbanPost = async () => {
        try {
            setIsSubmitting(true);
            post.banned = false;
            post.reviewed = false;
            updateIdeaStatus(token, post.id.toString(), post.active, post.reviewed, post.banned, post.quarantined_at);
            deletePostBan(post.id, token);
            handleClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (modalPostBanIsError) {
        return (
            <div className='wrapper'>
                <p>
                    Error occured while trying to retrieve ban details. Please try again later.
                </p>
            </div>
        );
    }

    if (modalPostBanIsLoading) {
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
                            <Modal.Title>Unban Post: {post.title}</Modal.Title>
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
                            {modalPostBanData?.banReason}
                        </Card.Body>
                    </Card>
                    <p />
                    <Card>
                        <Card.Body>
                            <h5>Details</h5>
                            <hr />
                            {modalPostBanData?.banMessage}
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer className='d-flex flex-column'>
                    <div className='w-100 d-flex justify-content-end'>
                        <Button
                            className='mr-3'
                            onClick={unbanPost}
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
