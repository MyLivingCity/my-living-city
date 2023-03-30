import axios, { AxiosResponse } from "axios";
import { API_BASE_URL, USER_TYPES } from "../constants";
import { IUser } from "../types/data/user.type";
import { IRegisterInput, IUserRegisterData, IUserSegmentRequest } from "../types/input/register.input";
import { delay, storeTokenExpiryInLocalStorage, storeUserAndTokenInLocalStorage } from "../utilityFunctions";
import { postAvatarImage } from "./avatarRoutes";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";
import { IWorkDetailsInput } from "../types/input/workDetails.input";
import { ISchoolDetailsInput } from "../types/input/schoolDetails.input";
import { IHomeDetailsInput } from "../types/input/homeDetails.input";

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
export const getUserById = async (userId: string | null) => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/user/get/${userId}`
  })
  return res.data;
}

export const getAllUsers = async (token: string | null) => {
  const res = await axios.get(`${API_BASE_URL}/user/getAll`,getAxiosJwtRequestOption(token!));
  return res.data;
}
export const updateUser = async (userData: IUser, token: string | null, user: IUser | null) => {

  let userType = user?.userType
  const res = await axios({
    method: "put",
    url: `${API_BASE_URL}/user/${userType?.toLowerCase( )}-update-profile`,
    data: userData,
    headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": token},
    withCredentials: true
})
  return res.data;
}
export const resetUserPassword = async (loginData: ResetPassword): Promise<ResetPassword> => {
  if(loginData.password !== loginData.confirmPassword){
    throw new Error("Passwords must match");
  }
  const queryString = window.location.search;
  loginData.email = loginData.email.toLowerCase();
  const res = await axios.post<ResetPassword>(`${API_BASE_URL}/user/reset-password${queryString}`, loginData)
  return res.data;
}
export const getUserWithEmailAndPass = async (loginData: LoginData): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(`${API_BASE_URL}/user/login`, loginData)
  return res.data;
}

export interface GetUserWithJWTInput {
  jwtAuthToken: string;
}

export interface UseUserWithJwtInput {
  shouldTrigger: boolean;
  jwtAuthToken: string;
}

export const getUserWithJWT = async ({ jwtAuthToken }: GetUserWithJWTInput): Promise<IUser> => {
  const res = await axios.get<IUser>(
    `${API_BASE_URL}/user/me`, 
    getAxiosJwtRequestOption(jwtAuthToken)
  );
  return res.data;
}
export const getUserWithEmail = async (email: string | undefined) => {
  const res = await axios.get(
    `${API_BASE_URL}/user/email/${email}`
  );
  return res.status;
}
export const getUserSubscriptionStatus = async (userId: string | undefined) => {
  const res = await axios.get(
    `${API_BASE_URL}/account/details`,
    {
      params:
      {
        userId: userId
      }
    }
  );
  return res.data;
}
export const getUserWithJWTVerbose = async ({ jwtAuthToken }: GetUserWithJWTInput): Promise<IUser> => {
  const res = await axios.get<IUser>(
    `${API_BASE_URL}/user/me-verbose`, 
    getAxiosJwtRequestOption(jwtAuthToken)
  );
  return res.data;
}
export const postRegisterUser = async(registerData: IRegisterInput, requestData:IUserSegmentRequest[], avatar: any): Promise<LoginResponse> => {
  const { 
    email, 
    password, 
    confirmPassword,
    organizationName,
    fname,
    lname,
    address,
    geo,
    workDetails,
    schoolDetails,
    homeSegmentId,
    workSegmentId,
    schoolSegmentId,
    homeSubSegmentId,
    workSubSegmentId,
    schoolSubSegmentId,
    userType,
    reachSegmentIds,
  } = registerData;
  let request3 = null;
  let request4 = null;
  let request5 = null;
  // Verify Payload
  if (!email || !password) {
    throw new Error("You must provide an email and password to sign up.")
  }

  if (password !== confirmPassword) {
    throw new Error("Both your passwords must match. Please ensure both passwords match to register.")
  }
  const request = await axios.post<LoginResponse>(`${API_BASE_URL}/user/signup`, {email,password,confirmPassword,organizationName,fname,lname,address,geo, userType});
  const request2 = await axios({
    method: "post",
    url: `${API_BASE_URL}/schoolDetails/create`,
    data: {
      schoolDetails: schoolDetails,
      userId: request.data.user.address?.userId,
    },
    headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": request.data.token},
    withCredentials: true,
  })

  await axios({
    method: "post",
    url: `${API_BASE_URL}/workDetails/create`,
    data: {
      workDetails: workDetails,
      userId: request.data.user.address?.userId,
    },
    headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": request.data.token},
    withCredentials: true,
  })

  await axios({
    method: "post",
    url: `${API_BASE_URL}/userSegment/create`,
    data: { 
        homeSegmentId,
        workSegmentId,
        schoolSegmentId,
        homeSubSegmentId,
        workSubSegmentId,
        schoolSubSegmentId
    },
    headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": request.data.token},
    withCredentials: true
  })
  if(requestData){
    if(requestData[0]){
      request3 = await axios({
          method: "post",
          url: `${API_BASE_URL}/userSegmentRequest/create`,
          data: requestData[0],
          headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": request.data.token},
          withCredentials: true
      })
  }if(requestData[1]){
      request4 = await axios({
          method: "post",
          url: `${API_BASE_URL}/userSegmentRequest/create`,
          data: requestData[1],
          headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": request.data.token},
          withCredentials: true
      })
  }if(requestData[2]){
      request5 = await axios({
          method: "post",
          url: `${API_BASE_URL}/userSegmentRequest/create`,
          data: requestData[2],
          headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": request.data.token},
          withCredentials: true
      })
  }
}
const request6 = avatar ? await postAvatarImage(avatar, request.data.token) : null;

let request7: AxiosResponse<any>[] = [];
if (userType === USER_TYPES.IN_PROGRESS || userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) {
  reachSegmentIds?.forEach(async (segId) => {
    const newUserReachReq = await axios({
      method: "post",
      url: `${API_BASE_URL}/reach/create`,
      data: {
        segId: segId,
        userId: request.data.user.address?.userId,
      },
      headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": request.data.token},
      withCredentials: true,
    });
    request7.push(newUserReachReq);
  })
}

console.log("schoolDetails", schoolDetails)

Promise.all([request, request2, request3, request4, request5, request6, ...request7]).then((...responses)=>{
  
})
const {token, user} = request.data;
storeUserAndTokenInLocalStorage(token, user);
storeTokenExpiryInLocalStorage();
await delay(2000);
return request.data;
}

export const getUserBanHistory = async (userId: string | undefined) => {
  const res = await axios.get(
    `${API_BASE_URL}/user/getBannedUserHistory`,
    {
      params:
      {
        userId: userId
      }
    }
  );
  return res.data;
}

export const getAllBannedUsers = async () => {
  const res = await axios.get(
    `${API_BASE_URL}/user/getBannedUsers`
  );
  return res.data;
}

export const removeFlagQuarantine = async (userId: string | undefined) => {
  const res = await axios.patch(
    `${API_BASE_URL}/user/removeFlagQuarantine`,
    {
      userId: userId
    }
  );
  console.log("removeFlagQuarantine", res.data);
  return res.data;
}

export const removePostCommentQuarantine = async (userId: string | undefined) => {
  const res = await axios.patch(
    `${API_BASE_URL}/user/removePostCommentQuarantine`,
    {
      userId: userId
    }
  );
  console.log("removePostCommentQuarantine", res.data);
  return res.data;
}

export const deleteSchoolSegmentDetails = async (userId: string | undefined) => {
  const res = await axios.delete(
    `${API_BASE_URL}/schoolDetails/delete/${userId}`,
  );
  console.log("deleteSchoolSegmentDetails", res.data);
  return res.data;
}

export const deleteWorkSegmentDetails = async (userId: string | undefined) => {
  const res = await axios.delete(
    `${API_BASE_URL}/workDetails/delete/${userId}`,
  );
  console.log("deleteWorkSegmentDetails", res.data);
  return res.data;
}

export const getSchoolSegmentDetails = async (userId: string | undefined) => {
  const res = await axios.get(
    `${API_BASE_URL}/schoolDetails/get/${userId}`,
  );
  return res.data;
}

export const getWorkSegmentDetails = async (userId: string | undefined) => {
  const res = await axios.get(
    `${API_BASE_URL}/workDetails/get/${userId}`,
  );
  return res.data;
}

export const updateWorkSegmentDetails = async (userId: string | undefined, data: IWorkDetailsInput) => {
  const res = await axios.patch(
    `${API_BASE_URL}/workDetails/update/${userId}`,
    data
  );
  return res.data;
}

export const updateSchoolSegmentDetails = async (userId: string | undefined, data: ISchoolDetailsInput) => {
  const res = await axios.patch(
    `${API_BASE_URL}/schoolDetails/update/${userId}`,
    data
  );
  console.log("updateSchoolSegmentDetails", res.data);
  return res.data;
}

export const updateHomeSegmentDetails = async (userId: string | undefined, data: IHomeDetailsInput) => {
  const res1 = await axios.patch(
    `${API_BASE_URL}/user/updateDisplayName/${userId}`,
    {
      displayFName: data.displayFName,
      displayLName: data.displayLName
    }
  );

  const res2 = await axios.patch(
    `${API_BASE_URL}/user/updateAddress/${userId}`,
    {
      streetAddress: data.streetAddress,
      postalCode: data.postalCode
    }
  );

  const res3 = await axios.patch(
    `${API_BASE_URL}/user/updateCityNeighbourhood/${userId}`,
    {
      city: data.city,
      neighbourhood: data.neighbourhood
    }
  );

  console.log("updateHomeSegmentDetails, part1", res1.data);
  console.log("updateHomeSegmentDetails, part2", res2.data);
  console.log("updateHomeSegmentDetails, part3", res3.data);
  // Combine data from both responses
  return {...res1.data, ...res2.data};
}

export const getUserGeoData = async (userId: string | undefined) => {
  const res = await axios.get(
    `${API_BASE_URL}/user/getGeoData/${userId}`,
  );
  console.log("getUserGeoData", res.data);
  return res.data;
}