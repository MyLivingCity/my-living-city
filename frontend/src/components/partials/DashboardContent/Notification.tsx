import { useContext, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { UserProfileContext } from '../../../contexts/UserProfile.Context';
import { updateIdeaNotificationStatus } from 'src/lib/api/ideaRoutes';
import { IIdea } from 'src/lib/types/data/idea.type';
import { IBanUser } from 'src/lib/types/data/banUser.type';
import { dismissBanPostNotification, updateUserBan, dismissBanCommentNotification } from 'src/lib/api/banRoutes';
import { IComment } from 'src/lib/types/data/comment.type';
import { updateCommentNotificationStatus } from 'src/lib/api/commentRoutes';
import { IBanPost } from 'src/lib/types/data/banPost.type';
import { IBanComment } from 'src/lib/types/data/banComment.type';
import { IQuarantineNotification } from 'src/lib/types/data/quarantinePostNotification.type';
import { dismissQuarantineNotification } from 'src/lib/api/quarantinePostNotificationRoutes';

interface NotificationProps {
    userIdea?: IIdea | undefined;
    userBanInfo?: IBanUser | undefined;
    userComment?: IComment | undefined;
    userPostBan?: IBanPost | undefined;
    userCommentBan?: IBanComment | undefined;
    userQuarantineNotification?: IQuarantineNotification | undefined;
}

const Notification: React.FC<NotificationProps> = ({ userIdea, userBanInfo, userComment, userPostBan, userCommentBan, userQuarantineNotification }) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [notificationType, setNotificationType] = useState('');
    const { user, token } = useContext(UserProfileContext);
    
    // Set the notification type
    const notiType = (userIdea: IIdea | undefined, userBanInfo: IBanUser | undefined, userComment: IComment | undefined, userPostBan: IBanPost | undefined, userCommentBan: IBanComment | undefined, userQuarantineNotification: IQuarantineNotification | undefined) => {
        if (userIdea) {
            setNotificationType('userIdea');
        } if (userBanInfo) {
            setNotificationType('userBanInfo');
        } if (userComment) {
            setNotificationType('userComment');
        } if (userPostBan) {
            setNotificationType('userPostBan');
        } if (userCommentBan) {
            setNotificationType('userCommentBan');
        } if (userQuarantineNotification) {
            setNotificationType('userQuarantineNotification');
        }
    };
    // Render only once
    useEffect(() => {
        notiType(userIdea, userBanInfo, userComment, userPostBan, userCommentBan, userQuarantineNotification);
    }, []);

    const banType = () => {
        switch (userBanInfo?.banType) {
            case 'WARNING':
                return 'Warned';
            case 'POST_BAN':
                return 'Banned from posting';
            case 'SYS_BAN':
                return 'Banned from the system';
        }
    };


    const dismissIdeaNotification = async (ideaId: number, token: string, userId: string, notification_dismissed: boolean) => {
        setNotificationType('userIdea');
        userIdea!.notification_dismissed = true;
        await updateIdeaNotificationStatus(token, userId, ideaId.toString(), notification_dismissed);
        setIsDismissed(true);
    };

    const dismissBanNotification = async () => {
        setNotificationType('userBanInfo');
        userBanInfo!.notificationDismissed = true;
        await updateUserBan(userBanInfo!, token);
        setIsDismissed(true); 
    };

    const dismissPostBanNotification = async () => {
        setNotificationType('userPostBan');
        userPostBan!.notificationDismissed = true;
        await dismissBanPostNotification(userPostBan!.id, token);
        setIsDismissed(true); 
    };

    const dismissCommentBanNotification = async () => {
        setNotificationType('userCommentBan');
        userCommentBan!.notificationDismissed = true;
        await dismissBanCommentNotification(userCommentBan!.id, token);
        setIsDismissed(true); 
    };

    const dismissCommentNotification = async (token: string, userId: string, commentId: number, notification_dismissed: boolean) => {
        setNotificationType('userComment');
        userComment!.notification_dismissed = true;
        await updateCommentNotificationStatus(token, userId, commentId.toString(), notification_dismissed );
        setIsDismissed(true);
    };

    const dismissPostQuarantineNotification = async () => {
        setNotificationType('userQuarantineNotification');
        userQuarantineNotification!.seen = true;
        await dismissQuarantineNotification(userQuarantineNotification!.id, token);
        setIsDismissed(true);
    };

    switch (notificationType) {
        case 'userIdea':
            return (
                <tr >
                    {!isDismissed ? (
                        <td className='col-md'>
                            <div className='d-flex align align-items-center justify-content-between'>
                                <span>
                                    {'Your post named '} <b>{userIdea?.title}</b> {' has been quarantined pending moderator review.'}
                                </span>
                                <div className={'float-right'}>
                                    <Button onClick={async () => await dismissIdeaNotification(userIdea!.id, token!, user!.id, true)}>Dismiss</Button>
                                </div>
                            </div>
                        </td>
                    ) :
                        null
                    }
                </tr>
            );
        case 'userBanInfo':
            return (
                <tr>
                    {!isDismissed ? (
                        <td className='col-md'>
                            <div className='d-flex align align-items-center justify-content-between'>
                                <span>
                                    {'You have been '} <b>{banType()}</b> {' until '} <b>{(userBanInfo?.banUntil && new Date(userBanInfo!.banUntil).toLocaleString())}</b>.
                                    <br/><b>Mod Message:</b> {userBanInfo?.banMessage}
                                    <br/><b>Ban Reason:</b> {userBanInfo?.banReason}
                                </span>
                                <div className='float-right'>
                                    <Button onClick={async () => await dismissBanNotification()}>Dismiss</Button>
                                </div>
                            </div>
                        </td>
                    )
                        :
                        null

                    }
                </tr>
            );
        case 'userComment':
            return (
                <tr>
                    {!isDismissed ? (
                        <td className='col-md'>
                            <div className='d-flex align align-items-center justify-content-between'>
                                <span>
                                    {'Your comment '} <b>{userComment?.content}</b> {' has been quarantined pending moderator review.'}
                                </span>
                                <div className='float-right'>
                                    <Button onClick={async () => await dismissCommentNotification(token!, user!.id, userComment!.id,  true)}>Dismiss</Button>
                                </div>
                            </div>
                        </td>
                    )
                        :
                        null

                    }
                </tr>
            );

        case 'userPostBan':
            return (
                <tr>
                    {!isDismissed ? (
                        <td className='col-md'>
                            <div className='d-flex align align-items-center justify-content-between'>
                                <span>
                                    {'Your post '}<b>{userPostBan?.post?.title}</b> {' has been reviewed and banned by a moderator'}
                                    <br/><b>Ban Reason:</b> {userPostBan?.banReason}
                                    <br/><b>Mod Message:</b> {userPostBan?.banMessage}
                                </span>
                                <div className='float-right'>
                                    <Button onClick={async () => await dismissPostBanNotification()}>Dismiss</Button>
                                </div>
                            </div>
                        </td>

                    )
                        :
                        null

                    }
                </tr>
            );
        
        case 'userCommentBan':
            return (
                <tr>
                    {!isDismissed ? (
                        <td className='col-md'>
                            <div className='d-flex align align-items-center justify-content-between'>
                                <span>
                                    {'Your comment '}<b>{userCommentBan?.comment?.content}</b> {' has been reviewed and banned by a moderator'}
                                    <br/><b>Ban Reason:</b> {userCommentBan?.banReason}
                                    <br/><b>Mod Message:</b> {userCommentBan?.banMessage}
                                </span>
                                <div className='float-right'>
                                    <Button onClick={async () => await dismissCommentBanNotification()}>Dismiss</Button>
                                </div>
                            </div>
                        </td>

                    )
                        :
                        null

                    }
                </tr>
            );
        case 'userQuarantineNotification':
            return (
                <tr>
                    {!isDismissed ? (
                        <td className='col-md'>
                            <div className='d-flex align align-items-center justify-content-between'>
                                <span>
                                    {'Your post '}<b>{userQuarantineNotification?.ideaTitle}</b> {' has been reviewed and released from quarantine by a moderator'}
                                    <br />{'Day unquarantined: '}<b>{(userQuarantineNotification?.createdAt)?.toString().replace('Z','').replace('T','').substring(0, 10)}</b>
                                </span>
                                <div className='float-right'>
                                    <Button onClick={async () => await dismissPostQuarantineNotification()}>Dismiss</Button>
                                </div>
                            </div>
                        </td>

                    ) : null}
                </tr>
            );


        
        default:
            return (
                <tr>
                    <div className='d-flex align align-items-center justify-content-between'>
                        <>
                            <td>Failed to load notification</td>
                        </>
                    </div>
                </tr>
            );
    }
};

export default Notification;