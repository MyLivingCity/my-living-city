import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants';
import { PublicSubGroup } from '../types/data/publicProfile.type';


export const getPublicSubGroups = async (
    userId: string,
    token: string | null
): Promise<PublicSubGroup[]> => {
    const headers = {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Access-Control-Allow-Origin': '*',
    };
    const res = await axios.get<PublicSubGroup[]>(
        `${API_BASE_URL}/subgroups/public/${userId}`,
        { headers }

    );
    return res.data;
};
