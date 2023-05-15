import React from "react";
import { useState } from "react";
import {
  ISegmentAggregateInfo,
  ISegment,
} from "./../../lib/types/data/segment.type";
import {
  Col,
  Container,
  Row,
  Card,
  ListGroup,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
import { capitalizeFirstLetterEachWord } from "./../../lib/utilityFunctions";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import SpecifiedCommunitySection from "../partials/CommunityDashboardContent/SpecifiedCommunitySection";
import { UseQueryResult } from "react-query";
import { IFetchError } from "src/lib/types/types";
import LoadingSpinnerInline from "../ui/LoadingSpinnerInline";
import ErrorMessage from "../ui/ErrorMessage";

interface CommunityDashboardContentProps {
  data: ISegmentAggregateInfo;
  segmentData: ISegment;
  topIdeas: IIdeaWithAggregations[];
  allUserSegmentsQueryResult: UseQueryResult<any, IFetchError>;
}

const CommunityDashboardContent: React.FC<CommunityDashboardContentProps> = ({
  data,
  segmentData,
  topIdeas,
  allUserSegmentsQueryResult,
}: CommunityDashboardContentProps) => {
  const {
    data: segmentIdsObj,
    isLoading: isSegmentIdsLoading,
    isError: isSegmentIdsError,
  } = allUserSegmentsQueryResult;
  // Get segments as array of objects with id and name, but not super- or sub-segments.
  const segmentsArray = [];
  if (!isSegmentIdsLoading && !isSegmentIdsError) {
    if (
        segmentIdsObj.homeSegmentId !== undefined &&
        segmentIdsObj.homeSegmentName !== undefined
      ) {
        segmentsArray.push({
          id: segmentIdsObj.homeSegmentId,
          name: segmentIdsObj.homeSegmentName,
        });
      }
    
      if (
        segmentIdsObj.workSegmentId !== undefined &&
        segmentIdsObj.workSegmentName !== undefined &&
        segmentIdsObj.workSegmentName !== segmentIdsObj.homeSegmentName
      ) {
        segmentsArray.push({
          id: segmentIdsObj.workSegmentId,
          name: segmentIdsObj.workSegmentName,
        });
      }
    
      if (
        segmentIdsObj.schoolSegmentId !== undefined &&
        segmentIdsObj.schoolSegmentName !== undefined &&
        segmentIdsObj.schoolSegmentName !== segmentIdsObj.homeSegmentName
      ) {
        segmentsArray.push({
          id: segmentIdsObj.schoolSegmentId,
          name: segmentIdsObj.schoolSegmentName,
        });
      }
  }
  

    const [currCommunityName, setCurrCommunityName] = useState(segmentData.name);
    const [currCommunityPosts, setCurrCommunityPosts] = useState(topIdeas);

    const handleCommunityChange = (communityName: string, type: string) => {
        setCurrCommunityName(communityName);
        handleActiveCommunity(communityName, type);
        if (type === 'Segment') {
            setCurrCommunityPosts(
                topIdeas.filter((idea: IIdeaWithAggregations) => idea.segmentName === communityName)
            )
        } else if (type === 'SuperSegment') {
            setCurrCommunityPosts(
                topIdeas
            )
        } else if (type === 'SubSegment') {
            setCurrCommunityPosts(
                topIdeas.filter((idea: IIdeaWithAggregations) => idea.subSegmentName === communityName)
            )
        }
    }

    const handleActiveCommunity = (communityName: string, type: string) => {
        const regionLocation = document.getElementById('region-list');
        const municipalityLocation = document.getElementById('municipality-list');
        const neighbourhoodLocation = document.getElementById('neighbourhood-list');
        if (regionLocation) {
            for (let i = 0; i < regionLocation.children.length; i++) {
                regionLocation.children[i].classList.remove('active');
                if (type === 'SuperSegment' && regionLocation.children[i].innerHTML === capitalizeFirstLetterEachWord(communityName)) {
                    regionLocation.children[i].classList.add('active');
                }
            }
        }
        if (municipalityLocation) {
            for (let i = 0; i < municipalityLocation.children.length; i++) {
                municipalityLocation.children[i].classList.remove('active');
                if (type === 'Segment' && municipalityLocation.children[i].innerHTML === capitalizeFirstLetterEachWord(communityName)) {
                    municipalityLocation.children[i].classList.add('active');
                }
            }
        }
        if (neighbourhoodLocation) {
            for (let i = 0; i < neighbourhoodLocation.children.length; i++) {
                neighbourhoodLocation.children[i].classList.remove('active');
                if (type === 'SubSegment' && neighbourhoodLocation.children[i].innerHTML === capitalizeFirstLetterEachWord(communityName)) {
                    neighbourhoodLocation.children[i].classList.add('active');
                }
            }
        }

    }



  return (
    <Container className="user-profile-content w-100">
      <Row className="mb-4 mt-4 justify-content-left">
        <h1 className="pb-2 pt-2 display-6">
          Community: {capitalizeFirstLetterEachWord(segmentData.name)}
        </h1>
        {isSegmentIdsLoading && <LoadingSpinnerInline/>}
        {isSegmentIdsError && <ErrorMessage message="Error loading available communities."/>}
        {!isSegmentIdsLoading && !isSegmentIdsError && (
          <DropdownButton
            className="pt-3 ml-2 display-6"
            title="Available Communities"
          >
            {/* Use segmentIdsFiltered to dynamically add segments */}
            {segmentsArray.map((segId: any) => (
              <Dropdown.Item href={`/community-dashboard/${segId.id}`}>
                {capitalizeFirstLetterEachWord(segId.name)}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        )}
      </Row>
      <Row>
        <Col>
          <h2>User Statistics</h2>
          <Card style={{ width: "25rem" }}>
            <Row className="justify-content-center mt-3 mb-3">
              <ListGroup variant="flush" className="">
                {/* <ListGroup.Item><strong>Total Users</strong></ListGroup.Item> */}
                <ListGroup.Item>
                  <h5>Total Users</h5>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Residents</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Students</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Workers</strong>
                </ListGroup.Item>
              </ListGroup>

              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  <h5>{data.totalUsers}</h5>
                </ListGroup.Item>
                <ListGroup.Item>{data.residents}</ListGroup.Item>
                <ListGroup.Item>{data.students}</ListGroup.Item>
                <ListGroup.Item>{data.workers}</ListGroup.Item>
              </ListGroup>
            </Row>
          </Card>
        </Col>
        <Col>
          <h2>Post Statistics</h2>
          <Card style={{ width: "25rem" }}>
            <Row className="justify-content-center mt-3 mb-3">
              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  <h5>Total Posts</h5>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Ideas</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Proposal</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Projects</strong>
                </ListGroup.Item>
              </ListGroup>

              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  <h5>{data.ideas + data.proposals + data.projects}</h5>
                </ListGroup.Item>
                <ListGroup.Item>{data.ideas}</ListGroup.Item>
                <ListGroup.Item>{data.proposals}</ListGroup.Item>
                <ListGroup.Item>{data.projects}</ListGroup.Item>
              </ListGroup>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: "3rem" }}>
        <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Header>
              <h4>Region</h4>
            </Card.Header>
            <ListGroup variant="flush" id="region-list">
              <ListGroup.Item
                action
                onClick={() =>
                  handleCommunityChange(data.superSegmentName, "SuperSegment")
                }
              >
                {capitalizeFirstLetterEachWord(data.superSegmentName)}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Header>
              <h4>Municipality</h4>
            </Card.Header>
            <ListGroup
              variant="flush"
              defaultActiveKey="#link1"
              id="municipality-list"
            >
              <ListGroup.Item
                action
                active
                onClick={() =>
                  handleCommunityChange(segmentData.name, "Segment")
                }
              >
                {capitalizeFirstLetterEachWord(segmentData.name)}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Header>
              <h4>Neighbourhood</h4>
            </Card.Header>
            <ListGroup variant="flush" id="neighbourhood-list">
              {data.subSegments.length > 0 ? (
                data.subSegments.map((subSeg) => (
                  <ListGroup.Item
                    action
                    onClick={() => handleCommunityChange(subSeg, "SubSegment")}
                  >
                    {capitalizeFirstLetterEachWord(subSeg)}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No subSegments</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* TODO: The community partner is not implemented yet
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Header><h4>Community Partners</h4></Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>No community partners</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                */}
      </Row>
      <Row style={{ marginTop: "3rem" }}>
        <SpecifiedCommunitySection
          sectionTitle={currCommunityName}
          topIdeas={currCommunityPosts}
          isDashboard={false}
          showCustomFilter={false}
        />
      </Row>
    </Container>
  );
};

export default CommunityDashboardContent;
