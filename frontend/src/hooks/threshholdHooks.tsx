import { useQuery } from 'react-query';
import { IFetchError } from '../lib/types/types';
import { getAllCommentFlags, getAllFlags } from '../lib/api/flagRoutes';
import { AxiosError } from 'axios';
import { ICommentFlag, IFlag } from '../lib/types/data/flag.type';
import { getThreshhold, getFalseFlagThreshold, getBadPostingThreshhold } from 'src/lib/api/threshholdRoutes';

export interface INumber {
    id: number
	number: number
}

export const useThreshold = (token: string | null) => {
    return useQuery<INumber, IFetchError>('threshhold', () => getThreshhold(token));
};

export const useFalseFlagThreshold = (token: string | null) => {
    return useQuery<INumber, IFetchError>('false-flag-threshhold', () => getFalseFlagThreshold(token));
};

export const useBadPostingThreshhold = (token: string | null) => {
    return useQuery<INumber, IFetchError>('bad-posting-threshhold', () => getBadPostingThreshhold(token));
};