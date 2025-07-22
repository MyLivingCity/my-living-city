import { useQuery } from 'react-query';
import { IFetchError } from '../lib/types/types';
import { ISubGroup, ISubGroupMember } from '../lib/types/data/subGroup.type';
import { IUser } from 'src/lib/types/data/user.type';
import { getSubGroupsManaged, getUserNotInSubGroup, getUserInSubGroup } from '../lib/api/subGroupRoutes';

export const useGetSubGroupsManaged = (token: string | null) => {
    return useQuery<ISubGroup[], IFetchError>(`managedSubGroups`, () => getSubGroupsManaged(token));
};

export const useGetUserNotInSubGroup = (token: string | null, subGroupId: string) => {
    return useQuery<IUser[], IFetchError>(`usersNotInSubGroup-${subGroupId}`, () => getUserNotInSubGroup(token, subGroupId),
        {
            enabled: !!token && !!subGroupId,
        }
    );
};

export const useGetUserInSubGroup = (token: string | null, subGroupId: string) => {
    return useQuery<ISubGroupMember[], IFetchError>(`usersInSubGroup-${subGroupId}`, () => getUserInSubGroup(token, subGroupId),
        {
            enabled: !!token && !!subGroupId,
        }
    );
};