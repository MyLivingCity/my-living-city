import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const replaceAllReachSegments = async (token: string | null, userId: string, segIds: number[]) => {
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/reach/replaceSegments`,
        data: {
            userId: userId,
            segIds: segIds
        },
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    });
    return res.data;
};