import { Container, Row, Col, Carousel } from "react-bootstrap";
import PlaceholderIdeaTile from "src/components/tiles/PlaceholderIdeaTile";
import { IIdeaWithAggregations } from "../../../lib/types/data/idea.type";
import IdeaTile from "../../tiles/IdeaTile";

interface NewAndTrendingProps {
  topIdeas: IIdeaWithAggregations[];
  postType?: string;
  isDashboard?: boolean;
}

const NewAndTrendingSection: React.FC<NewAndTrendingProps> = ({
  topIdeas,
  postType,
  isDashboard,
}) => {
  return (
    <Container className="system" id="hanging-icons">
      <style>
        {`
        .carousel-control-next,
        .carousel-control-prev {
            filter: invert(100%);
        }
        .carousel-control-next {
            right: -8rem;
        }
        .carousel-control-prev {
            left: -8rem;
        }
        .carousel-item.active, .carousel-item-next, .carousel-item-prev {
          display: flex;
        }
        .container {
          padding-left: 0;
          padding-right: 0;
        }
        .carousel-indicators {
          display: none;
        `}
      </style>
      {isDashboard ? (
        <h2 className="pb-1 border-bottom display-6">New and Trending</h2>
      ) : (
        <h2 className="pb-1 border-bottom display-6 text-center">
          New and Trending
        </h2>
      )}

      <Carousel controls={true} interval={null}>
        {[...Array(4)].map((x, i) => (
          <Carousel.Item key={i}>
            {topIdeas
              ? topIdeas.slice(i * 3, i * 3 + 3).map((idea) => (
                  <Col
                    key={idea.id}
                    md={6}
                    lg={4}
                    className="pt-3 align-items-stretch"
                  >
                    <IdeaTile
                      ideaData={idea}
                      showFooter={true}
                      postType="Idea"
                    />
                  </Col>
                ))
              : [...Array(12)].map((x, i) => (
                  <Col
                    key={i}
                    md={6}
                    lg={4}
                    className="pt-3 align-items-stretch"
                  >
                    <PlaceholderIdeaTile />
                  </Col>
                ))}
          </Carousel.Item>
        ))}
      </Carousel>
      <Row className="g-5 py-3 justify-content-center">
        {/* <a className='pt-5 text-align-center' href="/ideas">
          <h3>View all ideas and conversations</h3>
        </a> */}
      </Row>
    </Container>
  );
};

export default NewAndTrendingSection;
