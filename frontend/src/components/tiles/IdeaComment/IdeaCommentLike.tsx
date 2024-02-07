import { useContext } from 'react';
import { FaRegThumbsUp } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { useCommentLikeMutation } from 'src/hooks/commentInteractionHooks';
import { IComment } from '../../../lib/types/data/comment.type';
import { MLC_COLOUR_THEME } from '../../../lib/constants';

interface IdeaCommentLikeProps {
  commentData: IComment
}

const IdeaCommentLike = ({ commentData }: IdeaCommentLikeProps) => {
    const { 
        id: commentId, 
        ideaId,
        likes
    } = commentData;
    const { token, isUserAuthenticated } = useContext(UserProfileContext);

    const {
        submitLikeMutation,
        isLoading,
        isError,
        error
    } = useCommentLikeMutation(commentId, ideaId, token);

    const checkIfUserHasLiked = (): boolean => {
        return 0 < likes.length;
    };

    const submitHandler = () => {
        if (isUserAuthenticated()) {
            submitLikeMutation();
        } else {
            alert('You must be signed in to interact with comments');
        }
    };

    return (
    // TODO: Implement logic to like a comment
        <IconContext.Provider
            value={{
                size: '0.7rem',
                color: isUserAuthenticated() && checkIfUserHasLiked() ? MLC_COLOUR_THEME.mainLight : '',
            }}
        >
            <div className='d-flex flex-row fs-12 p-2'>
                <div
                    className='like p-2'
                    onClick={submitHandler}
                >
                    <FaRegThumbsUp />
                    <span className='ml-1' style={{fontSize: '70%'}}>Like</span>
                </div>
            </div>
        </IconContext.Provider>
    );
};

export default IdeaCommentLike;