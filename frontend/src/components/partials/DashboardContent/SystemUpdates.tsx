import { Container, Row, Col, Carousel } from "react-bootstrap";
import IdeaTile from "src/components/tiles/IdeaTile";
import PlaceholderIdeaTile from "src/components/tiles/PlaceholderIdeaTile";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";

interface SystemUpdatesProps {
  topIdeas: IIdeaWithAggregations[];
  postType?: string;
}

const SystemUpdates: React.FC<SystemUpdatesProps> = ({
  topIdeas,
  postType,
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

      <h2 className="pb-1 border-bottom display-6">Followed Posts</h2>

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

export default SystemUpdates;
