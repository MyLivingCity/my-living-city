import React, { useState, useEffect } from 'react';
import { Button, Container,  Modal, Row, ListGroup } from 'react-bootstrap';
import IdeaCommentTile from 'src/components/tiles/IdeaComment/IdeaCommentTile';
import { getUserBanWithToken } from '../../../lib/api/banRoutes';
import { ICreateCommentInput } from 'src/lib/types/input/createComment.input';
import { IComment } from '../../../lib/types/data/comment.type';
import { TEXT_INPUT_LIMIT } from 'src/lib/constants';
import { checkSimilarComments } from '../../../lib/api/commentRoutes';

interface CommentSubmitModalProps {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  shouldButtonBeDisabled: () => boolean;
  buttonTextOutput: () => string;
  submitComment: (newComment: ICreateCommentInput) => void;
  show: boolean;
  comments?: IComment[];
  banned?: boolean;
  token: string | null;
  setShowCommentSubmitError: any;
  ideaId: number;
}

const CommentSubmitModal = ({
    setShow,
    shouldButtonBeDisabled,
    setShowCommentSubmitError,
    buttonTextOutput,
    submitComment,
    show,
    comments,
    banned,
    token,
    ideaId,
}: CommentSubmitModalProps) => {
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSimilarComments, setShowSimilarComments] = useState(false);
    const [similarCommentsData, setSimilarCommentsData] = useState<IComment[]>([]);

    const handleClose = () => { 
        setShow(false);
        setCommentText('');
        setShowSimilarComments(false);
    };
    useEffect(() => {
        if(!show) {
            setCommentText('');
            setShowSimilarComments(false);
            setSimilarCommentsData([]);
        }
    }, [show]);
    
    const submitHandler = async (values: ICreateCommentInput) => {
        const banDetails = await getUserBanWithToken(token);
        let isBanned = true;
        if (!banned || !banDetails || banDetails.banType === 'WARNING') {
            isBanned = false;
        }
        setError(null);
        try {
            if (isBanned === true) {
                setShowCommentSubmitError(true);
                setError('You are banned');
                alert('You are banned!');
                throw error;
            }
            const similarCommentsResult = await checkSimilarComments(ideaId, token, commentText);
            if (similarCommentsResult.similarComments.length > 0) {
                setSimilarCommentsData(similarCommentsResult.similarComments);
                setShowSimilarComments(true);
            } else {
                submitComment(values);
                setCommentText('');
                handleClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size='lg'
            animation={false}
        >
            <Modal.Header closeButton>
                <Container>
                    <Row className='justify-content-center'>
                        <Modal.Title>
                            {showSimilarComments ? 'Similar Comments Found' : 'Submit Comment'}
                        </Modal.Title>
                    </Row>
                    <Row className='text-center'>
                        <p>
                            { showSimilarComments
                                ? 'We found the following similar comments. Consider liking the comment that is most similar to yours or try writing a new comment.'
                                : 'Add your voice to the conversation.'
                            }
                        </p>
                    </Row>
                </Container>
            </Modal.Header>
            {showSimilarComments && similarCommentsData.length > 0 && (
                <Modal.Body>
                    <div>
                        <ListGroup>
                            {similarCommentsData.map((comment: IComment) => (
                                <ListGroup.Item key={comment.id}>
                                    <IdeaCommentTile commentData={comment} />
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Modal.Body>
            )}
            <Modal.Footer className='d-flex flex-column'>
                <textarea
                    className='w-100'
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={TEXT_INPUT_LIMIT.COMMENT}
                />
                <p className='align-self-end'>{`${commentText.length}/${TEXT_INPUT_LIMIT.COMMENT}`}</p>
                <div className='w-100 d-flex justify-content-end'>
                    <Button className='mr-3' variant='secondary' onClick={handleClose}>
            Close
                    </Button>
                    <Button
                        variant='primary'
                        disabled={shouldButtonBeDisabled()}
                        onClick={() => submitHandler({ content: commentText })}
                    >
                        {buttonTextOutput()}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default CommentSubmitModal;
