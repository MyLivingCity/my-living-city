import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { IRating, IRatingAggregateResponse } from '../types/data/rating.type';

export const getAllRatingsUnderIdea = async (
    ideaId: string
): Promise<IRating[]> => {
    /*
  if (!ideaId) {
    throw new Error("An ideaId must be specified to fetch all ratings under idea.")
  }
*/
    const res = await axios.get<IRating[]>(
        `${API_BASE_URL}/rating/getall/${ideaId ? ideaId : '7'}`
    );
    return res.data;
};

export const getAllRatingsUnderIdeaWithAggregations = async (
    ideaId: string
): Promise<IRatingAggregateResponse> => {
    if (!ideaId) {
        throw new Error(
            'An ideaId must be specified to fetch all ratings under idea.'
        );
    }

    const res = await axios.get<IRatingAggregateResponse>(
        `${API_BASE_URL}/rating/getall/${ideaId ? ideaId : '7'}/aggregations`
    );
    return res.data;
};
