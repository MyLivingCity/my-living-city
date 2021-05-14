import { useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { IComment } from '../../../lib/types/data/comment.type';
import { timeDifference } from '../../../lib/utilityFunctions';
import IdeaCommentDislike from './IdeaCommentDislike';
import IdeaCommentLike from './IdeaCommentLike';

interface IdeaCommentTileProps {
  commentData: IComment;
}

const IdeaCommentTile = ({ commentData }: IdeaCommentTileProps) => {
  const { isUserAuthenticated } = useContext(UserProfileContext);
  const {
    id,
    ideaId,
    authorId,
    content,
    createdAt,
    updatedAt,
    _count: {
      likes,
      dislikes
    }
  } = commentData;

  const { email, fname, lname, address } = commentData?.author;

  return (
    <Container fluid className='my-1'>
      <Row className='justify-content-center'>
        <Col className='mx-2'>
          <div className="d-flex flex-column justify-content-start">
            <span className="name d-block font-weight-bold">{fname}@{address.streetAddress}</span>
            <span className="date text-black-50">
              Shared publicly - {timeDifference(new Date(), new Date(createdAt))}
            </span>
          </div>
          <div className="mt-2">
            {content}
          </div>
          <div>
            Likes and Dislikes: {likes} / {dislikes}
          </div>
          {isUserAuthenticated() && (
            <div className='d-flex'>
              <IdeaCommentLike commentData={commentData} />
              <IdeaCommentDislike commentData={commentData} />
            </div>
          )}
        </Col>
      </Row>
      <hr className="bg-primary" />
    </Container>
  );
}

export default IdeaCommentTile