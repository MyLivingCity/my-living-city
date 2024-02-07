import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { IComment, ICommentAggregateCount } from '../types/data/comment.type';
import { ICreateCommentInput } from '../types/input/createComment.input';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';

export const getAllComments = async (): Promise<IComment[]> => {
    const res = await axios.get<IComment[]>(`${API_BASE_URL}/comment/getall`);
    return res.data;
};

// export const getUserComments = async (userId: string) => {
//   const res = await axios.get<any>(`${API_BASE_URL}/comment/getall/${userId}`);


//   return res.data;
// };

export const getCommentsUnderIdea = async (
    ideaId: string,
    token: string | null | undefined
): Promise<IComment[]> => {
    /*
  if (!ideaId) {
    throw new Error(
      "An ideaId must be specified to fetch all comments under idea."
    );
  }
*/
    const res = await axios.get<IComment[]>(
        `${API_BASE_URL}/comment/getall/${ideaId ? ideaId : '7'}`,
        getAxiosJwtRequestOption(token!)
    );

    return res.data;
};

export const getCommentsUnderMultipleIdeas = async (
    ideas: { ideaId: number }[]
): Promise<IComment[][]> => {
    const fetchPromises = ideas.map(({ ideaId }) =>
        axios.get<IComment[]>(`${API_BASE_URL}/comment/getall/${ideaId}`)
    );

    const responses = await Promise.all(fetchPromises);
    const allComments = responses.map(response => response.data);

    return allComments;
};


export const getCommentAggregateUnderIdea = async (ideaId: string) => {
    /*
  if (!ideaId) {
    throw new Error(
      "An ideaId must be specified to fetch all comments under idea."
    );
  }
*/
    const res = await axios.get<ICommentAggregateCount>(
        `${API_BASE_URL}/comment/aggregate/${ideaId ? ideaId : '7'}`
    );
    return res.data;
};

export const createCommentUnderIdea = async (
    ideaId: number,
    token: string,
    commentPayload: ICreateCommentInput
): Promise<IComment> => {
    if (!ideaId || !token) {
        throw new Error(
            'An ideaId and valid JWT must be specified to create a comment.'
        );
    }

    const res = await axios.post<IComment>(
        `${API_BASE_URL}/comment/create/2`,
        commentPayload,
        getAxiosJwtRequestOption(token)
    );

    return res.data;
};

export const updateCommentStatus = async(token: String | null, commentId: string|null, active: boolean|null, reviewed: boolean|null, banned: boolean|null, quarantined_at: Date) => {
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/comment/updateState/${commentId}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        data: {commentId: commentId, active: active, reviewed: reviewed, banned: banned, quarantined_at },
        withCredentials: true,
    });
    return res.data;
};

export const updateCommentNotificationStatus = async(token: String | null, userId: string|undefined, commentId: string|null, notification_dismissed: boolean) => {

  
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/comment/updateNotificationState/${commentId}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        data: {userId: userId, commentId: commentId, notification_dismissed },
        withCredentials: true,
    });
    return res.data;
};