import { USER_TYPES } from 'src/lib/constants';
import type { IGeo } from 'src/types/geo.type';
import type { IAddress } from 'src/types/address.type';
import type { IComment } from 'src/types/comment.type';
import type { IUserRole } from 'src/types/userRole.type';
import type { IUserSegment } from 'src/types/segment.types';
import type { IUserHandle } from 'src/types/userHandleType';
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
  adminmodEmail?: string;
  status?: boolean;
  isSubGroupManager?: boolean;
  publicProfileVisible?: boolean;

  // Relationships can be nullable
  geo?: IGeo;
  work_geo?: IGeo;
  school_geo?: IGeo;
  address?: IAddress;
  userRole?: IUserRole;
  userSegment?: IUserSegment[];
  userSegments?: IUserSegment[];
  userHandles?: IUserHandle[];
  IdeaComments?: IComment[];
  userReach?: {
    id?: string;
    userId: string;
    segId: number;
  }[];
}