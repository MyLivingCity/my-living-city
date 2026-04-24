import { useQuery } from "react-query";
import {
  findSegmentRequests,
  getAllSegments,
  getSingleSegmentBySegmentId,
  getSingleSubSegmentBySubSegmentId,
  getAllSuperSegments,
  getSegmentAgggregateInfo,
  findSegmentByName,
  getSegmentUsersInfo,
  getAllSubSegmentsWithId,
} from "src/lib/api/segment.routes";
import { type IFetchError } from "src/lib/types/general/error.types";
import {
  type ISegment,
  type ISubSegment,
  type ISegmentRequest,
  type ISuperSegment,
  type ISegmentAggregateInfo,
  type ISegmentUserInfo,
  type SegmentNameQuery,
} from "@/lib/types/segment.types";

export const useAllSegments = () => {
  return useQuery<ISegment[], IFetchError>("segments", getAllSegments);
};

export const useAllSuperSegments = () => {
  return useQuery<ISuperSegment[], IFetchError>(
    "superSegments",
    getAllSuperSegments,
  );
};

export const useAllSubSegmentsWithId = (segId: number) => {
  return useQuery<ISubSegment[]>(["subSegments", segId], () =>
    getAllSubSegmentsWithId(segId),
  );
};
export const useAllSegmentRequests = (token: string | null) => {
  return useQuery<ISegmentRequest[]>(["segRequests", token], () =>
    findSegmentRequests(token),
  );
};

export const useSingleSegmentBySegmentId = (segmentId: number) => {
  return useQuery<ISegment, IFetchError>(["segmentId", segmentId], () =>
    getSingleSegmentBySegmentId(segmentId),
  );
};

export const useSingleSubSegmentBySubSegmentId = (
  subSegmentId: number | undefined,
) => {
  return useQuery<ISubSegment, IFetchError>(
    ["subSegmentId", subSegmentId],
    () => getSingleSubSegmentBySubSegmentId(subSegmentId),
  );
};

export const useSegmentInfoAggregate = (segmentId: number) => {
  return useQuery<ISegmentAggregateInfo, IFetchError>(
    "segment-aggregate-info",
    () => getSegmentAgggregateInfo(segmentId),
  );
};

export const useSegmentsUsers = (segmentId: number) => {
  return useQuery<ISegmentUserInfo, IFetchError>(
    ["segment-users", segmentId],
    () => getSegmentUsersInfo(segmentId),
  );
};

export const useSingleSegmentByName = (
  data: SegmentNameQuery,
  trigger: boolean,
) => {
  return useQuery<SegmentNameQuery, IFetchError>(
    "segment-by-segment-name",
    () => findSegmentByName(data),
    {
      enabled: trigger,
    },
  );
};
