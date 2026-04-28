import axios from "axios";
import { API_BASE_URL } from "../constants/constants";
import {
  type JoinRequest,
  type JoinRequestResponse,
} from "@/types/publicProfile.types";

export const getAllSubGroupRequests = async (
  userId: string,
  token: string | null,
): Promise<JoinRequest[]> => {
  const headers = {
    "Content-Type": "application/json",
    "x-auth-token": token,
    "Access-Control-Allow-Origin": "*",
  };
  const res = await axios.get<JoinRequest[]>(
    `${API_BASE_URL}/subgroupRequest/getAllRequest/${userId}`,
    { headers },
  );
  return res.data;
};

export const createJoinRequest = async (
  joinRequestData: JoinRequestResponse,
  token: string | null,
) => {
  const { userId, subgroupId } = joinRequestData;
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/subgroupRequest/createRequest/${userId}/${subgroupId}`,
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true,
  });
  return res;
};
