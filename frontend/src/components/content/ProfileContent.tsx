import React, { useEffect, useState } from 'react'
import { Col, Container, Row, Card, Image, ListGroup, ListGroupItem, Button, Form, Table, NavDropdown, Dropdown} from 'react-bootstrap';
import { postUserSegmentRequest } from 'src/lib/api/userSegmentRequestRoutes';
import { API_BASE_URL, USER_TYPES } from 'src/lib/constants';
import { IUser } from '../../lib/types/data/user.type';
import { capitalizeString } from '../../lib/utilityFunctions';
import { RequestSegmentModal } from '../partials/RequestSegmentModal';
import StripeCheckoutButton from "src/components/partials/StripeCheckoutButton"
import {getUserSubscriptionStatus} from 'src/lib/api/userRoutes'
import { LinkType } from 'src/lib/types/data/link.type'; 
import { getCommunityBusinessProfile, updateCommunityBusinessProfile } from 'src/lib/api/publicProfileRoutes';
interface ProfileContentProps {
  user: IUser;
  token: string;
}


const ProfileContent: React.FC<ProfileContentProps> = ({ user, token }) => {
  const {
    email,
    userType,
    fname,
    lname,
    address,
    userSegments,
    imagePath,
  } = user;
   

  const {
    streetAddress,
    streetAddress2,
    city,
    postalCode,
    country,
  } = address!;
  const [show, setShow] = useState(false);
  const [stripeStatus, setStripeStatus] = useState("");
  const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
  const [communityBusinessProfile, setCommunityBusinessProfile] = useState<any>({});

  useEffect(()=>{
    getUserSubscriptionStatus(user.id).then(e => setStripeStatus(e.status)).catch(e => console.log(e))
    if(segmentRequests.length > 0){
      postUserSegmentRequest(segmentRequests, token);
    }
  },[segmentRequests])

  useEffect(()=>{
    getCommunityBusinessProfile(user.id).then(e => setCommunityBusinessProfile(e)).catch(e => console.log(e))
  },[])

  console.log(communityBusinessProfile)

  return (
    <Container className='user-profile-content w-100'>
      <Row className='mb-4 mt-4 justify-content-center'>
          <h2 className="pb-2 pt-2 display-6">User Profile</h2>
      </Row>

      <Row>
        <Card className='text-center mx-5 mb-5' style={{ width: '18rem'}}>
            <Row className='mt-3'>
              <Col>
              {imagePath
              ? <Image fluid src={`${API_BASE_URL}/${imagePath}`} style={{objectFit: "cover", height:"200px", width:"200px"}}roundedCircle/>
              : <Image fluid src='https://ih1.redbubble.net/image.785212781.7855/st,small,507x507-pad,600x600,f8f8f8.jpg' width='70%' roundedCircle/>}
              </Col>
            </Row>
            <Card.Title className='mt-3'>{ fname ? capitalizeString(fname) : "Unknown" } { lname ? capitalizeString(lname) : "Unknown" }</Card.Title>
            <Card.Text className='mb-3'>{ email }</Card.Text>
            {
              stripeStatus !== "" &&
              <>
                <p>Subscription Status: {stripeStatus=== "active"? "Active" : "Not Active"}</p>
                <StripeCheckoutButton status={stripeStatus} user={user}/>
              </>
            }
           
          </Card>
        
          
        <Card style={{ width: '40rem'}}>
          <Row className='justify-content-center mt-3'>
              <ListGroup variant='flush' className=''>
                <ListGroup.Item><strong>Full Name</strong></ListGroup.Item>
                <ListGroup.Item><strong>Email</strong></ListGroup.Item>
                <ListGroup.Item><strong>Street Address</strong></ListGroup.Item>
                {streetAddress2 ? <ListGroup.Item><strong>Street Address 2</strong></ListGroup.Item> : null}
                <ListGroup.Item><strong>City</strong></ListGroup.Item>
                <ListGroup.Item><strong>Postal Code / Zip</strong></ListGroup.Item>
                <ListGroup.Item><strong>Community Request</strong></ListGroup.Item>
              </ListGroup>
            
              <ListGroup variant='flush' className=''>
                <ListGroup.Item>{ fname ? capitalizeString(fname) : "Unknown" } { lname ? capitalizeString(lname) : "Unknown" }</ListGroup.Item>
                <ListGroup.Item>{ email }</ListGroup.Item>
                <ListGroup.Item>{ streetAddress ? capitalizeString(streetAddress) : "Unknown" }</ListGroup.Item>
                {streetAddress2 ? <ListGroup.Item>{ streetAddress2 ? capitalizeString(streetAddress2) : "Unknown" }</ListGroup.Item> : null}
                <ListGroup.Item>{ city ? capitalizeString(city) : capitalizeString(userSegments!.homeSegmentName) }</ListGroup.Item>
                <ListGroup.Item>{ postalCode ? postalCode.toUpperCase() : "Unknown" }</ListGroup.Item>
                <ListGroup.Item><Button variant="link" onClick={()=>setShow(b=>!b)}>Request your Community!</Button></ListGroup.Item>
              </ListGroup>
              <RequestSegmentModal showModal={show} setShowModal={setShow} index={0} 
              setSegmentRequests={setSegmentRequests} segmentRequests={segmentRequests}/>
          </Row>
        </Card>
      </Row>
      {(user.userType == USER_TYPES.BUSINESS || user.userType == USER_TYPES.COMMUNITY) ? (
      <Row className='mb-4 mt-4 justify-content-center'>
        <h2 className="pb-2 pt-2 display-6">Public Profile</h2>
      </Row>
      ) : null}
      {(user.userType == USER_TYPES.BUSINESS || user.userType == USER_TYPES.COMMUNITY) ? (
      <Row>
        <Card style={{ width: '80rem'}}>
          <Card.Body className="my-5">
          <Form>
              <Form.Group className="mb-3" controlId="formVisionStatement">
                <Form.Label>Mission/Vision Statement</Form.Label>
                <Form.Control 
                type="text" 
                placeholder="Say a few words about your mission/vision" 
                value={communityBusinessProfile.missionStatement}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formServiceDescription">
                <Form.Label>Product/Service Description</Form.Label>
                <Form.Control 
                type="text" 
                placeholder="Tell us about the product/service you provide" 
                value={communityBusinessProfile.serviceDescription}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPublicAddress">
                <Form.Label>Public Address</Form.Label>
                <Form.Control 
                type="text" 
                placeholder="Public Address" 
                value={communityBusinessProfile.address}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formLinks">
                <Form.Label>Links</Form.Label>
                <Button
                  className="float-right"
                  size="sm"
                  // onClick={(e) => {
                  //   setShowNewSubSeg(true);
                  // }}
                >
                  Add New Link
                </Button>
                <Table bordered hover size="sm">
                  <thead>
                    <tr>
                      <th style={{ width: "10rem"}}>Type</th>
                      <th>Link</th>
                      <th style={{ width: "10rem"}}>Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    { (communityBusinessProfile && communityBusinessProfile.links > 0) ? (communityBusinessProfile.links.forEach((link : String) => {
                      let linkParts = link.split(" ");
                      return (
                        <tr>
                          <td>
                            <Form.Control as="select" defaultValue={linkParts[0]}>
                              <option>Website</option>
                              <option>Twitter</option>
                              <option>Facebook</option>
                              <option>Instagram</option>
                              <option>LinkedIn</option>
                              <option>Youtube</option>
                              <option>Tiktok</option>
                              <option>Other</option>
                            </Form.Control>
                          </td>
                          <td>
                            <Form.Control type="text" placeholder="Link" value={linkParts[1]}/>
                          </td>
                          <td>
                            <NavDropdown title="Controls" id="nav-dropdown">
                              <Dropdown.Item
                                // onClick={() => setHideControls(String(segment.id))}
                              >
                                Edit
                              </Dropdown.Item>
                            </NavDropdown>
                          </td>
                        </tr>
                      )
                    })) : null
                    }
                    {/* <tr>
                      <td>
                        Sample
                      </td>
                      <td>
                        www.thisisnotarealurl.com
                      </td>
                      <td>
                        <NavDropdown title="Controls" id="nav-dropdown">
                          <Dropdown.Item
                            // onClick={() => setHideControls(String(segment.id))}
                          >
                            Edit
                          </Dropdown.Item>
                        </NavDropdown>
                      </td>
                    </tr> */}
                  </tbody>
                </Table>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formContactInformation">
                <Form.Label>Contact Information</Form.Label>
                <Table bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                    </tr>
                  </thead>
                  {communityBusinessProfile ? (
                  <tbody>
                    <tr>
                      <td>
                        {fname}
                      </td>
                      <td>
                        {lname}
                      </td>
                      <td>
                      <Form.Control 
                        type="email" 
                        placeholder="Email Address" 
                        value={communityBusinessProfile.contactEmail}
                      />
                      </td>
                      <td>
                      <Form.Control 
                        type="phone" 
                        placeholder="Phone Number" 
                        value={communityBusinessProfile.contactPhone}
                      />
                      </td>
                    </tr>
                  </tbody>
                  ) : null}
                </Table>
              </Form.Group>
              <Button variant="primary" type="submit">
                Update
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Row>
      ) : null}
    </Container>
  );
}

export default ProfileContent