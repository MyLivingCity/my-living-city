import React, { useEffect, useState } from 'react'
import { Col, Container, Row, Card, Image, ListGroup, ListGroupItem, Button, Form, Table, NavDropdown, Dropdown, Alert} from 'react-bootstrap';
import { postUserSegmentRequest } from 'src/lib/api/userSegmentRequestRoutes';
import { API_BASE_URL, USER_TYPES } from 'src/lib/constants';
import { IUser } from '../../lib/types/data/user.type';
import { capitalizeString } from '../../lib/utilityFunctions';
import { RequestSegmentModal } from '../partials/RequestSegmentModal';
import StripeCheckoutButton from "src/components/partials/StripeCheckoutButton"
import {getUserSubscriptionStatus} from 'src/lib/api/userRoutes'
import { LinkType, Link, PublicCommunityBusinessProfile } from 'src/lib/types/data/publicProfile.type'; 
import { getCommunityBusinessProfile, updateCommunityBusinessProfile, getCommunityBusinessLinks } from 'src/lib/api/publicProfileRoutes';
interface ProfileContentProps {
  user: IUser;
  token: string;
}

const LinkTypes = Object.keys(LinkType).filter((item) => {
  return isNaN(Number(item));
});


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
  const [links, setLinks] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  function addNewRow() {
    let table = document.getElementById("formLinksBody");
    let rowCount = table?.childElementCount;
    setLinks([...links, { linkType: LinkType.WEBSITE, link: "" , index: rowCount}]);
  }

  useEffect(()=>{
    getUserSubscriptionStatus(user.id).then(e => setStripeStatus(e.status)).catch(e => console.log(e))
    if(segmentRequests.length > 0){
      postUserSegmentRequest(segmentRequests, token);
    }
  },[segmentRequests])

  useEffect(()=>{
    getCommunityBusinessProfile(user.id, token).then(e => setCommunityBusinessProfile(e)).catch(e => console.log(e));
  },[])

  useEffect(()=>{
    if (communityBusinessProfile.id){
      getCommunityBusinessLinks(communityBusinessProfile.id, token).then(e => setLinks(e)).catch(e => console.log(e));
    }
  },[communityBusinessProfile])

  const updateLink = (linkValue: string, link: any) => {
    const linksCopy = [...links];
    const index = linksCopy.indexOf(link);
    linksCopy[index].link = linkValue;
    setLinks(linksCopy);
  };

  const updateLinkType = (linkTypeValue: string, link: any) => {
    const linksCopy = [...links];
    const index = linksCopy.indexOf(link);
    linksCopy[index].linkType = linkTypeValue;
    setLinks(linksCopy);
  };
  
  // Removes the row based on the index provided
  const deleteRow = (link: any) => {
    const linkLocation = document.getElementById("formLinksBody");
    const linkRow = linkLocation?.getElementsByTagName("tr");
    if (linkRow) {
      for (let i = 0; i < linkRow.length; i++) {
        if (linkRow[i].getElementsByTagName("td")[0].getElementsByTagName("select")[0].value === link.linkType && linkRow[i].getElementsByTagName("td")[1].getElementsByTagName("input")[0].value === link.link) {
          linkRow[i].remove();
        }
      }
    }
  };

  function handleUpdateProfile() {
    const userId = user.id;
    const statement = (document.getElementById("formVisionStatement") as HTMLInputElement).value;
    const description = (document.getElementById("formServiceDescription") as HTMLInputElement).value;
    const linksLocation = document.getElementById("formLinksBody");
    const linksRows = linksLocation?.getElementsByTagName("tr");
    let links: Object[] = [];
    if (linksRows) {
      for (let i = 0; i < linksRows.length; i++) {
        const linkType = linksRows[i].getElementsByTagName("td")[0].getElementsByTagName("select")[0].value;
        const linkUrl = linksRows[i].getElementsByTagName("td")[1].getElementsByTagName("input")[0].value;
        const link = {
          link: linkUrl,
          linkType: linkType,
        }
        links.push(link);
      }
    }
    const address = (document.getElementById("formPublicAddress") as HTMLInputElement).value;
    const contactEmail = (document.getElementById("formContactEmail") as HTMLInputElement).value;
    const contactPhone = (document.getElementById("formContactPhone") as HTMLInputElement).value;

    const profileNew: PublicCommunityBusinessProfile = {
      userId: userId,
      statement: statement,
      description: description,
      links: links,
      address: address,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
    }

    const test = updateCommunityBusinessProfile(profileNew, token).then(e => console.log(e)).catch(e => console.log(e));
    setShowAlert(true);

  }


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
          <Form
          id="formPublicProfile"
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProfile();
          }}
          >
            {showAlert ? <Alert variant="primary" dismissible onClose={() => setShowAlert(false)}>Profile Updated</Alert> : null}
              <Form.Group className="mb-3" controlId="formVisionStatement">
                <Form.Label>Mission/Vision Statement</Form.Label>
                <Form.Control 
                type="text" 
                id="formVisionStatement"
                placeholder="Say a few words about your mission/vision" 
                defaultValue={communityBusinessProfile.statement}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formServiceDescription">
                <Form.Label>Product/Service Description</Form.Label>
                <Form.Control 
                type="text"
                id="formServiceDescription"
                placeholder="Tell us about the product/service you provide" 
                defaultValue={communityBusinessProfile.description}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPublicAddress">
                <Form.Label>Public Address</Form.Label>
                <Form.Control 
                type="text" 
                id="formPublicAddress"
                placeholder="Public Address" 
                defaultValue={communityBusinessProfile.address}
                />
              </Form.Group>
              <Form.Group 
              className="mb-3" 
              controlId="formLinks"
              id="formLinks"
              >
                <Form.Label>Links</Form.Label>
                <Button
                  className="float-right"
                  size="sm"
                  onClick={() => {
                    addNewRow();
                  }}
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
                  <tbody id="formLinksBody">
                    {links && 
                    links.map((link) => (
                      <tr
                      // Matches the key to the current index of the link in links
                      key={links.indexOf(link)}
                      
                      >
                        <td>
                          <Form.Control 
                          as="select" 
                          onChange={(e) => {
                            // Updates the link type in the links array
                            updateLinkType(e.target.value, link);
                          }}
                          defaultValue={link.linkType}>
                            {LinkTypes.map((linkType) => (
                              <option>{linkType}</option>
                            ))}
                          
                          </Form.Control>
                        </td>
                        <td>
                          <Form.Control 
                          type="text" 
                          placeholder="Link" 
                          defaultValue={link.link}
                          onChange={(e) => {
                            // Updates the link in the links array
                            updateLink(e.target.value, link);
                          }}
                          />
                        </td>
                        <td>
                          <NavDropdown title="Controls" id="nav-dropdown">
                            <Dropdown.Item 
                            class="deleteButton"
                            onClick={() => {
                              // Deletes the row from the table
                              deleteRow(link);
                            }}
                            >
                              Delete
                            </Dropdown.Item>
                          </NavDropdown>
                        </td>
                      </tr>
                    )
                    )}
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
                        id="formContactEmail"
                        placeholder="Email Address" 
                        defaultValue={communityBusinessProfile.contactEmail}
                      />
                      </td>
                      <td>
                      <Form.Control 
                        type="phone" 
                        id="formContactPhone"
                        placeholder="Phone Number" 
                        defaultValue={communityBusinessProfile.contactPhone}
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