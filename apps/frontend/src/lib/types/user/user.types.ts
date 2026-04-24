import { type IGeo } from "src/lib/types/user/geo.types";
import { type IUserRole } from "src/lib/types/user/userRole.types";
import { type IAddress } from "src/lib/types/user/address.types";
import { type IComment } from "src/lib/types/user/comment.types";
import { type IUserSegment } from "src/lib/types/segment.types";
import { type IUserHandle } from "src/lib/types/user/userHandle.types";
import { USER_TYPES } from "src/lib/constants/constants";

//'ADMIN' | 'MOD' | 'SEG_ADMIN' | 'SEG_MOD' | 'MUNICIPAL_SEG_ADMIN' | 'BUSINESS' | 'NORMAL';
export interface IUser {
  id: string;
  userRoleId?: number;
  userType: typeof USER_TYPES;
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
