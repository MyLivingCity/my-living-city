import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getAxiosJwtRequestOption } from '../lib/api/axiosRequestOptions';
import { API_BASE_URL } from '../lib/constants';
import { ICreateCommentInput } from '../lib/types/input/createComment.input';
import { getAllComments, getCommentAggregateUnderIdea, getCommentsUnderIdea, getCommentsUnderMultipleIdeas } from '../lib/api/commentRoutes';
import { IComment, ICommentAggregateCount } from '../lib/types/data/comment.type';
import { IFetchError } from '../lib/types/types';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../lib/types/data/user.type';
import { useEffect, useState } from 'react';
import { handlePotentialAxiosError, getSegmentId } from 'src/lib/utilityFunctions';
import { SegmentType, UserSegmentRelationshipEnum } from 'src/lib/types/data/segment.type';

export const useAllComments = () => {
    return useQuery<IComment[], IFetchError>(
        'comments',
        getAllComments,
    );
};

export const useAllCommentsUnderIdea = (ideaId: string, token: string | null) => {
    return useQuery<IComment[], IFetchError>(
        ['comments', ideaId],
        () => getCommentsUnderIdea(ideaId, token),
        {
            staleTime: 5 * 60 * 1000 // 5 minutes
        }
    );
};

export const useCommentAggregateUnderIdea = (ideaId: string) => {
    return useQuery<ICommentAggregateCount, IFetchError>(
        ['comment-aggregate', ideaId],
        () => getCommentAggregateUnderIdea(ideaId),
        {
            staleTime: 5 * 60 * 1000 // 5 minutes
        }
    );
};

export const useAllCommentsUnderMultipleIdeas = (ideas: { ideaId: number }[]) => {
    return useQuery<IComment[][], IFetchError>(
        ['comments-all', ideas.map(idea => idea.ideaId)],
        () => getCommentsUnderMultipleIdeas(ideas),
        {
            staleTime: 5 * 60 * 1000 // 5 minutes
        }
    );
};


// https://react-query.tanstack.com/guides/mutations#persist-mutations
// https://stackoverflow.com/questions/65760158/react-query-mutation-typescript
export const useCreateCommentMutation = (
    ideaId: number,
    token: string | null,
    user: IUser | null,
) => {
    const previousCommentsKey = ['comments', String(ideaId)];
    const previousCommentAggregateKey = ['comment-aggregate', String(ideaId)];
    const queryClient = useQueryClient();

    const createCommentMutation = useMutation<IComment, AxiosError, ICreateCommentInput>(
        newComment => axios.post(
            `${API_BASE_URL}/comment/create/${ideaId}`,
            { content: newComment.content },
            getAxiosJwtRequestOption(token!),
        ),
        {
            onMutate: async (newComment) => {
                const { id: userId, fname, lname, organizationName, email, address, userSegments, userType, userHandles} = user!;
                const homeHandle = userHandles?.find(h => h.userSegmentRelationship === UserSegmentRelationshipEnum.HOME)?.handle ?? '';
                const workHandle = userHandles?.find(h => h.userSegmentRelationship === UserSegmentRelationshipEnum.WORK)?.handle ?? '';
                const schoolHandle = userHandles?.find(h => h.userSegmentRelationship === UserSegmentRelationshipEnum.SCHOOL)?.handle ?? '';
          

                // snapshot previous value
                const previousCommentAggregate = 
          queryClient.getQueryData<ICommentAggregateCount>(previousCommentAggregateKey);
                const previousComments = queryClient.getQueryData<IComment[]>(previousCommentsKey);

                // Cancel outgoing refetches
                await queryClient.cancelQueries(previousCommentAggregateKey);
                await queryClient.cancelQueries(previousCommentsKey);

                // Optimistically update aggregate value
                if (previousCommentAggregate) {
                    queryClient.setQueryData<ICommentAggregateCount>(previousCommentAggregateKey,
                        {
                            count: previousCommentAggregate.count + 1
                        }
                    );
                }

                // Optimistically update to new value
                if (previousComments) {
                    queryClient.setQueryData<IComment[]>(previousCommentsKey,
                        [
                            ...previousComments,
                            {
                                id: Math.random(),
                                ideaId: ideaId!,
                                active: true,
                                authorId: userId,
                                bannedComment: false,
                                commentFlagNumber: 0,
                                reviewed: false,
                                author: {
                                    id: uuidv4(),
                                    email,
                                    fname: fname ?? '',
                                    lname: lname ?? '',
                                    organizationName: organizationName ?? '',
                                    userType: userType ?? '',
                                    address: {
                                        postalCode: address?.postalCode ?? '',
                                        streetAddress: address?.streetAddress ?? '',
                                    },
                                    userSegment:{
                                        homeSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.HOME, SegmentType.segment),
                                        homeSubSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.HOME, SegmentType.subSegment),
                                        homeSuperSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.HOME, SegmentType.superSegment),
                                        workSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.WORK, SegmentType.segment),
                                        workSubSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.WORK, SegmentType.subSegment),
                                        workSuperSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.WORK, SegmentType.superSegment),
                                        schoolSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.SCHOOL, SegmentType.segment),
                                        schoolSubSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.SCHOOL, SegmentType.subSegment),
                                        schoolSuperSegmentId: getSegmentId(userSegments, UserSegmentRelationshipEnum.SCHOOL, SegmentType.superSegment),
                                      
                                        
                                        homeSegHandle: homeHandle,
                                        workSegHandle: workHandle,
                                        schoolSegHandle: schoolHandle,
                                    }
                                },
                                idea: {segments: [
                                    {segId: -1, name: '', segmentType: SegmentType.segment}, 
                                    {segId: -2, name: '', segmentType: SegmentType.subSegment}, 
                                ]},
                                likes: [],
                                dislikes: [],
                                content: newComment.content,
                                _count: {
                                    dislikes: 0,
                                    likes: 0,
                                },
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                notification_dismissed: false,
                                quarantined_at: new Date()
                            }
                        ]
                    );
                }
    

                return previousComments;
            },
            onError: (err, variables, context: any) => {
                if (context) {
                    queryClient.setQueryData<IComment[]>(previousCommentsKey, context);
                }
            },
            onSettled: () => {
                queryClient.invalidateQueries(previousCommentsKey);
            }
        }
    );

  
    // Handle potential Errors
    const { error } = createCommentMutation;
    const [ parsedErrorObj, setParsedErrorObj ] = useState<IFetchError | null>(null);

    useEffect(() => {
        if (error) {
            const potentialAxiosError = handlePotentialAxiosError(
                'An Error occured while trying to submit a comment.',
                error,
            );
            setParsedErrorObj(potentialAxiosError);
        }
    }, [ error ]);

    const submitComment = (newComment: ICreateCommentInput) => {

        createCommentMutation.mutate(newComment);
    };

    return {
        ...createCommentMutation,
        submitComment,
        error: parsedErrorObj,
    };
};