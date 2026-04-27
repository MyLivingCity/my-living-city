import axios from "axios";
import { type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../constants/constants";
import {
  type IRegisterInput,
  type SegmentRequest,
} from "../../components/content/session/types/register.types";
import { type IUser } from "../types/user/user.types";
import { mlcApiClient } from "@lib/mlcApiClient";

export const getUserWithEmail = async (email: string) => {
  const res = await mlcApiClient.users.getByEmail({ params: { email } });
  return res.data;
};

export const postRegisterUser = async (
  registerData: IRegisterInput,
  requestData: SegmentRequest[] | null,
  logUser: boolean | null,
  avatar: File | undefined,
): Promise<void> => {
  const { email, password, confirmPassword } = registerData;

  if (!email || !password) throw new Error("Email and password are required.");
  if (password !== confirmPassword) throw new Error("Passwords must match.");

  registerData.verified = !logUser;

  const res = await mlcApiClient.users.register({
    body: {
      ...registerData,
      userSegment: {
        homeSegmentId: registerData.homeSegmentId,
        workSegmentId: registerData.workSegmentId,
        schoolSegmentId: registerData.schoolSegmentId,
        homeSubSegmentId: registerData.homeSubSegmentId,
        workSubSegmentId: registerData.workSubSegmentId,
        schoolSubSegmentId: registerData.schoolSubSegmentId,
      },
      segmentRequest: requestData,
      userReach: registerData.reachSegmentIds,
    },
  });

  if (res.status !== 201) throw new Error("Failed to create user.");
  if (avatar) await postAvatarImage(avatar, res.data.token);
  if (logUser) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
};

const postAvatarImage = async (avatar: File, token: string): Promise<void> => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  await axios.post(`${API_BASE_URL}/user/avatar`, formData, {
    headers: { "x-auth-token": token },
  });
};

export const getUserWithJWT = async (jwtToken): Promise<IUser> => {
  const res = await mlcApiClient.users.getSelf({
    ...fetchOptionsWithJwt(jwtToken),
  });
  return res;
};

export const loginUser = async (loginData: LoginData) => {
  const res = await mlcApiClient.users.login({
    body: {
      ...loginData,
    },
  });
  return res;
};

export const fetchOptionsWithJwt = (jwtToken: string) => {
  const options = {
    extraHeaders: {
      "x-auth-token": jwtToken,
    },
  };

  return options;
};

export const getAxiosJwtRequestOption = (
  jwtToken: string,
): AxiosRequestConfig => {
  const options: AxiosRequestConfig = {
    headers: {
      "x-auth-token": jwtToken,
      "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true,
  };

  return options;
};

export interface UseUserWithJwtInput {
  shouldTrigger: boolean;
  jwtAuthToken: string;
}
