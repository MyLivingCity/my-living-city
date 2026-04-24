import { useQuery } from '@tanstack/react-query';
import type { IFetchError } from 'src/types/error.types';
import type { ISubGroup, ISubGroupMember } from 'src/types/subgroup.types';
import type { IUser } from 'src/types/user.types';
import { getSubGroupsManaged, getUserNotInSubGroup, getUserInSubGroup, getIsSubGroupManager } from 'src/lib/api/subgroup.routes';

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

export const useIsSubGroupManager = (token: string | null) => {
    return useQuery< {isSubGroupManager: boolean}, IFetchError>('isSubGroupManager', () => getIsSubGroupManager(token), {
        enabled: !!token,
    }); 
};