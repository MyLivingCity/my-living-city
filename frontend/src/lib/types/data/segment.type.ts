export interface ISegment {
  segId: number;
  superSegId: number;
  country: string;
  province: string;
  name: string;
  superSegName?: string;
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
export interface ISuperSegment {
  superSegId: number;
  name: string;
  country: string;
  province: string;
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
export interface IUserSegment {
  id: number;
  homeSegmentId: number;
  homeSegmentName: string;
  workSegmentId: number;
  workSegmentName: string;
  schoolSegmentId: number;
  schoolSegmentName: string;
  homeSubSegmentId: number;
  homeSubSegmentName: string;
  workSubSegmentId: number;
  workSubSegmentName: string;
  schoolSubSegmentId: number;
  schoolSubSegmentName: string;
  homeSegHandle: string;
  workSegHandle: string;
  schoolSegHandle: string;
}

export interface ISegmentData {
  id: number;
  name: string;
  segType: "Segment" | "Sub-Segment" | "Super-Segment";
  userType: "Resident" | "Worker" | "Student";
}

export interface ISegmentAggregateInfo {
  totalUsers: number,
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
