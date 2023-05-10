import { Container, Row, Col, Breadcrumb } from "react-bootstrap";
import IdeaTile from "src/components/tiles/IdeaTile";
import PlaceholderIdeaTile from "src/components/tiles/PlaceholderIdeaTile";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";

interface MyPostsProps {
  userIdeas: IIdeaWithAggregations[];
  numPosts: number;
  isDashboard: boolean;
}

const MyPosts: React.FC<MyPostsProps> = ({
  userIdeas,
  numPosts,
  isDashboard,
}) => {
  let parsedPosts = userIdeas;
  if (numPosts > 0 && userIdeas) {
    parsedPosts = parsedPosts.slice(0, numPosts);
  }
  return (
    <Container
      className="container"
      id="hanging-icons"
      style={{
        padding: "2rem 1rem 1rem 1rem",
        margin: "0 auto",
      }}
    >
      {!isDashboard && (
        <>
          <style>
            {`
          .breadcrumb {
            padding-left: 0;
            background-color: #fff;
          }
          .container {
            padding: 1rem;
        `}
          </style>
          <Breadcrumb
            style={{
              backgroundColor: "fff",
            }}
          >
            <Breadcrumb.Item
              onClick={() => (window.location.href = "/dashboard")}
            >
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active>My Posts</Breadcrumb.Item>
          </Breadcrumb>
        </>
      )}

      <h2 className="pb-1 border-bottom display-6">My Posts</h2>
      <Row className="g-5 py-3 justify-content-center">
        {parsedPosts
          ? parsedPosts.map((idea: any) => (
              <Col
                key={idea.id}
                md={6}
                lg={4}
                className="pt-3 align-items-stretch"
              >
                <IdeaTile ideaData={idea} showFooter={true} postType="Idea" />
              </Col>
            ))
          : [...Array(6)].map((x, i) => (
              <Col key={i} md={6} lg={4} className="pt-3 align-items-stretch">
                <PlaceholderIdeaTile />
              </Col>
            ))}
        {/* <a className='pt-5 text-align-center' href="/ideas">
          <h3>View all ideas and conversations</h3>
        </a> */}
      </Row>
    </Container>
  );
};

export default MyPosts;
