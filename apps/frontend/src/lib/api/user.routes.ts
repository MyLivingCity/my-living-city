import axios from "axios";
import { type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../constants/constants";
import {
  type IRegisterInput,
  type SegmentRequest,
} from "@components/content/session/types/register.types";
import { mlcApiClient } from "@lib/mlcApiClient";
// import { postAvatarImage } from "./avatarRoutes";
import { type IWorkDetailsInput } from "@/types/input/workDetails.input";
import { type ISchoolDetailsInput } from "@/types/input/schoolDetails.input";
import { type IHomeDetailsInput } from "@/types/input/homeDetails.input";
import type { IUser } from "@/types/user.types";
import { UserSegmentRelationship } from "../types/segment.types";

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
  userObject: IUser;
  token: string;
  user: IUser;
}

export interface GetUserWithJWTInput {
  jwtAuthToken: string;
}

export interface UseUserWithJwtInput {
  shouldTrigger: boolean;
  jwtAuthToken: string;
}

export const getUserWithEmail = async (email: string) => {
  const res = await mlcApiClient.users.getByEmail({ params: { email } });
  return res.body;
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

export const getUserWithJWT = async ({
  jwtAuthToken,
}: GetUserWithJWTInput): Promise<IUser> => {
  const res = await mlcApiClient.users.getSelf({
    ...fetchOptionsWithJwt(jwtAuthToken),
  });
  return res.body?.user ?? undefined;
};

export const getUserWithJWTVerbose = async ({
  jwtAuthToken,
}: GetUserWithJWTInput): Promise<IUser> => {
  const res = await mlcApiClient.users.getSelfVerbose({
    ...fetchOptionsWithJwt(jwtAuthToken),
  });
  return res.body;
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

export const getUserById = async (userId: string | null) => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/user/get/${userId}`,
  });
  return res.data;
};

export const getAllUsers = async (token: string | null) => {
  const res = await axios.get(
    `${API_BASE_URL}/user/getAll`,
    getAxiosJwtRequestOption(token!),
  );
  return res.data;
};

export const getAllRegularUsers = async (token: string | null) => {
  const res = await axios.get(
    `${API_BASE_URL}/user/getAllRegularUsers`,
    getAxiosJwtRequestOption(token!),
  );
  return res.data;
};
export const updateUser = async (
  userData: IUser,
  token: string | null,
  user: IUser | null,
) => {
  const userType = user?.userType;
  const res = await axios({
    method: "put",
    url: `${API_BASE_URL}/user/${userType?.toLowerCase()}-update-profile`,
    data: userData,
    headers: { "Access-Control-Allow-Origin": "*", "x-auth-token": token },
    withCredentials: true,
  });
  return res.data;
};

export const deleteUser = async (userId: string, token: string | null) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "x-auth-token": token,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete user");
  }
};

export const updateUserPassword = async (
  userId: string,
  newPassword: string,
  token: string | null,
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/user/${userId}/password`,
      {
        newPassword: newPassword,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "x-auth-token": token,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update user password");
  }
};

export const resetUserPassword = async (
  loginData: ResetPassword,
): Promise<ResetPassword> => {
  if (loginData.password !== loginData.confirmPassword) {
    throw new Error("Passwords must match");
  }
  const queryString = window.location.search;
  loginData.email = loginData.email.toLowerCase();
  const res = await axios.post<ResetPassword>(
    `${API_BASE_URL}/user/reset-password${queryString}`,
    loginData,
  );
  return res.data;
};
export const getUserWithEmailAndPass = async (
  loginData: LoginData,
): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(
    `${API_BASE_URL}/user/login`,
    loginData,
  );
  return res.data;
};

export const getUserSubscriptionStatus = async (userId: string | undefined) => {
  const res = await axios.get(`${API_BASE_URL}/account/details`, {
    params: {
      userId: userId,
    },
  });
  return res.data;
};

export const getEnhancedMemberStatus = async (
  userId: string | undefined,
  token: string | null,
) => {
  const res = await axios.get(
    `${API_BASE_URL}/enhanced-member/status/${userId}`,
    getAxiosJwtRequestOption(token!),
  );
  return res.data;
};

export const promoteToEnhancedMember = async (
  userId: string | undefined,
  token: string | null,
) => {
  const res = await axios.post(
    `${API_BASE_URL}/enhanced-member/promote`,
    { userId },
    getAxiosJwtRequestOption(token!),
  );
  return res.data;
};

export const getUserBanHistory = async (userId: string | undefined) => {
  const res = await axios.get(`${API_BASE_URL}/user/getBannedUserHistory`, {
    params: {
      userId: userId,
    },
  });
  return res.data;
};

export const getAllBannedUsers = async () => {
  const res = await axios.get(`${API_BASE_URL}/user/getBannedUsers`);
  return res.data;
};

export const removeFlagQuarantine = async (userId: string | undefined) => {
  const res = await axios.patch(`${API_BASE_URL}/user/removeFlagQuarantine`, {
    userId: userId,
  });
  console.log("removeFlagQuarantine", res.data);
  return res.data;
};

export const removePostCommentQuarantine = async (
  userId: string | undefined,
) => {
  const res = await axios.patch(
    `${API_BASE_URL}/user/removePostCommentQuarantine`,
    {
      userId: userId,
    },
  );
  console.log("removePostCommentQuarantine", res.data);
  return res.data;
};

export const deleteSchoolSegmentDetails = async (
  userId: string | undefined,
) => {
  try {
    const res = await axios.delete(
      `${API_BASE_URL}/schoolDetails/delete/${userId}`,
    );
    return res.data;
  } catch (error) {
    console.error("Failed to delete school details:", error);
  }
};

export const deleteWorkSegmentDetails = async (userId: string | undefined) => {
  const res = await axios.delete(
    `${API_BASE_URL}/workDetails/delete/${userId}`,
  );
  console.log("deleteWorkSegmentDetails", res.data);
  return res.data;
};

export const getSchoolSegmentDetails = async (userId: string | undefined) => {
  const res = await axios.get(`${API_BASE_URL}/schoolDetails/get/${userId}`);
  return res.data;
};

export const getWorkSegmentDetails = async (userId: string | undefined) => {
  const res = await axios.get(`${API_BASE_URL}/workDetails/get/${userId}`);
  return res.data;
};

export const updateWorkSegmentDetails = async (
  userId: string | undefined,
  data: IWorkDetailsInput,
) => {
  const res = await axios.patch(
    `${API_BASE_URL}/workDetails/update/${userId}`,
    data,
  );

  console.log("updateWorkSegmentDetails", res.data);

  const res1 = await axios.patch(
    `${API_BASE_URL}/workDetails/updateCityNeighbourhood/${userId}`,
    {
      city: data.city,
      neighbourhood: data.neighbourhood,
    },
  );
  console.log("updateWorkSegmentDetails", res1.data);

  return res.data;
};

export const updateSchoolSegmentDetails = async (
  userId: string | undefined,
  data: ISchoolDetailsInput,
) => {
  const res = await axios.patch(
    `${API_BASE_URL}/schoolDetails/update/${userId}`,
    data,
  );
  console.log("updateSchoolSegmentDetails", res.data);

  const res1 = await axios.patch(
    `${API_BASE_URL}/schoolDetails/updateCityNeighbourhood/${userId}`,
    {
      city: data.city,
      neighbourhood: data.neighbourhood,
    },
  );
  console.log("updateSchoolSegmentDetails", res1.data);
  console.log("Waiting for 10 seconds...");
  await sleep(10000); // 10000 milliseconds = 10 seconds
  console.log("10 seconds later...");
  return res.data;
};
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const updateHomeSegmentDetails = async (
  userId: string | undefined,
  data: IHomeDetailsInput,
) => {
  const res2 = await axios.patch(
    `${API_BASE_URL}/user/updateAddress/${userId}`,
    {
      streetAddress: data.streetAddress,
      postalCode: data.postalCode,
    },
  );

  console.log("CITY:", data.city);
  console.log("NIGHBORHOOD:", data.neighbourhood);

  const res3 = await axios.patch(
    `${API_BASE_URL}/user/updateCityNeighbourhood/${userId}`,
    {
      city: data.city,
      neighbourhood: data.neighbourhood,
    },
  );

  // console.log('updateHomeSegmentDetails, part1', res1.data);
  console.log("updateHomeSegmentDetails, part2", res2.data);
  console.log("updateHomeSegmentDetails, part3", res3.data);
  // Combine data from both responses
  return { ...res2.data };
};

export const getUserGeoData = async (userId: string | undefined) => {
  const res = await axios.get(`${API_BASE_URL}/user/getGeoData/${userId}`);
  console.log("getUserGeoData", res.data);
  return res.data;
};

export const patchUserHandle = async (
  userId: string | null,
  data: {
    handle: string;
    userSegmentRelationship:
    | typeof UserSegmentRelationship.HOME
    | typeof UserSegmentRelationship.WORK
    | typeof UserSegmentRelationship.SCHOOL;
  },
) => {
  if (!userId || !data) return;

  const response = await axios.patch(
    `${API_BASE_URL}/user/${userId}/patchHandle`,
    data,
  );

  return response.data;
};

export interface UseUserWithJwtInput {
  shouldTrigger: boolean;
  jwtAuthToken: string;
}
