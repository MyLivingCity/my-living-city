import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';

export interface ProposalLimitItem {
    accountType: string;
    yearlyProposalLimit: number;
}

export interface UserLimitItem {
    id: string;
    fname: string | null;
    lname: string | null;
    email: string;
    userType: string;
    proposalLimit: number | null;
    proposalCount: number;
}

export const getProposalLimits = async (): Promise<ProposalLimitItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/pricing-and-limit/proposal-limits`);
    return res.data.items;
};

export const updateProposalLimits = async (
    items: ProposalLimitItem[],
    token: string,
): Promise<ProposalLimitItem[]> => {
    const res = await axios.put(
        `${API_BASE_URL}/pricing-and-limit/proposal-limits`,
        { items },
        getAxiosJwtRequestOption(token),
    );
    return res.data.items;
};

export const getUserLimits = async (token: string): Promise<UserLimitItem[]> => {
    const res = await axios.get(
        `${API_BASE_URL}/pricing-and-limit/users`,
        getAxiosJwtRequestOption(token),
    );
    return res.data.items;
};

export const updateUserProposalLimit = async (
    userId: string,
    proposalLimit: number | null,
    token: string,
): Promise<void> => {
    await axios.put(
        `${API_BASE_URL}/pricing-and-limit/users/${userId}/limit`,
        { proposalLimit },
        getAxiosJwtRequestOption(token),
    );
};
