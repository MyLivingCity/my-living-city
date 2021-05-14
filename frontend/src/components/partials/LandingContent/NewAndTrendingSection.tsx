import { Container, Row, Col } from 'react-bootstrap';
import { IIdeaWithAggregations } from '../../../lib/types/data/idea.type';
import IdeaTile from '../../tiles/IdeaTile';

interface NewAndTrendingProps {
  topIdeas: IIdeaWithAggregations[],
}

const NewAndTrendingSection: React.FC<NewAndTrendingProps> = ({ topIdeas }) => {
  return (
    <Container className="py-5" id="hanging-icons">
      <h2 className="pb-1 border-bottom display-4 text-center">New and Trending</h2>
      <Row className="g-5 py-3 justify-content-center">
        {topIdeas && topIdeas.map(idea => (
          <Col 
            key={idea.id} md={6} lg={4} 
            className="pt-3 align-items-stretch"
          >
            <IdeaTile ideaData={idea} showFooter={true} />
          </Col>
        ))}
        {/* <a className='pt-5 text-align-center' href="/ideas">
          <h3>View all ideas and conversations</h3>
        </a> */}
      </Row>
    </Container>
  );
}

export default NewAndTrendingSection