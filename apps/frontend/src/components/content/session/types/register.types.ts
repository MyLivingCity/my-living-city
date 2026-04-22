export interface IAddressInput {
  streetAddress: string;
  streetAddress2?: string;
  city?: string;
  postalCode: string;
  country?: string;
}

export interface IGeoInput {
  lat?: number | null;
  lon?: number | null;
  work_lat?: number | null;
  work_lon?: number | null;
  school_lat?: number | null;
  school_lon?: number | null;
}

export interface IWorkDetailsInput {
  streetAddress: string;
  postalCode: string;
  company: string;
}

export interface ISchoolDetailsInput {
  streetAddress: string;
  postalCode: string;
  faculty: string;
  programCompletionDate?: Date | null;
}

export interface IRegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  fname?: string;
  lname?: string;
  address?: IAddressInput;
  geo?: IGeoInput;
  schoolDetails?: ISchoolDetailsInput;
  workDetails?: IWorkDetailsInput;
  verified?: boolean;
  imagePath?: string;
  homeSegmentId?: number | null;
  workSegmentId?: number | null;
  schoolSegmentId?: number | null;
  homeSubSegmentId?: number | null;
  workSubSegmentId?: number | null;
  schoolSubSegmentId?: number | null;
  userType: string;
  reachSegmentIds: number[];
  communityType?: string;
}

export type SegmentRequest = {
  country: string;
  province: string;
  segmentName: string;
  subSegmentName: string;
};
