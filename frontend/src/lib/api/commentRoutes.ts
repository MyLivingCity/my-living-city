import axios from "axios";
import { API_BASE_URL } from "../constants";
import { IComment, ICommentAggregateCount } from "../types/data/comment.type";
import { ICreateCommentInput } from "../types/input/createComment.input";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";

export const getAllComments = async (): Promise<IComment[]> => {
  const res = await axios.get<IComment[]>(`${API_BASE_URL}/comments/getall`);
  return res.data;
};

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
    `${API_BASE_URL}/comment/getall/${ideaId ? ideaId : "7"}`,
    getAxiosJwtRequestOption(token!)
  );
  console.log(res.data);
  return res.data;
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
    `${API_BASE_URL}/comment/aggregate/${ideaId ? ideaId : "7"}`
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
      "An ideaId and valid JWT must be specified to create a comment."
    );
  }

  const res = await axios.post<IComment>(
    `${API_BASE_URL}/comment/create/2`,
    commentPayload,
    getAxiosJwtRequestOption(token)
  );

  return res.data;
};
