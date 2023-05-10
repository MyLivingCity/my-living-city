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

interface LandingPageContentProps {
  topIdeas: IIdeaWithAggregations[] | undefined;
  ideasLoading: boolean;
  ideasIsError: boolean;
  ideasError: IFetchError | null;
  userIdeas: any;
}

const DashboardPageContent: React.FC<LandingPageContentProps> = ({
  topIdeas,
  ideasLoading,
  ideasIsError,
  ideasError,
  userIdeas,
}) => {
  return (
    <Container className="landing-page-content">
      <Row as="article" className="featured"></Row>
      <Row as="article" className="system-messages">
        <Notifications />
      </Row>
      <Row as="article" className="new-and-trending">
        <MyPosts userIdeas={userIdeas!} numPosts={6} isDashboard={true} />
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
        <NewAndTrendingSection topIdeas={topIdeas!} isDashboard={true} />
      </Row>
      <Row as="article" className="system-updates">
        <SystemUpdates topIdeas={topIdeas!} />
      </Row>
    </Container>
  );
};

export default DashboardPageContent;
