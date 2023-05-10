import { useQuery } from 'react-query';
import { IFetchError } from '../lib/types/types';
import { getAllUsers, getUserWithEmailAndPass, getUserWithJWT, getUserWithJWTVerbose, LoginData, LoginResponse, UseUserWithJwtInput } from '../lib/api/userRoutes';
import { AxiosError } from 'axios';
import { IUser } from '../lib/types/data/user.type';

export const useUserLoginWithEmailAndPass = (loginData: LoginData) => {
  return useQuery<LoginResponse, IFetchError>('userLogin', () => getUserWithEmailAndPass(loginData));
}
export const useAllUsers = (token: string | null) => {
  return useQuery<IUser[], IFetchError>(`users`, () => getAllUsers(token));
}
export const useUserWithJwt = ({ jwtAuthToken, shouldTrigger}: UseUserWithJwtInput) => {
  return useQuery<IUser, AxiosError>(
    'user',
    () => getUserWithJWT({ jwtAuthToken }),
    {
      enabled: shouldTrigger,
      staleTime: 1000 * 60 * 10
    }
  )
}

export const useUserWithJwtVerbose = ({ jwtAuthToken, shouldTrigger}: UseUserWithJwtInput) => {
  return useQuery<IUser, AxiosError>(
    'user-verbose',
    () => getUserWithJWTVerbose({ jwtAuthToken }),
    {
      enabled: shouldTrigger,
      staleTime: 1000 * 60 * 60 // 1 hour
    }
  )
}