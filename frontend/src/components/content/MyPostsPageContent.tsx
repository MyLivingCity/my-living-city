import React from "react";
import { Container, Row, Spinner } from "react-bootstrap";
import { IIdeaWithAggregations } from "../../lib/types/data/idea.type";
import { IFetchError } from "../../lib/types/types";
import NewAndTrendingSection from "../partials/LandingContent/NewAndTrendingSection";
import MyPosts from "../partials/DashboardContent/MyPosts";

import AdsSection from "../partials/LandingContent/AdsSection"; //
import { AdsSectionPage } from "src/pages/AdsSectionPage";
import Notifications from "../partials/DashboardContent/Notifications";
import SystemUpdates from "../partials/DashboardContent/SystemUpdates";
import LoadingSpinner from "../ui/LoadingSpinner";

interface LandingPageContentProps {
  userIdeas: any;
}

const MyPostsPageContent: React.FC<LandingPageContentProps> = ({
  userIdeas,
}) => {
  return (
    <Container className="landing-page-content">
      <Row as="article" className="featured"></Row>

      <Row as="article" className="new-and-trending">
        <MyPosts userIdeas={userIdeas!} numPosts={-1} isDashboard={false} />
      </Row>
    </Container>
  );
};

export default MyPostsPageContent;
