import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getAxiosJwtRequestOption } from 'src/lib/api/axiosRequestOptions';
import { API_BASE_URL } from 'src/lib/constants';
import { IUser } from 'src/lib/types/data/user.type';
import { ICreateFeedbackRatingInput } from 'src/lib/types/input/createFeedbackRating.input';
import { getAllFeedbackRatingsUnderFeedback, getAllFeedbackRatingsUnderFeedbackWithAggregations } from 'src/lib/api/feedbackRatingRoutes';
import { IFeedbackRating, IFeedbackRatingYesNoAggregateResponse, IFeedbackRatingScaleAggregateResponse } from 'src/lib/types/data/feedbackRating.type';
import { IFetchError } from 'src/lib/types/types';
import { useEffect, useState } from 'react';
import { handlePotentialAxiosError } from 'src/lib/utilityFunctions';

export const useAllFeedbackRatingsUnderFeedback = (feedbackId: string, proposalId: string) => {
    return useQuery<IFeedbackRating[], IFetchError>(
        ['feedback-ratings', feedbackId],
        () => getAllFeedbackRatingsUnderFeedback(feedbackId, proposalId),
    );
};

export const useAllFeedbackRatingsUnderFeedbackWithAggregations = (feedbackId: string, proposalId: string, type: string) => {
    return useQuery<IFeedbackRatingYesNoAggregateResponse | IFeedbackRatingScaleAggregateResponse, IFetchError>(
        ['feedback-ratings-aggregate', feedbackId],
        () => getAllFeedbackRatingsUnderFeedbackWithAggregations(feedbackId, proposalId, type),
        {
            staleTime: 60 * 1000,
        },
    );
};

export const useCreateFeedbackRatingMutation = (feedbackId: number, proposalId: number, token: string | null, user: IUser | null) => {
    const previousFeedbackRatingsKey = ['feedback-ratings', String(feedbackId)];
    const previousFeedbackKey = ['feedback', String(feedbackId)];
    const previousProposalKey = ['proposal', String(proposalId)];
    const queryClient = useQueryClient();

    const feedbackRatingMutation = useMutation<IFeedbackRating, AxiosError, ICreateFeedbackRatingInput>(
        (newFeedbackRating) =>
            axios.post(`${API_BASE_URL}/feedbackRating/create/${feedbackId}/${proposalId}`, newFeedbackRating, getAxiosJwtRequestOption(token!)),
        {
            onMutate: async (newFeedbackRating) => {
                const { id: userId } = user!;

                // Snapshot previous value
                const previousFeedbackRatings = queryClient.getQueryData<IFeedbackRating[]>(previousFeedbackRatingsKey);

                // Cancel outgoing refreshes
                await queryClient.cancelQueries(previousFeedbackRatingsKey);

                // Optimistically update to new value
                if (previousFeedbackRatings) {
                    queryClient.setQueryData<IFeedbackRating[]>(previousFeedbackRatingsKey, [
                        ...previousFeedbackRatings,
                        {
                            id: Math.random(),
                            authorId: userId,
                            proposalId: proposalId,
                            feedbackId: feedbackId,
                            rating: newFeedbackRating.rating,
                            ratingExplanation: newFeedbackRating.ratingExplanation,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    ]);
                }

                // Return a context object with the snapshotted value
                return { previousFeedbackRatings };
            },
            onError: (err, variables, context: any) => {
                if (context) {
                    queryClient.setQueryData<IFeedbackRating[]>(previousFeedbackRatingsKey, context);
                }
            },
            onSettled: () => {
                queryClient.invalidateQueries(previousFeedbackRatingsKey);
                queryClient.invalidateQueries(previousFeedbackKey);
                queryClient.invalidateQueries(previousProposalKey);
            },
        },
    )
    const { error } = feedbackRatingMutation;
    const [ parsedErrorObj, setParsedErrorObj ] = useState<IFetchError | null>(null);

    useEffect(() => {
        if (error) {
            const parsedError = handlePotentialAxiosError(
                'An error occurred while trying to submit your rating.',
                error,
            );
            setParsedErrorObj(parsedError);
        }
    }, [error]);

    const submitRatingMutation = (newFeedbackRating: ICreateFeedbackRatingInput) => {
        feedbackRatingMutation.mutate(newFeedbackRating);
    };

    return {
        ...feedbackRatingMutation,
        submitRatingMutation,
        error: parsedErrorObj,
    };
}