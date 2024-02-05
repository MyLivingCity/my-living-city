import React from 'react';
import { Container, Row, Button} from 'react-bootstrap';
import NewAndTrendingSection from '../partials/LandingContent/NewAndTrendingSection';
import MyPosts from '../partials/DashboardContent/MyPosts';
import Notifications from '../partials/DashboardContent/Notifications';
import SystemUpdates from '../partials/DashboardContent/SystemUpdates';
import { useIdeasWithBreakdown, useIdeasHomepage, useUserFollowedIdeas, useUserIdeas, useUserEndorsedIdeas } from '../../hooks/ideaHooks';
import { IUser } from 'src/lib/types/data/user.type';
import { FindBanDetails, FindUndismissedPostBans, FindUndismissedCommentBans } from 'src/hooks/banHooks';
import { useAllComments } from 'src/hooks/commentHooks';
import { USER_TYPES } from 'src/lib/constants';
import { useQuarantinePostNotifications } from 'src/hooks/quarantinePostNotificationHooks';
import { useProposalsWithBreakdown } from 'src/hooks/proposalHooks';

interface LandingPageContentProps {
  user: IUser
  token: string;
}

const DashboardPageContent: React.FC<LandingPageContentProps> = ({user, token}) => {

  const {
    data: ideaData,
    error: ideaError,
    isLoading: ideaLoading,
    isError: ideaIsError,
  } = useIdeasWithBreakdown();

  const { 
    data: commentData,
    isLoading: commentLoading,
    error: commentError,
    isError: commentIsError
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
    isError: uIsError,
  } = useUserIdeas(user.id);

  const {
    data: pData,
    error: pError,
    isLoading: pLoading,
    isError: pIsError,
  } = useProposalsWithBreakdown();

  const {
    data: undismissedPostBansData,
    error: undismissedPostBansError,
    isLoading: undismissedPostBansLoading,
    isError: undismissedPostBansIsError
  } = FindUndismissedPostBans(user.id);

  const {
    data: undismissedCommentBansData,
    isLoading: undismissedCommentBansLoading,
    isError: undismissedCommentBansIsError
  } = FindUndismissedCommentBans(user.id);

  const {
    data: userFollowedIdeaData,
    error: userFollowedError,
    isLoading: userFollowedIsLoading,
    isError: userFollowedIsError
  } = useUserFollowedIdeas(user.id)

  const {
    data: userEndorsedIdeaData,
    error: userEndorsedError,
    isLoading: userEndorsedLoading,
    isError: userEndorsedIsError
  } = useUserEndorsedIdeas(user.id)

  const {
      data: userBannedData,
      isLoading: userBannedIsLoading,
      isError: userBannedIsError
    } = FindBanDetails(user.id);
    
  const {
    data: quarantinePostNotifications,
    error: quarantinePostNotificationsError,
    isLoading: quarantinePostNotificationsLoading,
    isError: quarantinePostNotificationsIsError
  } = useQuarantinePostNotifications();

  const canEndorse = (
    user &&
    user.userType === USER_TYPES.COMMUNITY ||
    user.userType === USER_TYPES.BUSINESS ||
    user.userType === USER_TYPES.MUNICIPAL
  );
  
  return (
    <Container className="landing-page-content">
      <Row as="article" className="featured"></Row>
      <Row as="article" className="system-messages">
        <Notifications
          isLoading={
            uLoading ||
            userBannedIsLoading ||
            commentLoading ||
            undismissedPostBansLoading ||
            undismissedCommentBansLoading ||
            quarantinePostNotificationsLoading
          }
          isError={
            uIsError ||
            userBannedIsError ||
            commentIsError ||
            undismissedPostBansIsError ||
            undismissedCommentBansIsError ||
            quarantinePostNotificationsIsError
          }
          userIdeas={userIdeaData}
          userBanInfo={userBannedData}
          userComments={commentData}
          userPostBans={undismissedPostBansData}
          userCommentBans={undismissedCommentBansData}
          userQuarantineNotifications={quarantinePostNotifications}
        />
      </Row>
      <Row as="article" className="new-and-trending">
        <MyPosts
          isLoading={pLoading || uLoading}
          isError={pIsError || uIsError}
          userIdeas={userIdeaData}
          userProposals={pData}
          numPosts={6}
          isDashboard={true}
        />
        <div className="" style={{ margin: '0rem 1rem 3rem 1rem' }}>
          <Button
            onClick={() => (window.location.href = '/dashboard/my-posts')}
            size="lg"
            disabled={pLoading || uLoading}
          >
            See More
          </Button>
        </div>
      </Row>

      <Row as="article" className="system-updates">
        <SystemUpdates
          header="Followed Posts"
          userIdeas={
            (ideaData ?? []).filter((idea) => {
              return (
                (userFollowedIdeaData ?? []).some((followedIdea) => {
                  return followedIdea.id === idea.id;
                })
              );
            })
          }
          proposals={pData!}
          isLoading={
            ideaLoading ||
            pLoading ||
            userFollowedIsLoading
          }
          isError={
            ideaIsError ||
            pIsError ||
            userFollowedIsError
          }
        />
      </Row>
      
      {canEndorse && 
        <>
          <br />
          <Row as="article" className="system-updates">
            <SystemUpdates
              header="Endorsed Posts"
              userIdeas={
                (ideaData ?? []).filter((idea) => {
                  return (
                    (userEndorsedIdeaData ?? []).some((endorsedIdea) => {
                      return endorsedIdea.id === idea.id;
                    })
                  );
                })
              }
              proposals={pData!}
              isLoading={
                ideaLoading ||
                pLoading ||
                userEndorsedLoading
              }
              isError={
                ideaIsError ||
                pIsError ||
                userEndorsedIsError
              }
            />
          </Row>    
        </>
      }
      <br />
      <Row as="article" className="new-and-trending">
        <NewAndTrendingSection
          topIdeas={topIdeasData!}
          isDashboard={true}
          isLoading={iLoading}
          isError={iIsError}
        />
      </Row>
    </Container>
  );
};

export default DashboardPageContent;
