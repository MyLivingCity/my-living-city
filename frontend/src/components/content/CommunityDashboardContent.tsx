import React from "react";
import {ISegmentAggregateInfo, ISegment} from "./../../lib/types/data/segment.type";
import { Col, Container, Row, Card, ListGroup, DropdownButton, Dropdown, } from 'react-bootstrap';
import { capitalizeFirstLetterEachWord } from "./../../lib/utilityFunctions";
import NewAndTrendingSection from "../partials/LandingContent/NewAndTrendingSection";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { IUser } from "src/lib/types/data/user.type";

interface CommunityDashboardContentProps {
    userData: IUser
    data: ISegmentAggregateInfo,
    segmenData: ISegment,
    topIdeas: IIdeaWithAggregations[]
    segmentIds: any[]
}

const CommunityDashboardContent: React.FC<CommunityDashboardContentProps> = ({userData, data, segmenData, topIdeas, segmentIds} : CommunityDashboardContentProps) => {

    // Filter only the segmentIds that have a segType of 'Segment'
    // Then map it to {id: id, name: name}
    const segmentIdsFiltered = segmentIds.filter((segId: any) => segId.segType === 'Segment').map((segId: any) => ({id: segId.id, name: segId.name}));
    console.log('segmentIdsFiltered', segmentIdsFiltered);





    return (
        <Container className="user-profile-content w-100">
            <Row className='mb-4 mt-4 justify-content-left'>
                <h1 className="pb-2 pt-2 display-6">Community: {capitalizeFirstLetterEachWord(segmenData.name)}</h1>
                <DropdownButton className='pt-3 ml-2 display-6' title="Available Communities">
                    {/* Use segmentIdsFiltered to dynamically add segments */}
                    {segmentIdsFiltered.map((segId: any) => (
                        <Dropdown.Item href={`/community-dashboard/${segId.id}`}>{capitalizeFirstLetterEachWord(segId.name)}</Dropdown.Item>
                    ))}
                </DropdownButton>
            </Row>
            <Row>
                <Col>
                    <h2>User Statistics</h2>
                    <Card style={{width: "25rem"}}>
                        <Row className='justify-content-center mt-3 mb-3'>
                            <ListGroup variant='flush' className=''>
                                {/* <ListGroup.Item><strong>Total Users</strong></ListGroup.Item> */}
                                <ListGroup.Item><h5>Total Users</h5></ListGroup.Item>
                                <ListGroup.Item><strong>Residents</strong></ListGroup.Item>
                                <ListGroup.Item><strong>Students</strong></ListGroup.Item>
                                <ListGroup.Item><strong>Workers</strong></ListGroup.Item>
                            </ListGroup>

                            <ListGroup variant='flush' className=''>
                                <ListGroup.Item><h5>{ data.totalUsers }</h5></ListGroup.Item>
                                <ListGroup.Item>{ data.residents }</ListGroup.Item>
                                <ListGroup.Item>{ data.students }</ListGroup.Item>
                                <ListGroup.Item>{ data.workers }</ListGroup.Item>
                            </ListGroup>
                        </Row>
                    </Card>
                </Col>
                <Col>
                <h2>Post Statistics</h2>
                    <Card style={{width: "25rem"}}>
                        <Row className='justify-content-center mt-3 mb-3'>
                            <ListGroup variant='flush' className=''>
                                <ListGroup.Item><h5>Total Posts</h5></ListGroup.Item>
                                <ListGroup.Item><strong>Ideas</strong></ListGroup.Item>
                                <ListGroup.Item><strong>Proposal</strong></ListGroup.Item>
                                <ListGroup.Item><strong>Projects</strong></ListGroup.Item>
                            </ListGroup>

                            <ListGroup variant='flush' className=''>
                                <ListGroup.Item><h5>{ data.ideas + data.proposals + data.projects }</h5></ListGroup.Item>
                                <ListGroup.Item>{ data.ideas }</ListGroup.Item>
                                <ListGroup.Item>{ data.proposals }</ListGroup.Item>
                                <ListGroup.Item>{ data.projects }</ListGroup.Item>
                            </ListGroup>

                        </Row>
                    </Card>
                </Col>
            </Row>

            <Row style={{marginTop: "3rem"}}>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Header><h4>Region</h4></Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>{capitalizeFirstLetterEachWord(data.superSegmentName)}</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Header><h4>Neighbourhood</h4></Card.Header>
                        <ListGroup variant="flush">
                            {data.subSegments.length > 0 ? data.subSegments.map((subSeg) => 
                            <ListGroup.Item>{capitalizeFirstLetterEachWord(subSeg)}</ListGroup.Item>) : 
                            <ListGroup.Item>No subSegments</ListGroup.Item>}
                        </ListGroup>
                    </Card>
                </Col>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Header><h4>Community Partners</h4></Card.Header>
                        <ListGroup variant="flush">
                            {/* TODO: The community partner is not implemented yet */}
                            <ListGroup.Item>No community partners</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
            <Row style={{marginTop: "3rem"}}>
            <NewAndTrendingSection topIdeas={topIdeas} isDashboard={false} showCustomFilter={false}/>
            </Row>
        </Container>
    )
}

export default CommunityDashboardContent;