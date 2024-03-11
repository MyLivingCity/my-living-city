import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';

//For commentFlags
export const createThreshhold = async (
    num: number,
    token: string,
) => {
    if (!num || !token) {
        throw new Error(
            'A num and valid JWT must be specified to update threshhold'
        );
    }
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/threshhold/create/${num}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });
    return res.data;
};
  
//For commentFlags
export const updateThreshhold = async (
    num: number,
    token: string,
) => {
    if(!num || !token){
        throw new Error(
            'A num and valid JWT must be specified'
        );
    }
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/threshhold/update/${num}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });
    return res.data;
};

export const getThreshhold= async (token: string | null) => {
    const res = await axios.get(`${API_BASE_URL}/threshhold/get`,getAxiosJwtRequestOption(token!));
    return res.data;
};

export const getFalseFlagThreshold = async (token: string | null) => {
    const res = await axios.get(`${API_BASE_URL}/threshhold/getFalseFlag`,getAxiosJwtRequestOption(token!));
    return res.data;
};

export const getBadPostingThreshhold = async (token: string | null) => {
    const res = await axios.get(`${API_BASE_URL}/threshhold/getBadPosting`,getAxiosJwtRequestOption(token!));
    return res.data;
};

export const updateFalseFlagThreshold = async (
    num: number,
    token: string,
) => {
    if(!num || !token){
        throw new Error(
            'A num and valid JWT must be specified'
        );
    }
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/threshhold/updateFalseFlag/${num}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });
    return res.data;
};

export const updateBadPostingThreshhold = async (
    num: number,
    token: string,
) => {
    if(!num || !token){
        throw new Error(
            'A num and valid JWT must be specified'
        );
    }
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/threshhold/updateBadPosting/${num}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });
    return res.data;
};