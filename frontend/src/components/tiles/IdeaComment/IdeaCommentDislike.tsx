import { useContext } from 'react'
import { FaRegThumbsDown } from 'react-icons/fa'
import { IconContext } from 'react-icons/lib';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { useCommentDislikeMutation } from 'src/hooks/commentInteractionHooks';
import { MLC_COLOUR_THEME } from 'src/lib/constants';
import { IComment } from '../../../lib/types/data/comment.type';

interface IdeaCommentLikeProps {
  commentData: IComment
}

const IdeaCommentDislike = ({ commentData }: IdeaCommentLikeProps) => {
  const { 
    id: commentId, 
    ideaId,
    dislikes
  } = commentData;

  const { token, isUserAuthenticated } = useContext(UserProfileContext);

  const {
    submitDislikeMutation,
    isLoading,
    isError,
    error
  } = useCommentDislikeMutation(commentId, ideaId, token);

  const checkIfUserHasDisliked = (): boolean => {
    return 0 < dislikes.length
  }

  const submitHandler = () => {
    // Check if user is authenticated
    if (isUserAuthenticated()) {
      submitDislikeMutation();
    } else {
      alert('You must be signed in to interact with comments')
    }

  }


  return (
    // TODO: Implement logic to like a comment
    <IconContext.Provider
      value={{
        size: '1.2rem',
        color: isUserAuthenticated() && checkIfUserHasDisliked() ? MLC_COLOUR_THEME.redWarning : '',
      }}
    >
      <div className="d-flex flex-row fs-12 p-2">
        <div
          className="like p-2"
          onClick={submitHandler}
        >
          <FaRegThumbsDown />
          <span className="ml-1">Dislike</span>
        </div>
      </div>
    </IconContext.Provider>
  );
}

export default IdeaCommentDislike