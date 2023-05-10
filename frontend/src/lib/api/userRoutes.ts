import axios, { AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../constants";
import { IUser } from "../types/data/user.type";
import {
  IRegisterInput,
  IUserRegisterData,
  IUserSegmentRequest,
} from "../types/input/register.input";
import { postAvatarImage } from "./avatarRoutes";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";
export interface LoginData {
  email: string;
  password: string;
}
export interface ResetPassword {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  user: IUser;
  token: string;
}
export const getAllUsers = async (token: string | null) => {
  const res = await axios.get(
    `${API_BASE_URL}/user/getAll`,
    getAxiosJwtRequestOption(token!)
  );
  return res.data;
};
export const updateUser = async (userData: IUser, token: string | null) => {
  console.log(userData);
  console.log(token);
  const res = await axios({
    method: "put",
    url: `${API_BASE_URL}/user/admin-update-profile`,
    data: userData,
    headers: { "Access-Control-Allow-Origin": "*", "x-auth-token": token },
    withCredentials: true,
  });
  return res.data;
};
export const resetUserPassword = async (
  loginData: ResetPassword
): Promise<ResetPassword> => {
  if (loginData.password !== loginData.confirmPassword) {
    throw new Error("Passwords must match");
  }
  const queryString = window.location.search;
  loginData.email = loginData.email.toLowerCase();
  const res = await axios.post<ResetPassword>(
    `${API_BASE_URL}/user/reset-password${queryString}`,
    loginData
  );
  return res.data;
};
export const getUserWithEmailAndPass = async (
  loginData: LoginData
): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(
    `${API_BASE_URL}/user/login`,
    loginData
  );
  return res.data;
};

export interface GetUserWithJWTInput {
  jwtAuthToken: string;
}

export interface UseUserWithJwtInput {
  shouldTrigger: boolean;
  jwtAuthToken: string;
}

export const getUserWithJWT = async ({
  jwtAuthToken,
}: GetUserWithJWTInput): Promise<IUser> => {
  const res = await axios.get<IUser>(
    `${API_BASE_URL}/user/me`,
    getAxiosJwtRequestOption(jwtAuthToken)
  );
  return res.data;
};
export const getUserWithEmail = async (email: string | undefined) => {
  const res = await axios.get(`${API_BASE_URL}/user/email/${email}`);
  return res.status;
};
export const getUserWithJWTVerbose = async ({
  jwtAuthToken,
}: GetUserWithJWTInput): Promise<IUser> => {
  const res = await axios.get<IUser>(
    `${API_BASE_URL}/user/me-verbose`,
    getAxiosJwtRequestOption(jwtAuthToken)
  );
  return res.data;
};
export const postRegisterUser = async (
  registerData: IRegisterInput,
  requestData: IUserSegmentRequest[],
  avatar: any
): Promise<LoginResponse> => {
  const {
    email,
    password,
    confirmPassword,
    fname,
    lname,
    address,
    geo,
    homeSegmentId,
    workSegmentId,
    schoolSegmentId,
    homeSubSegmentId,
    workSubSegmentId,
    schoolSubSegmentId,
  } = registerData;
  let request3 = null;
  let request4 = null;
  let request5 = null;
  // Verify Payload
  if (!email || !password) {
    throw new Error("You must provide an email and password to sign up.");
  }

  if (password !== confirmPassword) {
    throw new Error(
      "Both your passwords must match. Please ensure both passwords match to register."
    );
  }
  const request = await axios.post<LoginResponse>(
    `${API_BASE_URL}/user/signup`,
    { email, password, confirmPassword, fname, lname, address, geo }
  );
  const request2 = await axios({
    method: "post",
    url: `${API_BASE_URL}/userSegment/create`,
    data: {
      homeSegmentId,
      workSegmentId,
      schoolSegmentId,
      homeSubSegmentId,
      workSubSegmentId,
      schoolSubSegmentId,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "x-auth-token": request.data.token,
    },
    withCredentials: true,
  });
  if (requestData) {
    if (requestData[0]) {
      request3 = await axios({
        method: "post",
        url: `${API_BASE_URL}/userSegmentRequest/create`,
        data: requestData[0],
        headers: {
          "Access-Control-Allow-Origin": "*",
          "x-auth-token": request.data.token,
        },
        withCredentials: true,
      });
    }
    if (requestData[1]) {
      request4 = await axios({
        method: "post",
        url: `${API_BASE_URL}/userSegmentRequest/create`,
        data: requestData[1],
        headers: {
          "Access-Control-Allow-Origin": "*",
          "x-auth-token": request.data.token,
        },
        withCredentials: true,
      });
    }
    if (requestData[2]) {
      request5 = await axios({
        method: "post",
        url: `${API_BASE_URL}/userSegmentRequest/create`,
        data: requestData[2],
        headers: {
          "Access-Control-Allow-Origin": "*",
          "x-auth-token": request.data.token,
        },
        withCredentials: true,
      });
    }
  }

  const request6 = avatar
    ? await postAvatarImage(avatar, request.data.token)
    : null;
  axios
    .all([request, request2, request3, request4, request5, request6])
    .then((...responses) => {
      console.log(responses);
    });
  return request.data;

  // .then(res=> (
  //   axios({
  //     method: "post",
  //     url: `${API_BASE_URL}/userSegment/create`,
  //     data: {
  // homeSegmentId,
  // workSegmentId,
  // schoolSegmentId,
  // homeSubSegmentId,
  // workSubSegmentId,
  // schoolSubSegmentId
  //     },
  //     headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": res.data.token},
  //     withCredentials: true
  // }))
};
