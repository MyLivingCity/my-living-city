import { StringLiteral } from 'typescript';
import { IUser } from './user.type';

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
  createdAt: Date
  updatedAt: Date;
  segmentType: SegmentType;
}
export interface ISubSegment {
  id: number;
  segId: number;
  parentId: number;
  name: string;
  lat: number;
  lon: number;
  radius: number;
  createdAt: Date;
  updatedAt: Date;
  superSegment?: ISuperSegment;
  subSegments?: ISubSegment[];
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
  userId: string;
  userSegmentRelationship: UserSegmentRelationshipEnum;
  segmentId: number;
  segment?: ISegment;
}

export interface ISegmentData {
  id: number;
  name: string;
  segType: 'Segment' | 'Sub-Segment' | 'Super-Segment';
  userType: 'Resident' | 'Worker' | 'Student';
}

export interface IParsedSegment {
  segId: number;
  name: string;
  segmentType: 'subSegment' | 'segment' | 'superSegment';
}

export enum SegmentType {
  subSegment = 'subSegment',
  segment = 'segment',
  superSegment = 'superSegment',
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

export interface ISegmentUserInfo {
  segId: string;
  totalUsers: number;
  users: IUser[];
  segment: ISegment;
  residents: IUser[];
  workers: IUser[];
  students: IUser[];
}

export enum UserSegmentRelationshipEnum {
  HOME = 'HOME',
  SCHOOL = 'SCHOOL',
  WORK = 'WORK',
}

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