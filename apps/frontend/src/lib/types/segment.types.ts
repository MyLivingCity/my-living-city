import { type IUser } from "src/lib/types/user/user.types";

export interface ISegment {
  segId: number;
  parentId: number;
  parentSegment?: ISegment;
  name: string;
  country: string;
  province: string;
  lat: number;
  lon: number;
  radius: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubSegment {
  id: number;
  segId: number;
  name: string;
  lat: number;
  lon: number;
  radius: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISegmentRequest {
  id: number;
  userId: string;
  country: string;
  province: string;
  segmentName: string;
  subSegmentName: string;
}

export interface ISuperSegment {
  superSegId: number;
  name: string;
  country: string;
  province: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISegmentAggregateInfo {
  totalUsers: number;
  residents: number;
  workers: number;
  students: number;
  ideas: number;
  proposals: number;
  projects: number;
  superSegmentName: string;
  subSegmentsCount: number;
  subSegments: string[];
}

export interface IUserSegment {
  id: number;
  userId: string;
  userSegmentRelationship: typeof UserSegmentRelationship;
  segmentId: number;
  segment?: ISegment;
}

export interface ISegmentUserInfo {
  segId: string;
  totalUsers: number;
  users: IUser[];
  segment: ISegment;
  residents: IUser[];
  workers: IUser[];
  students: IUser[];
}

export interface IParsedSegment {
  segId: number;
  name: string;
  segmentType: "subSegment" | "segment" | "superSegment";
}

export type SegmentNameQuery = {
  segName: string;
  province: string;
  country: string;
};

export type CheckBoxItem = {
  label: string | undefined;
  value: number | "SuperSeg";
  children?: CheckBoxItem[];
};

// ENUMS
export const UserSegmentRelationship = {
  HOME: "HOME",
  SCHOOL: "SCHOOL",
  WORK: "WORK",
};
