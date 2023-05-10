import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { IIdeaWithAggregations } from "../../lib/types/data/idea.type";
import { IProposalWithAggregations } from "src/lib/types/data/proposal.type";
import IdeaTile from "../tiles/IdeaTile";
import ProposalTile from "../tiles/ProposalTile";
import PlaceholderIdeaTile from "../tiles/PlaceholderIdeaTile";

interface ConversationsPageContentProps {
  ideas: IIdeaWithAggregations[] | undefined;
  proposals: IProposalWithAggregations[] | undefined;
}

// sorting and parsing ideas here

const ConversationsPageContent: React.FC<ConversationsPageContentProps> = ({
  ideas,
  proposals,
}) => {
  return (
    <Container className="conversations-page-content">
      <h3 style={{ paddingTop: "1rem" }}>Proposals</h3>
      <hr />
      <Row>
        {proposals
          ? proposals.map((proposal) => (
              <Col
                key={proposal.id}
                md={6}
                lg={4}
                className="pt-3 align-items-stretch"
              >
                <ProposalTile
                  proposalData={proposal}
                  showFooter={true}
                  postType={"Proposal"}
                />
              </Col>
            ))
          : [...Array(3)].map((x, i) => (
              <Col key={i} md={6} lg={4} className="pt-3 align-items-stretch">
                <PlaceholderIdeaTile />
              </Col>
            ))}
      </Row>
      <h3 style={{ marginTop: "1rem" }}>Ideas</h3>
      <hr style={{ paddingBottom: "0rem", marginBottom: "0rem" }} />
      <Row>
        {ideas
          ? ideas.map((idea) => (
              <Col key={idea.id} className="col-card" xs={12} md={6} lg={4}>
                <IdeaTile ideaData={idea} showFooter={true} postType={"Idea"} />
              </Col>
            ))
          : [...Array(3)].map((x, i) => (
              <Col key={i} md={6} lg={4} className="pt-3 align-items-stretch">
                <PlaceholderIdeaTile />
              </Col>
            ))}
      </Row>
    </Container>
  );
};

export default ConversationsPageContent;
