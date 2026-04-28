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

export interface ISuperSegment {
  superSegId: number;
  name: string;
  country: string;
  province: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSegment {
  id: number;
  userId: string;
  userSegmentRelationship: UserSegmentRelationshipEnum;
  segmentId: number;
  segment?: ISegment;
}

export interface IParsedSegment {
  segId: number;
  name: string;
  segmentType: "subSegment" | "segment" | "superSegment";
}

export type UserSegmentRelationshipEnum = "HOME" | "SCHOOL" | "WORK";

export type CheckBoxItem = {
  label: string | undefined;
  value: number | "SuperSeg";
  children?: CheckBoxItem[];
};

export interface SegmentGroup {
  superSegment?: ISegment;
  segment?: ISegment;
  subSegment?: ISegment;
}

export interface SegmentsByRelation {
  homeSegments: SegmentGroup;
  workSegments: SegmentGroup;
  schoolSegments: SegmentGroup;
}
