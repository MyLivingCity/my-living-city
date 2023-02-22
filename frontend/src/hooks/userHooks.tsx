import { useQuery } from 'react-query';
import { IFetchError } from '../lib/types/types';
import { getUserById, getAllUsers, getUserWithEmailAndPass, getUserWithJWT, getUserWithJWTVerbose, LoginData, LoginResponse, UseUserWithJwtInput, getAllBannedUsers } from '../lib/api/userRoutes';
import { AxiosError } from 'axios';
import { IUser } from '../lib/types/data/user.type';
import { IBanUserInfo } from 'src/lib/types/data/banUser.type';

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

export const useUserWithUserId = (userId: string) => {
  return useQuery<IUser, IFetchError>(
    ["userDetails", userId],
    () => getUserById(userId)
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

export const useBannedUsers = (token: string | null) => {
  return useQuery<IBanUserInfo[], IFetchError>(`banned-users`, () => getAllBannedUsers());
}