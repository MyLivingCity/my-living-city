import { IComment } from './comment.type';

export interface IBanComment {
    id: number,
    banReason: string,
    banMessage?: string,
    bannedBy: string,
    createdAt: Date,

    // Relationships
    commentId: number,
    authorId: string

    // Optional
    notificationDismissed?: boolean
    comment?: IComment;
}