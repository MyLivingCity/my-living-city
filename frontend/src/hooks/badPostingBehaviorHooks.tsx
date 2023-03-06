import { useQuery } from "react-query";
import { IFetchError } from "../lib/types/types";

import { getMostRecentUserBan, getUserBanWithToken, getAllBan, unbanUsersWithExpiredBans, getUndismissedPostBans, getUndismissedCommentBans, getPostBan, getCommentBan } from "src/lib/api/banRoutes"
import { getBadPostingBehavior } from "src/lib/api/badPostingBehaviorRoutes";
import { IBadPostingBehavior } from "src/lib/types/data/badPostingBehavior.type";

// find if the user is post_comment_banned is true
export const FindBadPostingBehaviorDetails = (token: string | null) => {
    return useQuery<IBadPostingBehavior, IFetchError>(
        ["badPostingBehavior", token], 
        () => getBadPostingBehavior(token)
        );
};