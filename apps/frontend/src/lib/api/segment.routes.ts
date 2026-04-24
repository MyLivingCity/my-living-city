import axios from "axios";
import { API_BASE_URL } from "../constants/constants";
import { type ISegment, type ISubSegment } from "@/lib/types/segment.types";

export const getAllSegments = async (): Promise<ISegment[]> => {
  const res = await axios.get<ISegment[]>(`${API_BASE_URL}/segment/getall`);
  return res.data;
};

export const getSingleSegmentBySegmentId = async (segmentId: number) => {
  const res = await axios.get<ISegment>(
    `${API_BASE_URL}/segment/getBySegmentId/${segmentId}`,
  );
  return res.data;
};

export const getAllSubSegmentsWithId = async (segId: any) => {
  const res = await axios.get<ISubSegment[]>(
    `${API_BASE_URL}/segment/getChildren/${segId}`,
  );
  return res.data;
};

export const getSingleSubSegmentBySubSegmentId = async (
  SubSegmentId: number | undefined,
) => {
  const res = await axios.get<ISubSegment>(
    `${API_BASE_URL}/segment/getBySubSegmentId/${SubSegmentId}`,
  );
  return res.data;
};

export const getSegmentAgggregateInfo = async (segmentId: number) => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/segment/aggregateInfo/${segmentId}`,
  });
  return res.data;
};

export const getSegmentUsersInfo = async (segmentId: number) => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/segment/usersInfo/${segmentId}`,
  });
  return res.data;
};

export const getAllSegmentsWithSuperSegId = async (
  superSegId: number | undefined,
): Promise<ISegment[]> => {
  const res = await axios.get<ISegment[]>(
    `${API_BASE_URL}/segment/getBySuperSegId/${superSegId}`,
  );
  return res.data;
};

export const getAllSuperSegmentsByCountryProvince = async (
  country: string,
  province: string,
) => {
  const res = await axios.get(
    `${API_BASE_URL}/superSegment/getByCountryProvince`,
    {
      params: { country, province },
    },
  );
  return res.data;
};

export const getAllSuperSegments = async () => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/segment/getByType/superSegment`,
  });
  return res.data;
};

export const findSubsegmentsBySegmentId = async (
  segId: number,
): Promise<ISubSegment[]> => {
  if (segId < 0) throw new Error("Invalid segment ID.");
  const res = await axios.get(
    `${API_BASE_URL}/subSegment/getBySegmentId/${segId}`,
  );
  return res.data;
};

export const findSegmentByName = async (segData: any) => {
  if (!segData.segName || !segData.province || !segData.country) {
    throw new Error("location parameters are needed");
  }
  const parsedPayload = { ...segData };
  const result = await axios({
    method: "post",
    url: `${API_BASE_URL}/segment/getByName`,
    data: parsedPayload,
  });

  return result.data;
};

export const findSegmentRequests = async (token: string | null) => {
  const result = await axios({
    method: "get",
    url: `${API_BASE_URL}/userSegmentRequest/getAll`,
    headers: { "x-auth-token": token, "Access-Control-Allow-Origin": "*" },
    withCredentials: true,
  });

  return result.data;
};
