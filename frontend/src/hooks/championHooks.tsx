import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IIdeaWithAggregations, IIdeaWithRelationship } from '../lib/types/data/idea.type';
import { IFetchError } from '../lib/types/types';
import { getSingleIdea, postAllIdeasWithBreakdown } from '../lib/api/ideaRoutes';
import { IUser } from 'src/lib/types/data/user.type';
import { ISubmitChampionRequestResponse } from 'src/lib/types/responses/champion.response';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from 'src/lib/constants';
import { getAxiosJwtRequestOption } from 'src/lib/api/axiosRequestOptions';
import { useEffect, useState } from 'react';
import { handlePotentialAxiosError } from 'src/lib/utilityFunctions';

export const useSubmitChampionRequestMutation = (
  ideaId: number,
  token: string | null,
) => {
  const previousIdeaKey = ['idea', String(ideaId)];
  const queryClient = useQueryClient();

  const championMutation = useMutation<ISubmitChampionRequestResponse, AxiosError, {}>(
    () => axios.post(
      `${API_BASE_URL}/champion/idea/${ideaId}`,
      {},
      getAxiosJwtRequestOption(token!),
    ),
    {
      onMutate: () => { },
      onError: () => { },
      onSettled: () => {
        queryClient.invalidateQueries(previousIdeaKey);
      }
    }
  )

  // Handle Potential Errors
  const { error } = championMutation;
  const [ parsedErrorObj, setParsedErrorObj ] = useState<IFetchError | null>(null);

  useEffect(() => {
    if (error) {
      const potentialAxiosError = handlePotentialAxiosError(
        "An Error occured while trying request to Champion an idea.",
        error,
      );
      setParsedErrorObj(potentialAxiosError);
    }
  }, [ error ])

  const submitChampionRequestMutation = () => {
    championMutation.mutate({});
  }

  return {
    ...championMutation,
    submitChampionRequestMutation,
    error: parsedErrorObj,
  }
}