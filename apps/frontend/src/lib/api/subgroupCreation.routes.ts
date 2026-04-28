import axios from 'axios';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
import { API_BASE_URL } from 'src/lib/constants/constants';
import type { ISubGroup } from 'src/types/subgroup.types';

export const getAllSubgroups = async (token: string | null) => {
    const res = await axios.get<ISubGroup[]>(
        `${API_BASE_URL}/subgroup/getAll`,
        {
            headers: {
                'x-auth-token': token ?? '',
                'Access-Control-Allow-Origin': '*',
            },
            withCredentials: true,
        }
    );
    return res.data;
};

export const getSubgroupByName = async () => {
    const res = await axios.get<ISubGroup[]>(`${API_BASE_URL}/subgroup/getByName/`);
    return res.data;
};

export const createSubgroup = async (subgroupData: any, token: any) => {
    const parsedPayload = { ...subgroupData };

    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/subgroup/create`,
        data: parsedPayload,
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Access-Control-Allow-Origin': '*'
        },
        withCredentials: true
    });

    if (!(res.status === 201 || res.status === 200)) {
        throw new Error(res.data);
    }

    return res.data;
};

export const deleteSubgroupById = async (subgroupId: string, token: string) => {
    try {
        const res = await axios({
            method: 'delete',
            url: `${API_BASE_URL}/subgroup/delete/${subgroupId}`,
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Access-Control-Allow-Origin': '*' 
            },
            withCredentials: true
        });

        if (res.status !== 200 && res.status !== 204) {
            throw new Error('Error deleting the subgroup');
        }

        return res.data;
    } catch (error) {
        console.error('Failed to delete the subgroup:', error);
        throw error;
    }
};

export const updateSubGroup = async (subgroupId: string, fields: any, token: string) => {
    const res = await axios.patch(`${API_BASE_URL}/subgroup/update/${subgroupId}`, fields, getAxiosJwtRequestOption(token!));
    
    if (!(res.status === 200 || res.status === 201)) {
        throw new Error(res.data?.message || 'Error updating subgroup');
    }

    return res.data;
};


export const getEligibleManagers = async (token: string) => {
    const res = await axios.get(`${API_BASE_URL}/subgroup/eligibleManagers`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
    });

    return res.data;
};
