import React from "react";
import { Container, Row } from "react-bootstrap";
import MyPosts from "../partials/DashboardContent/MyPosts";


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
