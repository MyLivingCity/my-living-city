import { IComment } from '../lib/types/data/comment.type';
import { useMutation, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { API_BASE_URL } from '../lib/constants';
import { getAxiosJwtRequestOption } from '../lib/api/axiosRequestOptions';
import { delay } from '../lib/utilityFunctions';

export const useCommentLikeMutation = (
    commentId: number,
    ideaId: number,
    token: string | null,
) => {
    const previousCommentsKey = ['comments', String(ideaId)];
    const queryClient = useQueryClient();

    // Find index
    // https://stackoverflow.com/questions/35206125/javascript-es6-es5-find-in-array-and-change
    const likeMutation = useMutation(
    // () => likeCommentRequest(commentId, token),
        () => axios.post(
            `${API_BASE_URL}/interact/comment/like/${commentId}`,
            {},
            getAxiosJwtRequestOption(token!)
        ),
        {
            onMutate: async () => {
                // snapshot previous value
                const previousComments = queryClient.getQueryData<IComment[]>(previousCommentsKey);

                // Cancel outgoing refetches
                await queryClient.cancelQueries(previousCommentsKey);

                // Find index of current comment that has been liked
                const foundIndex = previousComments?.findIndex(comment => comment.id === commentId);
                // DEEP copy nested values
                // https://stackoverflow.com/questions/61421873/object-copy-using-spread-operator-actually-shallow-or-deep
                let editedComments = JSON.parse(JSON.stringify(previousComments)) as IComment[];

                // Change aggregates if previous comments exist
                if (previousComments && foundIndex != null) {
                    // Check if user has disliked
                    if (0 < editedComments[foundIndex].dislikes.length) {
                        editedComments[foundIndex].dislikes = [];
                        editedComments[foundIndex]._count.dislikes -= 1;
                    }

                    if (0 < editedComments[foundIndex].likes.length) {
                        // If user has liked before remove like
                        editedComments[foundIndex]._count.likes -= 1;
                        editedComments[foundIndex].likes = [];
                    } else {
                        // If user has not liked before add like
                        editedComments[foundIndex]._count.likes += 1;
                        editedComments[foundIndex].likes.push({
                            id: Math.random(),
                            authorId: uuidv4(),
                            ideaCommentId: commentId,
                        });
                    }

                    queryClient.setQueryData<IComment[]>(previousCommentsKey, editedComments);
                }

                return previousComments;
            },
            onError: (err, variables, context: any) => {
  
                if (context) {
                    queryClient.setQueryData<IComment[]>(previousCommentsKey, context);
                }
            },
            onSettled: async () => {
                await delay();
                await queryClient.invalidateQueries(previousCommentsKey);
            }
        }
    );

    const submitLikeMutation = () => {
        likeMutation.mutate();
    };

    const { isLoading, isError, error } = likeMutation;

    return {
        submitLikeMutation,
        isLoading,
        isError,
        error,
    };
};

export const useCommentDislikeMutation = (
    commentId: number,
    ideaId: number,
    token: string | null,
) => {
    const previousCommentsKey = ['comments', String(ideaId)];
    const queryClient = useQueryClient();

    const dislikeMutation = useMutation(
    // () => dislikeCommentRequest(commentId, token),
        () => axios.post(
            `${API_BASE_URL}/interact/comment/dislike/${commentId}`,
            {},
            getAxiosJwtRequestOption(token!),
        ),
        {
            onMutate: async () => {
                // snapshot previous value
                const previousComments = queryClient.getQueryData<IComment[]>(previousCommentsKey);

                // Cancel outgoing refetches
                await queryClient.cancelQueries(previousCommentsKey);

                // Find index of current comment that has been liked
                const foundIndex = previousComments?.findIndex(comment => comment.id === commentId);

                // Change aggregates if previous comments exist
                if (previousComments && foundIndex != null) {
                    // Deep copy nested values
                    const editedComments = JSON.parse(JSON.stringify(previousComments)) as IComment[];

                    // Check if user has liked
                    if (0 < editedComments[foundIndex].likes.length) {
                        editedComments[foundIndex].likes = [];
                        editedComments[foundIndex]._count.likes -= 1;
                    }

                    if (0 < editedComments[foundIndex].dislikes.length) {
                        // if user has disliked before remove dislike
                        editedComments[foundIndex]._count.dislikes -= 1;
                        editedComments[foundIndex].dislikes = [];
                    } else {
                        // if user had not disliked before add dislike
                        editedComments[foundIndex]._count.dislikes += 1;
                        editedComments[foundIndex].dislikes.push({
                            id: Math.random(),
                            authorId: uuidv4(),
                            ideaCommentId: commentId,
                        });
                    }

                    queryClient.setQueryData<IComment[]>(previousCommentsKey, editedComments);
                }

                return previousComments;
            },
            onError: (err, variables, context: any) => {

                if (context) {
                    queryClient.setQueryData<IComment[]>(previousCommentsKey, context);
                }
            },
            onSettled: async () => {
                await delay();
                await queryClient.invalidateQueries(previousCommentsKey);
            }
        }
    );

    const submitDislikeMutation = () => {
        dislikeMutation.mutate();
    };

    const { isLoading, isError, error } = dislikeMutation;

    return {
        submitDislikeMutation,
        isLoading,
        isError,
        error,
    };
};