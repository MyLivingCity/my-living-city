import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { UserManagementContent } from 'src/components/content/UserManagementContent';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useAllUsers } from 'src/hooks/userHooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAllCommentFlags, useAllFlags } from 'src/hooks/flagHooks';
import { IUser } from 'src/lib/types/data/user.type';
import { ICommentFlag, IFlag } from 'src/lib/types/data/flag.type';
import { useIdeasWithBreakdown } from 'src/hooks/ideaHooks';
import { useProposalsWithBreakdown } from 'src/hooks/proposalHooks';
import { useAllComments } from 'src/hooks/commentHooks';
import { useAllBanDetails } from 'src/hooks/banHooks';
import { useAllSegments, useAllSuperSegments } from 'src/hooks/segmentHooks';

// Extends Route component props with idea title route param
interface UserManagementPropsLegacy extends RouteComponentProps<{}> {
    // Add custom added props here 
    users: IUser[];
    token: string | null;
    user: IUser | null;
    flags: IFlag[] | undefined;
    commentFlags: ICommentFlag | undefined;
}

const UserManagementPage: React.FC<UserManagementPropsLegacy> = ({ }) => {
    const { token } = useContext(UserProfileContext);
    const { user } = useContext(UserProfileContext);

    const { data: userData, isLoading: userLoading } = useAllUsers(token);
    const { data: ideaData, isLoading: ideaLoading } = useIdeasWithBreakdown(20);
    const { data: proposalData, isLoading: proposalLoading } = useProposalsWithBreakdown(20);
    const { data: commentData, isLoading: commentLoading } = useAllComments();
    const { data: flagData, isLoading: flagLoading } = useAllFlags(token);
    const { data: commentFlagData, isLoading: commentFlagLoading } = useAllCommentFlags(token);
    const { data: banData, isLoading: banLoading } = useAllBanDetails();
    const { data: segData = [], isLoading: segLoading } = useAllSuperSegments();
    const { data: subSegData = [], isLoading: subSegLoading } = useAllSegments();

    let flaggedUser: number[] = [];
    if (userLoading || ideaLoading || proposalLoading || commentLoading || flagLoading || commentFlagLoading || banLoading || segLoading || subSegLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }

    // TODO: Create non blocking error handling

    return (
        <div className='wrapper'>
            <UserManagementContent
                users={userData!}
                token={token}
                user={user}
                flags={flagData}
                commentFlags={commentFlagData}
                ideas={ideaData}
                proposals={proposalData}
                comments={commentData}
                bans={banData}
                segs={segData}
                subSeg={subSegData}
            />
        </div>
    );
};

export default UserManagementPage;