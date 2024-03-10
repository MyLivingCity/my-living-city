import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, USER_TYPES } from '../constants';
import { IUser } from '../types/data/user.type';
import { IRegisterInput, IUserRegisterData, IUserSegmentRequest } from '../types/input/register.input';
import { delay, storeTokenExpiryInLocalStorage, storeUserAndTokenInLocalStorage } from '../utilityFunctions';
import { postAvatarImage } from './avatarRoutes';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
import { IWorkDetailsInput } from '../types/input/workDetails.input';
import { ISchoolDetailsInput } from '../types/input/schoolDetails.input';
import { IHomeDetailsInput } from '../types/input/homeDetails.input';
import { getUserIdeas } from './ideaRoutes';

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
        method: 'get',
        url: `${API_BASE_URL}/user/get/${userId}`
    });
    return res.data;
};

export const getAllUsers = async (token: string | null) => {
    const res = await axios.get(`${API_BASE_URL}/user/getAll`, getAxiosJwtRequestOption(token!));
    return res.data;
};
export const updateUser = async (userData: IUser, token: string | null, user: IUser | null) => {

    let userType = user?.userType;
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/user/${userType?.toLowerCase()}-update-profile`,
        data: userData,
        headers: { 'Access-Control-Allow-Origin': '*', 'x-auth-token': token },
        withCredentials: true
    });
    return res.data;
};

export const deleteUser = async (userId: string, token: string | null) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/user/${userId}`, {
            headers: {
                'Access-Control-Allow-Origin': '*', 'x-auth-token': token
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to delete user');
    }
};

export const resetUserPassword = async (loginData: ResetPassword): Promise<ResetPassword> => {
    if (loginData.password !== loginData.confirmPassword) {
        throw new Error('Passwords must match');
    }
    const queryString = window.location.search;
    loginData.email = loginData.email.toLowerCase();
    const res = await axios.post<ResetPassword>(`${API_BASE_URL}/user/reset-password${queryString}`, loginData);
    return res.data;
};
export const getUserWithEmailAndPass = async (loginData: LoginData): Promise<LoginResponse> => {
    const res = await axios.post<LoginResponse>(`${API_BASE_URL}/user/login`, loginData);
    return res.data;
};

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
};
export const getUserWithEmail = async (email: string | undefined) => {
    const res = await axios.get(
        `${API_BASE_URL}/user/email/${email}`
    );
    return res.status;
};
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
};
export const getUserWithJWTVerbose = async ({ jwtAuthToken }: GetUserWithJWTInput): Promise<IUser> => {
    const res = await axios.get<IUser>(
        `${API_BASE_URL}/user/me-verbose`,
        getAxiosJwtRequestOption(jwtAuthToken)
    );
    return res.data;
};
export const postRegisterUser = async (registerData: IRegisterInput, requestData: IUserSegmentRequest[] | null, logUser: boolean | null, avatar: any, token: string | null = null): Promise<LoginResponse> => {  
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
        verified,
    } = registerData;

    // Verify Payload
    if (!email || !password) {
        throw new Error('You must provide an email and password to sign up.');
    }

    if (password !== confirmPassword) {
        throw new Error('Both your passwords must match. Please ensure both passwords match to register.');
    }

    if (!logUser) {
        registerData.verified = true;
    }
    else {
        registerData.verified = false;
    }

    const displayFName = fname;
    const displayLName = address?.streetAddress || '';

    // Create User
    const createUserRequest = await axios.post<LoginResponse>(`${API_BASE_URL}/user/signup`, {
        email, 
        password, 
        confirmPassword, 
        organizationName, 
        fname, 
        lname, 
        address, 
        geo, 
        userType, 
        verified, 
        displayFName, 
        displayLName,
        userSegment: {
            homeSegmentId,
            workSegmentId,
            schoolSegmentId,
            homeSubSegmentId,
            workSubSegmentId,
            schoolSubSegmentId
        },
        segmentRequest: requestData,
        userReach: reachSegmentIds,
        workDetails,
        schoolDetails,
    },
    {
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    }
    );
    if (createUserRequest.status !== 201) {
        throw new Error('Failed to create user');
    }
    
    // Post avatar image if it exists
    if (avatar) {
        await postAvatarImage(avatar, createUserRequest.data.token);
    }

    // Store user and token in local storage
    if (logUser){
        const { token, user } = createUserRequest.data;
        storeUserAndTokenInLocalStorage(token, user);
        storeTokenExpiryInLocalStorage();
    }
    return createUserRequest.data;
};

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
};

export const getAllBannedUsers = async () => {
    const res = await axios.get(
        `${API_BASE_URL}/user/getBannedUsers`
    );
    return res.data;
};

export const removeFlagQuarantine = async (userId: string | undefined) => {
    const res = await axios.patch(
        `${API_BASE_URL}/user/removeFlagQuarantine`,
        {
            userId: userId
        }
    );
    console.log('removeFlagQuarantine', res.data);
    return res.data;
};

export const removePostCommentQuarantine = async (userId: string | undefined) => {
    const res = await axios.patch(
        `${API_BASE_URL}/user/removePostCommentQuarantine`,
        {
            userId: userId
        }
    );
    console.log('removePostCommentQuarantine', res.data);
    return res.data;
};

export const deleteSchoolSegmentDetails = async (userId: string | undefined) => {
    const res = await axios.delete(
        `${API_BASE_URL}/schoolDetails/delete/${userId}`,
    );
    console.log('deleteSchoolSegmentDetails', res.data);
    return res.data;
};

export const deleteWorkSegmentDetails = async (userId: string | undefined) => {
    const res = await axios.delete(
        `${API_BASE_URL}/workDetails/delete/${userId}`,
    );
    console.log('deleteWorkSegmentDetails', res.data);
    return res.data;
};

export const getSchoolSegmentDetails = async (userId: string | undefined) => {
    const res = await axios.get(
        `${API_BASE_URL}/schoolDetails/get/${userId}`,
    );
    return res.data;
};

export const getWorkSegmentDetails = async (userId: string | undefined) => {
    const res = await axios.get(
        `${API_BASE_URL}/workDetails/get/${userId}`,
    );
    return res.data;
};

export const updateWorkSegmentDetails = async (userId: string | undefined, data: IWorkDetailsInput) => {
    const res = await axios.patch(
        `${API_BASE_URL}/workDetails/update/${userId}`,
        data
    );

    console.log('updateWorkSegmentDetails', res.data);

    const res1 = await axios.patch(
        `${API_BASE_URL}/workDetails/updateCityNeighbourhood/${userId}`,
        {
            city: data.city,
            neighbourhood: data.neighbourhood
        }
    );
    console.log('updateWorkSegmentDetails', res1.data);

    return res.data;
};

export const updateSchoolSegmentDetails = async (userId: string | undefined, data: ISchoolDetailsInput) => {
    const res = await axios.patch(
        `${API_BASE_URL}/schoolDetails/update/${userId}`,
        data
    );
    console.log('updateSchoolSegmentDetails', res.data);

    const res1 = await axios.patch(
        `${API_BASE_URL}/schoolDetails/updateCityNeighbourhood/${userId}`,
        {
            city: data.city,
            neighbourhood: data.neighbourhood
        }
    );
    console.log('updateSchoolSegmentDetails', res1.data);

    return res.data;
};

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

    console.log('updateHomeSegmentDetails, part1', res1.data);
    console.log('updateHomeSegmentDetails, part2', res2.data);
    console.log('updateHomeSegmentDetails, part3', res3.data);
    // Combine data from both responses
    return { ...res1.data, ...res2.data };
};

export const getUserGeoData = async (userId: string | undefined) => {
    const res = await axios.get(
        `${API_BASE_URL}/user/getGeoData/${userId}`,
    );
    console.log('getUserGeoData', res.data);
    return res.data;
};