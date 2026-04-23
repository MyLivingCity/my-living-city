import axios from "axios";
import { API_BASE_URL } from "../constants/constants";
import { type ISegment, type ISubSegment } from "@/lib/types/segment.types";

export const getAllSegments = async (): Promise<ISegment[]> => {
  const res = await axios.get<ISegment[]>(`${API_BASE_URL}/segment/getall`);
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

export const getAllSegmentsWithSuperSegId = async (
  superSegId: number | undefined,
): Promise<ISegment[]> => {
  const res = await axios.get<ISegment[]>(
    `${API_BASE_URL}/segment/getBySuperSegId/${superSegId}`,
  );
  return res.data;
};
