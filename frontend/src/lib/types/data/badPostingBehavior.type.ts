//create interface for bad_posting_behavior table
export interface IBadPostingBehavior {
    id: number;
    bad_post_count: number;
    post_flag_count: number;
    post_comment_ban: boolean;
    bannedAt: Date;
    bannedUntil: Date;
    userId: string;
}
