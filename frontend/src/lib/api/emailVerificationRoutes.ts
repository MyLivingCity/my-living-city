import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
import { IUser } from '../types/data/user.type';

export const checkVerifiedUser = async (token: string | null) => {
    const res = await axios.get(`${API_BASE_URL}/emailVerification/checkIfUserIsVerified`, getAxiosJwtRequestOption(token!))
    return res.data;
}

