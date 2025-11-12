import { IUser } from './user.type';
import { ISegment } from './segment.type';

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

export interface ISubGroupMember {
	id: string;
	userId: string;
	subGroupId: string;
	status: 'APPROVED' | 'REJECTED' | 'PENDING';
	joinedAt: string;
	updatedAt: string;
	user: IUser; 
};