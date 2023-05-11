import React, { useContext, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { UserProfileContext } from "../../../contexts/UserProfile.Context";
import { updateIdeaNotificationStatus } from "src/lib/api/ideaRoutes";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import Notification from "./Notification";
import { IBanUser } from "src/lib/types/data/banUser.type";
import { IBanPost } from "src/lib/types/data/banPost.type";
import { IBanComment } from "src/lib/types/data/banComment.type";
import {
  dismissBanPostNotification,
  updateUserBan,
  dismissBanCommentNotification,
} from "src/lib/api/banRoutes";
import { ICommentAggregations } from "src/lib/types/data/comment.type";
import { updateCommentNotificationStatus } from "src/lib/api/commentRoutes";
import { IQuarantineNotification } from "src/lib/types/data/quarantinePostNotification.type";
import { dismissQuarantineNotification } from "src/lib/api/quarantinePostNotificationRoutes";
import LoadingSpinnerInline from "src/components/ui/LoadingSpinnerInline";

interface NotificationPageContentProps {
  userIdeas: IIdeaWithAggregations[] | undefined;
  userBanInfo: IBanUser | undefined;
  userComments: ICommentAggregations[] | undefined;
  userPostBans: IBanPost[] | undefined;
  userCommentBans: IBanComment[] | undefined;
  userQuarantineNotifications: IQuarantineNotification[] | undefined;
  isLoading?: boolean;
}

const Notifications: React.FC<NotificationPageContentProps> = ({
  userIdeas,
  userBanInfo,
  userComments,
  userPostBans,
  userCommentBans,
  userQuarantineNotifications,
  isLoading
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { user, token } = useContext(UserProfileContext);

  const dismissAll = async () => {
    if (userIdeas) {
      userIdeas?.map(async (userIdea) => {
        if (!userIdea.active && !userIdea.notification_dismissed) {
          await updateIdeaNotificationStatus(
            token,
            userIdea.authorId,
            userIdea.id.toString(),
            true
          );
          setIsDismissed(true);
        }
      });
    }

    if (userComments) {
      userComments?.map(async (userComment) => {
        if (!userComment.active && !userComment.notification_dismissed) {
          await updateCommentNotificationStatus(
            token,
            userComment.authorId,
            userComment.id.toString(),
            true
          );
        }
        setIsDismissed(true);
      });
    }

    if (userBanInfo && user!.banned) {
      userBanInfo!.notificationDismissed = true;
      await updateUserBan(userBanInfo!, token);
      setIsDismissed(true);
    }

    if (userPostBans) {
      userPostBans?.map(async (userPostBan) => {
        if (!userPostBan.notificationDismissed) {
          userPostBan!.notificationDismissed = true;
          await dismissBanPostNotification(userPostBan!.id, token);
        }
      });
      setIsDismissed(true);
    }

    if (userCommentBans) {
      userCommentBans?.map(async (userCommentBan) => {
        if (!userCommentBan.notificationDismissed) {
          userCommentBan!.notificationDismissed = true;
          await dismissBanCommentNotification(userCommentBan!.id, token);
        }
      });
      setIsDismissed(true);
    }

    if (userQuarantineNotifications) {
      userQuarantineNotifications?.map(async (quarantineNotification) => {
        console.log("IDS: ", quarantineNotification.userId, "\t", user!.id)
        if (!quarantineNotification.seen &&
          quarantineNotification.userId === user!.id) {
          quarantineNotification!.seen = true;
          await dismissQuarantineNotification(quarantineNotification!.id, token);
        }
      });
      setIsDismissed(true);
    }
  };

  // Check if there are any notifications
  const notifications: JSX.Element[] = [];

  // Check if there is ban info
  if (userBanInfo && !userBanInfo.notificationDismissed && user!.banned)
    notifications.push(<Notification userBanInfo={userBanInfo} />);

  if (userPostBans)
    userPostBans!
      .filter((bannedPost) => !bannedPost.notificationDismissed)
      .map((bannedPost) =>
        notifications.push(<Notification userPostBan={bannedPost} />)
      );

  if (userCommentBans)
    userCommentBans!
      .filter((bannedComment) => !bannedComment.notificationDismissed)
      .map((bannedComment) =>
        notifications.push(<Notification userCommentBan={bannedComment} />)
      );

  userIdeas!
    .filter((idea) => !idea.active && !idea.notification_dismissed)
    .map((idea, index) => notifications.push(<Notification userIdea={idea} />));

  if (userComments) {
    userComments!
      .filter(
        (comment) =>
          !comment.active &&
          comment.authorId === user!.id &&
          !comment.notification_dismissed
      )
      .map((comment, index) =>
        notifications.push(<Notification userComment={comment} />)
      );
  }

  if (userQuarantineNotifications) {
    console.log("userQuarantineNotifications", userQuarantineNotifications);
    userQuarantineNotifications!
      .filter(
        (quarantineNotification) =>
          quarantineNotification.seen == false &&
          quarantineNotification.userId == user!.id
      ).filter((quarantineNotification) => quarantineNotification != null)
      .map((quarantineNotification) =>
        // Check if there are no notifications

        notifications.push(
          <Notification userQuarantineNotification={quarantineNotification} />
        )
      );
      console.log(notifications);
  }
  return (
    <Container
      className="system"
      id="hanging-icons"
      // Top Right Bottom Left
      style={{ padding: "3rem 1rem 0rem 1rem", margin: "0 auto" }}
    >
      <style>
        {`
         td {
            border-top: 0.5px solid #d4d4d4 !important;
            border-bottom: 0.5px solid #d4d4d4 !important;
         }
         tr:hover {
           background-color: #e8ffe9;
           cursor: pointer;
        }
        h5 {
          display: inline;
        }
        `}
      </style>
      <div className="d-flex justify-content-between border-bottom display-6">
        <div className="col-example text-left">
          <h2 className="display-6">Notifications</h2>
        </div>
        <div className="col-example text-left">
          <Button onClick={async () => await dismissAll()}>Dismiss All</Button>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {!isDismissed && (
          <Table>
            <tbody key={Math.random()}>
              {isLoading ? notifications.map((notification, index) => {
                return <>{notification}</>;
              }) : <LoadingSpinnerInline/>}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default Notifications;
