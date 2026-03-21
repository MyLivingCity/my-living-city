import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';

export interface ProposalLimitItem {
    accountType: string;
    yearlyProposalLimit: number;
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
