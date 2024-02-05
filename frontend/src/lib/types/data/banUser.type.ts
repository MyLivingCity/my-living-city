import { BAN_USER_TYPES } from 'src/lib/constants';

export interface IBanUser {
    id: number,
    banType: BAN_USER_TYPES,
    banReason: string,
    banMessage?: string,
    bannedBy: string,
    createdAt: Date,
    banUntil: Date,

    // Relationships
    userId: string,

    // Optional
    notificationDismissed?: boolean
}

export interface IBanUserInfo {
    id: number,
    banType: BAN_USER_TYPES,
    banReason: string,
    banMessage?: string,
    bannedBy: string,
    createdAt: Date,
    banUntil: Date,
    email: string,
    firstName: string,
    lastName: string,
    userType: string,
    banDuration: number,
}