import type { ISegment } from "src/types/segment.types";
import type { IUser } from "src/types/user.types";

export interface UserSubGroupCardRequestProps {
    token: string;
    subGroupId: string;
    joinRequests: ISubGroupMember[] | undefined;
    rejectedUsers: ISubGroupMember[] | undefined;
    refetchUsersInSubGroup: () => void; 
}

export interface ISubGroupMember {
	id: string;
	userId: string;
	subGroupId: string;
	status: 'APPROVED' | 'REJECTED' | 'PENDING';
	joinedAt: string;
	updatedAt: string;
	user: IUser; 
};

export interface ISubGroup {
	id: string;
	name: string;
	description?: string;

	isVirtual: boolean;
	isPrivate: boolean;
	privacyField: 'PRIVATE' | 'PUBLIC' | 'TEST';

	createdAt: string;
	updatedAt: string;

	region?: ISegment;
	segment?: ISegment;
	subSegment?: ISegment;

	managerId: string;
};