import { useQuery } from 'react-query';
import { ISegment, ISubSegment, ISegmentRequest, ISuperSegment, ISegmentAggregateInfo, ISegmentUserInfo } from '../lib/types/data/segment.type';
import { IFetchError } from '../lib/types/types';
import { findSegmentRequests, getAllSegments, getSingleSegmentBySegmentId, getSingleSubSegmentBySubSegmentId, getAllSuperSegments, getSegmentAgggregateInfo, findSegmentByName, getSegmentUsersInfo} from '../lib/api/segmentRoutes';
import {getAllSubSegmentsWithId} from '../lib/api/segmentRoutes';

export const useAllSegments= () => {
    return useQuery<ISegment[], IFetchError>('segments', getAllSegments,);
};

export const useAllSuperSegments = () => {
    return useQuery<ISuperSegment[], IFetchError>('superSegments', getAllSuperSegments,);
};

export const useAllSubSegmentsWithId= (segId:string) => {
    return useQuery<ISubSegment[]>(
        ['subSegments', segId],
        () => getAllSubSegmentsWithId(segId),
    );

};
export const useAllSegmentRequests = (token: string | null) => {
    return useQuery<ISegmentRequest[]>(
        ['segRequests', token],
        () => findSegmentRequests(token),
    );
};

export const useSingleSegmentBySegmentId = (segmentId: number) => {
    return useQuery<ISegment, IFetchError>(
        ['segmentId', segmentId],
        () => getSingleSegmentBySegmentId(segmentId),
    );
};

export const useSingleSubSegmentBySubSegmentId = (subSegmentId: number | undefined) => {
    return useQuery<ISubSegment, IFetchError>(
        ['subSegmentId', subSegmentId],
        () => getSingleSubSegmentBySubSegmentId(subSegmentId),
    );
};

export const useSegmentInfoAggregate = (segmentId: number) => {
    return useQuery<ISegmentAggregateInfo, IFetchError>('segment-aggregate-info', () => 
        getSegmentAgggregateInfo(segmentId));
};

export const useSegmentsUsers = (segmentId: number) => {
    return useQuery<ISegmentUserInfo, IFetchError>(['segment-users', segmentId], () => getSegmentUsersInfo(segmentId));
};

export const useSingleSegmentByName = (data: any, trigger: boolean) => {
    return useQuery<any, IFetchError>(
        'segment-by-segment-name',
        () => findSegmentByName(data),
        {
            enabled: trigger
        }
    );
};
