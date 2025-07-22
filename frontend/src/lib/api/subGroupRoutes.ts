import axios from 'axios';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';

// Constants
import { API_BASE_URL } from '../constants';

// Types
import { IUser } from '../types/data/user.type';
import { ISubGroup, ISubGroupMember } from '../types/data/subGroup.type';

/**
 * Gets the subgroups managed by the user.
 * @param token token JWT for authentication
 * @returns The list of subgroups managed by the user.
 */
export const getSubGroupsManaged = async (token: string | null): Promise<ISubGroup[]> => {
    const res = await axios.get(`${API_BASE_URL}/subGroups`, getAxiosJwtRequestOption(token!));
    return res.data;
};

export const getUserNotInSubGroup = async (token: string | null, subGroupId: string): Promise<IUser[]> => {
    const res = await axios.get(`${API_BASE_URL}/subGroups/${subGroupId}/users/notInSubGroup`, getAxiosJwtRequestOption(token!));
    return res.data;
};

export const getUserInSubGroup = async (token: string | null, subGroupId: string): Promise<ISubGroupMember[]> => {
    const res = await axios.get(`${API_BASE_URL}/subGroups/${subGroupId}/users`, getAxiosJwtRequestOption(token!));
    return res.data;
};

/**
 * Adds a user to a subgroup.
 * @param token token JWT for authentication
 * @param subGroupId subgroup ID to which the user will be added
 * @param userId user ID of the user to be added
 * @returns The added user data
 */
export const addUserToSubGroup = async (token: string | null, subGroupId: string, userId: string) => {
    const res = await axios.post(`${API_BASE_URL}/subGroups/${subGroupId}/users/${userId}`, {}, getAxiosJwtRequestOption(token!));
    return res.data;
};

/** 
 * Removes a user from a subgroup.
 * @param token token JWT for authentication
 * @param subGroupId subgroup ID from which the user will be removed
 * @param userId user ID of the user to be removed
 * @returns The removed user data 
*/
export const removeUserFromSubGroup = async (token: string | null, subGroupId: string, userId: string) => {
    const res = await axios.delete(`${API_BASE_URL}/subGroups/${subGroupId}/users/${userId}`, getAxiosJwtRequestOption(token!));
    return res.data;
};

/**
 * Update user request status in a subgroup.
 * @param token token JWT for authentication
 * @param subGroupId subgroup ID where the user request is being updated
 * @param userId user ID of the user whose request status is being updated
 * @param status new status to set for the user request (e.g., 'APPROVED', 'REJECTED')
 * @returns The updated user request data   
 */
export const updateUserRequestStatusInSubGroup = async (token: string | null, subGroupId: string, userId: string, action: 'APPROVED' | 'REJECTED') => {
    const res = await axios.patch(`${API_BASE_URL}/subGroups/${subGroupId}/users/${userId}`, { action }, getAxiosJwtRequestOption(token!));
    return res.data;
};

/** 
 * Remove rejected user request from a subgroup. 
 * @param token token JWT for authentication
 * @param subGroupId subgroup ID from which the rejected user request will be removed
 * @param userId user ID of the rejected user request to be removed
 * @returns The removed rejected user data
*/
export const removeRejectedUserRequestFromSubGroup = async (token: string | null, subGroupId: string, userId: string) => {
    const res = await axios.delete(`${API_BASE_URL}/subGroups/${subGroupId}/users/rejected/${userId}`, getAxiosJwtRequestOption(token!));
    return res.data;
};