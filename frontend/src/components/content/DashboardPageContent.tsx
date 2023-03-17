import React from "react";
import { Container, Row, Spinner, Button, Carousel } from "react-bootstrap";
import { IIdeaWithAggregations } from "../../lib/types/data/idea.type";
import { IFetchError } from "../../lib/types/types";
import NewAndTrendingSection from "../partials/LandingContent/NewAndTrendingSection";
import MyPosts from "../partials/DashboardContent/MyPosts";

import AdsSection from "../partials/LandingContent/AdsSection"; //
import { AdsSectionPage } from "src/pages/AdsSectionPage";
import Notifications from "../partials/DashboardContent/Notifications";
import SystemUpdates from "../partials/DashboardContent/SystemUpdates";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useIdeasHomepage, useUserFollowedIdeas, useUserIdeas, useUserEndorsedIdeas } from "../../hooks/ideaHooks";
import { IUser } from "src/lib/types/data/user.type";
import { FindBanDetails, FindUndismissedPostBans, FindUndismissedCommentBans } from "src/hooks/banHooks";
import { useAllComments } from "src/hooks/commentHooks";
import { USER_TYPES } from "src/lib/constants";
import { useQuarantinePostNotifications } from "src/hooks/quarantinePostNotificationHooks";

interface LandingPageContentProps {
  user: IUser
  token: string;
}

const DashboardPageContent: React.FC<LandingPageContentProps> = ({user, token}) => {

  const { 
    data: commentData,
    isLoading: commentLoading,
    error: commentError
  } = useAllComments();

  const {
    data: topIdeasData,
    error: iError,
    isLoading: iLoading,
    isError: iIsError,
  } = useIdeasHomepage();

  const {
    data: userIdeaData,
    error: uError,
    isLoading: uLoading,
  } = useUserIdeas(user.id);

  const {
    data: undismissedPostBansData,
    error: undismissedPostBansError,
    isLoading: undismissedPostBansLoading,
  } = FindUndismissedPostBans(user.id);

  const {
    data: undismissedCommentBansData,
    isError: undismissedCommentBansError,
    isLoading: undismissedCommentBansLoading
  } = FindUndismissedCommentBans(user.id);

  const {
    data: userFollowedIdeaData,
    error: userFollowedError,
    isLoading: userFollowedLoading,
  } = useUserFollowedIdeas(user.id)

  const {
    data: userEndorsedIdeaData,
    error: userEndorsedError,
    isLoading: userEndorsedLoading,
  } = useUserEndorsedIdeas(user.id)

  const {
      data: userBannedData,
      isError: userBannedDataError,
      isLoading: userBannedDataLoading
    } = FindBanDetails(user.id);
    
  const {
    data: quarantinePostNotifications,
    error: quarantinePostNotificationsError,
    isLoading: quarantinePostNotificationsLoading
  } = useQuarantinePostNotifications();

  const canEndorse = (
    user &&
    user.userType === USER_TYPES.COMMUNITY ||
    user.userType === USER_TYPES.BUSINESS ||
    user.userType === USER_TYPES.MUNICIPAL
  );

  if (iLoading || uLoading || userFollowedLoading || userEndorsedLoading || userBannedDataLoading || commentLoading || undismissedPostBansLoading || undismissedCommentBansLoading || quarantinePostNotificationsLoading) {
    return <LoadingSpinner />;
  }

  if (iError || iIsError || uError || userFollowedError || (canEndorse && userEndorsedError) || userBannedDataError || commentError || undismissedPostBansError || undismissedCommentBansError || quarantinePostNotificationsError) {
    return <div>Error when fetching necessary data</div>;
  }

  
  return (
    <Container className="landing-page-content">
      <Row as="article" className="featured"></Row>
      <Row as="article" className="system-messages">
        <Notifications userIdeas={userIdeaData} userBanInfo={userBannedData} userComments={commentData} userPostBans={undismissedPostBansData} userCommentBans={undismissedCommentBansData} userQuarantineNotifications={quarantinePostNotifications}/>
      </Row>
      <Row as="article" className="new-and-trending">
        <MyPosts userIdeas={userIdeaData!} numPosts={6} isDashboard={true} />
        <div className="" style={{ margin: "0rem 1rem 3rem 1rem" }}>
          <Button
            onClick={() => (window.location.href = "/dashboard/my-posts")}
            size="lg"
          >
            See More
          </Button>
        </div>
      </Row>
      <Row as="article" className="new-and-trending">
        <NewAndTrendingSection topIdeas={topIdeasData!} isDashboard={true} />
      </Row>
      <br/><br/>
      <Row as="article" className="system-updates">
      <SystemUpdates userFollowedideas={
            // Concat userFollowedIdeaData and userEndorsedIdeaData w/o duplicates
            userFollowedIdeaData!.concat(userEndorsedIdeaData!.filter((idea) => {
              return !userFollowedIdeaData!.some((idea2) => {
                return idea2.id === idea.id
              })
            }))
          }
          endorser={canEndorse} 
          />
        </Row>
    </Container>
  );
};

export default DashboardPageContent;
