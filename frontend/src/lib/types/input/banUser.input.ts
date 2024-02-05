import { BAN_USER_TYPES } from 'src/lib/constants';

export interface IBanUserInput {
    userId: string;
    banType: BAN_USER_TYPES;
    banDuration: number;
    banReason: string;
    banMessage: string;
}
