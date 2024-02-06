import { IGeo } from "./geo.type";
import { IUserRole } from "./userRole.type";
import { IAddress } from "./address.type";
import { IComment } from "./comment.type";
import { USER_TYPES } from "src/lib/constants";
import { IUserSegment } from "./segment.type";
//'ADMIN' | 'MOD' | 'SEG_ADMIN' | 'SEG_MOD' | 'MUNICIPAL_SEG_ADMIN' | 'BUSINESS' | 'NORMAL';
export interface IUser {
  id: string;
  userRoleId?: number;
  userType: USER_TYPES;
  email: string;
  password?: string;
  organizationName?: string;
  fname?: string;
  lname?: string;
  banned: boolean;
  reviewed: boolean;
  imagePath?: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  verifiedToken?: string;
  displayFName?: string;
  displayLName?: string;
  status: boolean;

  // Relationships can be nullable
  geo?: IGeo;
  work_geo?: IGeo;
  school_geo?: IGeo;
  address?: IAddress;
  userRole?: IUserRole;
  userSegments?: IUserSegment;
  IdeaComments?: IComment[];
}
