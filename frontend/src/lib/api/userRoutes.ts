import axios, { AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../constants";
import { IUser } from "../types/data/user.type";
import { IRegisterInput } from "../types/input/register.input";
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

export const getUserWithJWTVerbose = async ({ jwtAuthToken }: GetUserWithJWTInput): Promise<IUser> => {
  const res = await axios.get<IUser>(
    `${API_BASE_URL}/user/me-verbose`, 
    getAxiosJwtRequestOption(jwtAuthToken)
  );
  return res.data;
}

export const postRegisterUser = async (registerData: IRegisterInput): Promise<LoginResponse> => {
  const { email, password, confirmPassword } = registerData;
  // Verify Payload
  if (!email || !password) {
    throw new Error("You must provide an email and password to sign up.")
  }

  if (password !== confirmPassword) {
    throw new Error("Both your passwords must match. Please ensure both passwords match to register.")
  }

  const res = await axios.post<LoginResponse>(`${API_BASE_URL}/user/signup`, registerData);
  return res.data;
}