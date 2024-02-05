import React, { useState } from 'react';
import { Button, Container,  Modal, Row } from 'react-bootstrap';
import IdeaCommentTile from 'src/components/tiles/IdeaComment/IdeaCommentTile';
import { getUserBanWithToken } from '../../../lib/api/banRoutes';
import { ICreateCommentInput } from 'src/lib/types/input/createComment.input';
import { IComment } from '../../../lib/types/data/comment.type';
import { TEXT_INPUT_LIMIT } from 'src/lib/constants';

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
}: CommentSubmitModalProps) => {
  const handleClose = () => setShow(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
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
      submitComment(values);
      setCommentText('');
    } catch (error) {
      console.log(error);
    } finally {
      handleClose();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      animation={false}
    >
      <Modal.Header closeButton>
        <Container>
          <Row className="justify-content-center">
            <Modal.Title>Top 10 Feedbacks</Modal.Title>
          </Row>
          <Row className="text-center">
            <p>
              Please take a look at top 10 feedbacks. Do you see your opinion
              there? Why not encourage participation instead by liking it?
            </p>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        {comments && comments.length <= 0 ? (
          <p className="text-center">
            There are no Feedback Comments for this idea yet. Try posting one!
          </p>
        ) : null}
        {comments &&
          comments?.map((comment) => (
            <div key={comment.id}>
              <IdeaCommentTile commentData={comment} />
            </div>
          ))}
      </Modal.Body>
      <Modal.Footer className="d-flex flex-column">
        <textarea
          className="w-100"
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          maxLength={TEXT_INPUT_LIMIT.COMMENT}
        />
        <p className="align-self-end">{`${commentText.length}/${TEXT_INPUT_LIMIT.COMMENT}`}</p>
        <div className="w-100 d-flex justify-content-end">
          <Button className="mr-3" variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
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
