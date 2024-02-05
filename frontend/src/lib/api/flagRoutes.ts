import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { IComment, ICommentAggregateCount } from '../types/data/comment.type';
import { ICreateCommentInput } from '../types/input/createComment.input';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
import { getThreshhold } from './threshholdRoutes';

//For IdeaFlags
export const createFlagUnderIdea = async (
    ideaId: number,
    flagReason: string,
    token: string,
  ) => {
    if (!ideaId || !token) {
      throw new Error(
        'An ideaId and valid JWT must be specified to flag.'
      );
    }
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/flag/create/${ideaId}`,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'Access-Control-Allow-Origin': '*',
        },
        data: {flagReason: flagReason},
        withCredentials: true,
      })
    return res.data;
  };
//For IdeaFlags
  export const updateFalseFlagIdea = async (
    ideaId: number,
    token: string,
    isFalse: boolean,
  ) => {
    if(!ideaId || !token){
      throw new Error(
        'An ideaId and valid JWT must be specified'
      );
    }
    const res = await axios({
      method: 'put',
      url: `${API_BASE_URL}/flag/falseFlagMany/${ideaId}`,
      headers: {
        'x-auth-token': token,
        'Access-Control-Allow-Origin': '*',
      },
      data: {isFalse: isFalse},
      withCredentials: true,
    })
    return res.data;
  }

//For IdeaFlags
  export const getAllFlags= async (token: string | null) => {
    const res = await axios.get(`${API_BASE_URL}/flag/getAll`,getAxiosJwtRequestOption(token!));
    return res.data;
  }

/**
 * Compares current idea's number of flags with the threshold.
 * @param ideaId idea's ID
 * @param token authentication token
 * @returns true if idea flags are greater than or equal threshold
 */
  export const compareIdeaFlagsWithThreshold = async (
    ideaId: number,
    token: string,
  ) => {
    if (!ideaId || !token) {
      throw new Error(
        'An ideaId and valid JWT must be specified to compare flag count with threshold.'
      );
    }
    const flagCount = await axios({
      method: 'get',
      url: `${API_BASE_URL}/flag/getFlags/${ideaId}`,
      headers: {
        'x-auth-token': token,
        'Access-Control-Allow-Origin': '*',
      },
      withCredentials: true,
    })
    const thresholdCount = await getThreshhold(token);
    return flagCount.data >= thresholdCount.number;
  }

//For commentFlags
export const createCommentFlagUnderIdea = async (
  commentId: number,
  flagReason: string,
  token: string,
) => {
  if (!commentId || !token) {
    throw new Error(
      'A commentId and valid JWT must be specified to flag.'
    );
  }

  const res = await axios({
      method: 'post',
      url: `${API_BASE_URL}/commentFlag/create/${commentId}`,
      headers: {
        'x-auth-token': token,
        'Access-Control-Allow-Origin': '*',
      },
      data: {flagReason: flagReason},
      withCredentials: true,
    })
  return res.data;
};

//For commentFlags
export const updateFalseFlagComment = async (
  commentId: number,
  token: string,
  isFalse: boolean,
) => {
  if(!commentId || !token){
    throw new Error(
      'A commentId and valid JWT must be specified'
    );
  }
  const res = await axios({
    method: 'put',
    url: `${API_BASE_URL}/commentFlag/falseFlagMany/${commentId}`,
    headers: {
      'x-auth-token': token,
      'Access-Control-Allow-Origin': '*',
    },
    data: {isFalse: isFalse},
    withCredentials: true,
  })
  return res.data;
}

  //For commentFlags
  export const getAllCommentFlags= async (token: string | null) => {
    const res = await axios.get(`${API_BASE_URL}/commentFlag/getAll`,getAxiosJwtRequestOption(token!));
    return res.data;
  }

  /**
   * Compares current commentId's number of flags with the threshold.
   * @param commentId commentId's ID
   * @param token authentication token
   * @returns true if comment flags are greater than or equal threshold
   */
    export const compareCommentFlagsWithThreshold = async (
      commentId: number,
      token: string,
    ) => {
      if (!commentId || !token) {
        throw new Error(
          'An commentId and valid JWT must be specified to compare commentFlag count with threshold.'
        );
      }
      const flagCount = await axios({
        method: 'get',
        url: `${API_BASE_URL}/commentFlag/getFlags/${commentId}`,
        headers: {
          'x-auth-token': token,
          'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
      })
      const thresholdCount = await getThreshhold(token);
      return flagCount.data >= thresholdCount.number;
  }

  // Check if user has a flag ban
  export const checkFlagBan = async (token: string | null, user: string) => {
    const res = await axios({
      method: 'get',
      url: `${API_BASE_URL}/flag/checkFlagBan/${user}`,
      headers: {
        'x-auth-token': token,
        'Access-Control-Allow-Origin': '*',
      },
      withCredentials: true,
    })
    return res.data;
  }
