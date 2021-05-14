import React from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { IIdeaWithAggregations } from '../../lib/types/data/idea.type';
import IdeaTile from '../tiles/IdeaTile';

interface ConversationsPageContentProps {
  ideas: IIdeaWithAggregations[] | undefined;
}

// sorting and parsing ideas here

const ConversationsPageContent: React.FC<ConversationsPageContentProps> = ({ ideas }) => {
  return (
    <Container className='conversations-page-content'>
      <Row>
        {ideas && ideas.map(idea => (
          <Col key={idea.id} className='col-card' xs={12} md={6} lg={4}>
            <IdeaTile ideaData={idea} showFooter={true} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ConversationsPageContent