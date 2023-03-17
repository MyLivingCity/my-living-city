import { useQuery } from 'react-query';
import { IFetchError } from '../lib/types/types';
import { getAllCommentFlags, getAllFlags, checkFlagBan } from '../lib/api/flagRoutes';
import { AxiosError } from 'axios';
import { ICommentFlag, IFlag, IFalseFlagBehavior } from '../lib/types/data/flag.type';

export const useAllFlags = (token: string | null) => {
    return useQuery<IFlag[], IFetchError>(`flags`, () => getAllFlags(token));
}

export const useAllCommentFlags = (token: string | null) => {
    return useQuery<ICommentFlag[], IFetchError>('commentFlags', () => getAllCommentFlags(token))
}

export const useCheckFlagBan = (token: string | null, userId: string) => {
    return useQuery<IFalseFlagBehavior, AxiosError>(`checkFlagBan-${userId}`, () => checkFlagBan(token, userId));
}