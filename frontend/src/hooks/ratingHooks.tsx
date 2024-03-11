import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getAxiosJwtRequestOption } from 'src/lib/api/axiosRequestOptions';
import { API_BASE_URL } from 'src/lib/constants';
import { IUser } from 'src/lib/types/data/user.type';
import { ICreateRatingInput } from '../lib/types/input/createRating.input';
import { getAllRatingsUnderIdea, getAllRatingsUnderIdeaWithAggregations } from '../lib/api/ratingRoutes';
import { IRating, IRatingAggregateResponse } from '../lib/types/data/rating.type';
import { IFetchError } from '../lib/types/types';
import { useEffect, useState } from 'react';
import { handlePotentialAxiosError } from 'src/lib/utilityFunctions';

export const useAllRatingsUnderIdea = (ideaId: string) => {
    return useQuery<IRating[], IFetchError>(
        ['ratings', ideaId],
        () => getAllRatingsUnderIdea(ideaId),
    );
};


export const useAllRatingsUnderIdeaWithAggregations = (ideaId: string) => {
    return useQuery<IRatingAggregateResponse, IFetchError>(
        ['ratings-aggregate', ideaId],
        () => getAllRatingsUnderIdeaWithAggregations(ideaId),
        {
            staleTime: 60 * 1000
        }
    );
};

export const useCreateRatingMutation = (
    ideaId: number,
    token: string | null,
    user: IUser | null,
) => {
    const previousRatingsKey = ['ratings', String(ideaId)];
    const previousIdeaKey = ['idea', String(ideaId)];
    const queryClient = useQueryClient();

    const ratingMutation = useMutation<IRating, AxiosError, ICreateRatingInput>(
        (newRating) => axios.post(
            `${API_BASE_URL}/rating/create/${ideaId}`,
            newRating,
            getAxiosJwtRequestOption(token!),
        ),
        {
            onMutate: async (newRating) => {
                const { id: userId } = user!;

                // Snapshot previous value
                const previousRatings = queryClient.getQueryData<IRating[]>(previousRatingsKey);

                // Cancel outgoing refreshes
                await queryClient.cancelQueries(previousRatingsKey);

                // Optimistically update to new value
                if (previousRatings) {
                    queryClient.setQueryData<IRating[]>(
                        previousRatingsKey,
                        [
                            ...previousRatings,
                            {
                                id: Math.random(),
                                authorId: userId,
                                ideaId: ideaId,
                                rating: newRating.rating,
                                ratingExplanation: newRating.ratingExplanation,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            }
                        ]
                    );
                }

       

                return previousRatings;
            },
            onError: (err, variables, context: any) => {
                if (context) {
       
                    queryClient.setQueryData<IRating[]>(previousRatingsKey, context);
                }
            },
            onSettled: async () => {
                queryClient.invalidateQueries(previousRatingsKey);
                queryClient.invalidateQueries(previousIdeaKey);
            },
        }
    );

    // Handle Potential Errors
    const { error } = ratingMutation;
    const [ parsedErrorObj, setParsedErrorObj ] = useState<IFetchError | null>(null);

    useEffect(() => {
        if (error) {
            const potentialAxiosError = handlePotentialAxiosError(
                'An error occured while trying to submit your rating.',
                error,
            );
            setParsedErrorObj(potentialAxiosError);
        }
    }, [ error ]);

    const submitRatingMutation = (ratingInput: ICreateRatingInput) => {
        ratingMutation.mutate(ratingInput);
    // ratingMutation.mutate()
    };

    return {
        ...ratingMutation,
        submitRatingMutation,
        error: parsedErrorObj,
    };
};