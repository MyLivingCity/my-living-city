import React, { useContext } from 'react'
import { FaRegThumbsUp } from 'react-icons/fa'
import { IconContext } from 'react-icons/lib';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { useCommentLikeMutation } from 'src/hooks/commentInteractionHooks';
import { Comment } from '../../../lib/types/data/comment.type';
import { MLC_COLOUR_THEME } from '../../../lib/constants'

interface IdeaCommentLikeProps {
  commentData: Comment
}

const IdeaCommentLike = ({ commentData }: IdeaCommentLikeProps) => {
  const { 
    id: commentId, 
    ideaId,
    likes
  } = commentData;
  const { token } = useContext(UserProfileContext);

  const {
    submitLikeMutation,
    isLoading,
    isError,
    error
  } = useCommentLikeMutation(commentId, ideaId, token);

  const checkIfUserHasLiked = (): boolean => {
    return 0 < likes.length
  }

  return (
    // TODO: Implement logic to like a comment
    <IconContext.Provider
      value={{
        size: '1.2rem',
        color: checkIfUserHasLiked() ? MLC_COLOUR_THEME.mainLight : '',
      }}
    >
    <div className="d-flex flex-row fs-12 p-2">
      <div
        className="like p-2"
        onClick={submitLikeMutation}
      >
        <FaRegThumbsUp />
        <span className="ml-1">Like</span>
      </div>
    </div>
    </IconContext.Provider>
  );
}

export default IdeaCommentLike