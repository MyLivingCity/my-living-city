import axios from "axios"
import { API_BASE_URL } from "../constants"
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";

export const likeCommentRequest = async (
  commentId: number,
  token: string | null,
): Promise<void> => {
  if (!commentId || !token) {
    throw new Error("A Valid CommentID and user token must be specified to like comment");
  }

  const res = await axios.post<void>(
    `${API_BASE_URL}/interact/comment/like/${commentId}`,
    {},
    getAxiosJwtRequestOption(token),
  );
  return res.data;
}

export const dislikeCommentRequest = async (
  commentId: number,
  token: string | null,
): Promise<void> => {
  if (!commentId || !token) {
    throw new Error("A Valid CommentID and user token must be specified to dislike a comment");
  }

  const res = await axios.post<void>(
    `${API_BASE_URL}/interact/comment/dislike/${commentId}`,
    {},
    getAxiosJwtRequestOption(token),
  );
  return res.data;
}