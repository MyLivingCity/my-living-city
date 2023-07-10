import React from "react";
import { useState, useEffect } from "react";
import {
  ISegmentAggregateInfo,
  ISegment,
} from "../../lib/types/data/segment.type";
import {
  Col,
  Container,
  Row,
  Card,
  ListGroup,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
import { capitalizeFirstLetterEachWord } from "../../lib/utilityFunctions";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import SpecifiedMunicipalSectionTableView from "../partials/CommunityDashboardContent/SpecifiedMunicipalSectionTableView";
import SpecifiedCommunitySection from "../partials/CommunityDashboardContent/SpecifiedCommunitySection";
import { UseQueryResult } from "react-query";
import { IFetchError } from "src/lib/types/types";
import LoadingSpinnerInline from "../ui/LoadingSpinnerInline";
import ErrorMessage from "../ui/ErrorMessage";
import { useParams } from "react-router-dom";

interface MunicipalDashboardContentProps {
  allUserSegmentsQueryResult: UseQueryResult<any, IFetchError>;
  segmentInfoAggregateQueryResult: UseQueryResult<ISegmentAggregateInfo, IFetchError>;
  singleSegmentBySegmentIdQueryResult: UseQueryResult<ISegment, IFetchError>;
  ideasHomepageQueryResult: UseQueryResult<IIdeaWithAggregations[], IFetchError>;
}

interface RouteParams {
    segId: string;
}

const MunicipalDashboardContent: React.FC<MunicipalDashboardContentProps> = ({
  allUserSegmentsQueryResult,
  segmentInfoAggregateQueryResult,
  singleSegmentBySegmentIdQueryResult,
  ideasHomepageQueryResult
}: MunicipalDashboardContentProps) => {
    const {segId} = useParams<RouteParams>();
    const currentSegmentId = parseInt(segId)
   
  const {
    data: segmentIdsObj,
    isLoading: isSegmentIdsLoading,
    isError: isSegmentIdsError,
  } = allUserSegmentsQueryResult;
  const {
    data: segmentInfoAggregateData,
    isLoading: isSegmentInfoAggregateLoading,
    isError: isSegmentInfoAggregateError,
  } = segmentInfoAggregateQueryResult
  const {
    data: segmentData,
    isLoading: isSegmentDataLoading,
    isError: isSegmentDataError,
  } = singleSegmentBySegmentIdQueryResult
  const {
    data: iData,
    isLoading: iIsLoading,
    isError: iIsError,
  } = ideasHomepageQueryResult

  // Get segments as array of objects with id and name, but not super- or sub-segments.
  const segmentsArray = [];
  if (!isSegmentIdsLoading && !isSegmentIdsError) {
    if (
        segmentIdsObj.homeSegmentId &&
        segmentIdsObj.homeSegmentName !== undefined
      ) {
        segmentsArray.push({
          id: segmentIdsObj.homeSegmentId,
          name: segmentIdsObj.homeSegmentName + " 🏠",
        });
      }
    
      
      }
  

  
    const [currCommunityName, setCurrCommunityName] = useState<string>("");
    const [currCommunityPosts, setCurrCommunityPosts] = useState<IIdeaWithAggregations[]>([]);

    useEffect(() => {
      if (
        !iIsLoading &&
        !isSegmentDataLoading &&
        iData &&
        iData.length !== 0 &&
        segmentData
      ) {
        const segmentId = segmentData.segId;
        const filteredIdeas: IIdeaWithAggregations[] = iData.filter((idea) => {
          
        if (idea.segId === segmentId && idea.subSegId === null ) {
          return true;
        }
        else{
          return false;
        }
        });
        setCurrCommunityPosts(filteredIdeas);
      }
    }, [iData, isSegmentDataLoading, segmentData]);

    const handleCommunityChange = (communityName: string, type: string) => {
      setCurrCommunityName(communityName);
      
      const filteredData = iData!.filter((idea: IIdeaWithAggregations) => {
        if (type === 'SuperSegment' && !idea.segmentName && !idea.subSegmentName) {
          return  communityName;
        }
        if (type === 'Segment' && !idea.subSegmentName) {
          return idea.segmentName === communityName;
        }
        if (type === 'SubSegment' && idea.subSegmentName) {
          return idea.subSegmentName === communityName;
        }
        return false;
      });
    
      // Call handleActiveCommunity here
      handleActiveCommunity(communityName, type);
    
      setCurrCommunityPosts(filteredData);
    };

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
    const [isTableView, setIsTableView] = useState(true);


  return (
    <Container className="user-profile-content w-100">
      <Row className="mb-4 mt-4 justify-content-left">
        <h1 className="pb-2 pt-2 display-6">Community:</h1>
        {(isSegmentIdsLoading || isSegmentDataLoading) && (
          <Row className="align-items-center">
            <Col>
              <LoadingSpinnerInline />
            </Col>
          </Row>
        )}
        {(isSegmentIdsError || isSegmentDataError) && (
          <ErrorMessage message="Error loading available communities." />
        )}
        {!(isSegmentIdsLoading || isSegmentDataLoading) &&
          !(isSegmentIdsError || isSegmentDataError) && (
            <button
            className="ml-2 btn btn-primary btn-lg "
          >
             <h2 className="m-0">{capitalizeFirstLetterEachWord(segmentData!.name)}</h2>
          </button>
          )}
      </Row>
      <Row>
        <Col>
          <h2>User Statistics</h2>
          <Card style={{ width: "25rem" }}>
            {isSegmentInfoAggregateLoading && <LoadingSpinnerInline />}
            {!isSegmentInfoAggregateLoading && isSegmentInfoAggregateError && (
              <ErrorMessage message="Unable to load user statistics." />
            )}
            {!isSegmentInfoAggregateLoading && !isSegmentInfoAggregateError && (
              <Row className="justify-content-center mt-3 mb-3">
                <ListGroup variant="flush" className="">
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
                    <h5>{segmentInfoAggregateData!.totalUsers}</h5>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {segmentInfoAggregateData!.residents}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {segmentInfoAggregateData!.students}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {segmentInfoAggregateData!.workers}
                  </ListGroup.Item>
                </ListGroup>
              </Row>
            )}
          </Card>
        </Col>
        <Col>
          <h2>Post Statistics</h2>
          <Card style={{ width: "25rem" }}>
            {isSegmentInfoAggregateLoading && <LoadingSpinnerInline />}
            {!isSegmentInfoAggregateLoading && isSegmentInfoAggregateError && (
              <ErrorMessage message="Unable to load post statistics." />
            )}
            {!isSegmentInfoAggregateLoading && !isSegmentInfoAggregateError && (
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
                    <h5>
                      {segmentInfoAggregateData!.ideas +
                        segmentInfoAggregateData!.proposals +
                        segmentInfoAggregateData!.projects}
                    </h5>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {segmentInfoAggregateData!.ideas}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {segmentInfoAggregateData!.proposals}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {segmentInfoAggregateData!.projects}
                  </ListGroup.Item>
                </ListGroup>
              </Row>
            )}
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
              {isSegmentInfoAggregateLoading && <LoadingSpinnerInline />}
              {!isSegmentInfoAggregateLoading &&
                isSegmentInfoAggregateError && (
                  <ErrorMessage message="Unable to load region." />
                )}
              {!isSegmentInfoAggregateLoading &&
                !isSegmentInfoAggregateError && (
                  <ListGroup.Item
                    action
                    onClick={() =>
                      handleCommunityChange(
                        segmentInfoAggregateData!.superSegmentName,
                        "SuperSegment"
                      )
                    }
                  >
                    {capitalizeFirstLetterEachWord(
                      segmentInfoAggregateData!.superSegmentName
                    )}
                  </ListGroup.Item>
                )}
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
              {(isSegmentInfoAggregateLoading || isSegmentDataLoading) && (
                <LoadingSpinnerInline />
              )}
              {!(isSegmentInfoAggregateLoading || isSegmentDataLoading) &&
                (isSegmentInfoAggregateError || isSegmentDataError) && (
                  <ErrorMessage message="Unable to load municipality." />
                )}
              {!(isSegmentInfoAggregateLoading || isSegmentDataLoading) &&
                !(isSegmentInfoAggregateError || isSegmentDataError) && (
                  <ListGroup.Item
                    action
                    active
                    onClick={() =>
                      handleCommunityChange(segmentData!.name, "Segment")
                    }
                  >
                    {capitalizeFirstLetterEachWord(segmentData!.name)}
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
        <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Header>
              <h4>Neighbourhood</h4>
            </Card.Header>
            <ListGroup variant="flush" id="neighbourhood-list">
              {isSegmentInfoAggregateLoading && <LoadingSpinnerInline />}
              {!isSegmentInfoAggregateLoading &&
                isSegmentInfoAggregateError && (
                  <ErrorMessage message="Unable to load region." />
                )}
              {!isSegmentInfoAggregateLoading &&
                !isSegmentInfoAggregateError &&
                (segmentInfoAggregateData!.subSegments.length > 0 ? (
                  segmentInfoAggregateData!.subSegments.map((subSeg) => (
                    <ListGroup.Item
                      action
                      onClick={() =>
                        handleCommunityChange(subSeg, "SubSegment")
                      }
                    >
                      {capitalizeFirstLetterEachWord(subSeg)}
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>No neighbourhoods found.</ListGroup.Item>
                ))}
            </ListGroup>
          </Card>
        </Col>

      </Row>
      
      <Row style={{ marginTop: "3rem" }}>
  <Col className="d-flex justify-content-end">
    <button className="btn btn-primary btn-lg" onClick={() => setIsTableView(!isTableView)}>
      {isTableView ? 'Switch to Card View' : 'Switch to Table View'}
    </button>
  </Col>
</Row>

{isTableView ? (
  <Row style={{ marginTop: "3rem" }}>
    <Col>
      <SpecifiedMunicipalSectionTableView
        sectionTitle={currCommunityName}
        topIdeas={currCommunityPosts}
        isDashboard={false}
        showCustomFilter={false}
      />
    </Col>
  </Row>
) : (
  <Row style={{ marginTop: "3rem" }}>
    <Col>
      <SpecifiedCommunitySection
        sectionTitle={currCommunityName}
        topIdeas={currCommunityPosts}
        isDashboard={false}
        showCustomFilter={false}
      />
    </Col>
  </Row>
)}
        

    </Container>
  );
};

export default MunicipalDashboardContent;
