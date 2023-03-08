import { IAddressInput } from "./address.input";
import { IGeoInput } from "./geo.input";
import { ISchoolDetailsInput } from "./schoolDetails.input";

export interface IRegisterInput {
  userRoleId?: number;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  fname?: string;
  lname?: string;
  address?: IAddressInput;
  geo?: IGeoInput;
  schoolDetails?: ISchoolDetailsInput;
  imagePath?: any;
  homeSegmentId?: number;
  workSegmentId?: number;
  schoolSegmentId?: number;
  homeSubSegmentId?: number;
  workSubSegmentId?: number;
  schoolSubSegmentId?: number;
  userType: string;
  reachSegmentIds: any[];
}
export interface IUserRegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  homeSegmentId?: number;
  workSegmentId?: number;
  schoolSegmentId?: number;
  homeSubSegmentId?: number;
  workSubSegmentId?: number;
  schoolSubSegmentId?: number;
}
export interface IUserSegment {
  homeSegmentName: string;
  workSegmentName: string;
  schoolSegmentName: string;
  homeSubSegmentName: string;
  workSubSegmentName: string;
  schoolSubSegmentName: string;
  homeSegmentId?: number;
  workSegmentId?: number;
  schoolSegmentId?: number;
  homeSubSegmentId?: number;
  workSubSegmentId?: number;
  schoolSubSegmentId?: number;
}
export interface IUserSegmentRegister {
  homeSegmentId?: number;
  workSegmentId?: number;
  schoolSegmentId?: number;
  homeSubSegmentId?: number;
  workSubSegmentId?: number;
  schoolSubSegmentId?: number;
}

export interface IUserSegmentRequest {
  userId: string;
  country: string;
  province: string;
  segmentName: string;
  subSegmentName: string;
}