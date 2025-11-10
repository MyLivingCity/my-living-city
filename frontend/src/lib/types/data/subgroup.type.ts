import { StringLiteral } from 'typescript';
import { PrivacyField, TypeField } from 'src/lib/constants'; // Assuming you export enums from a shared file
import { ISegment } from './segment.type';
import { IUser } from './user.type';
import { MembershipStatus } from 'src/lib/constants'; 

export interface ISubGroup {
  id: string;                     // cuid() generated ID
  name: string;                    // Name of the subgroup
  description?: string;            // Optional description

  privacyField: PrivacyField;      // Enum: PUBLIC | PRIVATE | TEST
  typeField: TypeField;            // Enum: VIRTUAL | NESTED
  createdAt: Date;                 // Timestamp
  updatedAt: Date;                 // Timestamp

  regionId: number;                // FK to Segments (region)
  segmentId?: number;              // FK to Segments (segment)
  subSegmentId?: number;           // FK to Segments (subsegment)

  managerId: string;               // FK to User
  manager: IUser;                   // Manager user object

  region: ISegment;                // Related segment for region
  segment?: ISegment;              // Related segment for segment
  subSegment?: ISegment;           // Related segment for subsegment

  members: ISubGroupMember[];      // Array of members
}

export interface ISubGroupMember {
  id: string;                      // cuid() generated ID
  userId: string;                   // FK to User
  subGroupId: string;               // FK to SubGroup

  status: MembershipStatus;        // Enum: PENDING | APPROVED | REJECTED
  joinedAt: Date;                   // Join timestamp
  updatedAt: Date;                  // Update timestamp

  user: IUser;                      // Related User object
  subGroup: ISubGroup;              // Related SubGroup object
}

