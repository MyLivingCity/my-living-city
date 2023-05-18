import React, { useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Card,
  Image,
  ListGroup,
  ListGroupItem,
  Button,
  Form,
  Table,
  NavDropdown,
  Dropdown,
  Alert,
} from "react-bootstrap";
import { postUserSegmentRequest } from "src/lib/api/userSegmentRequestRoutes";
import { API_BASE_URL, TEXT_INPUT_LIMIT, USER_TYPES } from "src/lib/constants";
import { IUser } from "../../lib/types/data/user.type";
import { capitalizeString } from "../../lib/utilityFunctions";
import { RequestSegmentModal } from "../partials/RequestSegmentModal";
import StripeCheckoutButton from "src/components/partials/StripeCheckoutButton";
import {
  getSchoolSegmentDetails,
  getUserSubscriptionStatus,
  getWorkSegmentDetails,
} from "src/lib/api/userRoutes";
import {
  LinkType,
  PublicStandardProfile,
  PublicCommunityBusinessProfile,
  PublicMunicipalProfile,
} from "src/lib/types/data/publicProfile.type";
import {
  getCommunityBusinessProfile,
  updateCommunityBusinessProfile,
  getCommunityBusinessLinks,
  getMunicipalProfile,
  getStandardProfile,
  updateStandardProfile,
  updateMunicipalProfile,
  getMunicipalLinks,
} from "src/lib/api/publicProfileRoutes";
import { SegmentInfo } from "../partials/ProfileContent/SegmentInfo";
import {
  deleteSchoolSegmentDetails,
  deleteWorkSegmentDetails,
  updateSchoolSegmentDetails,
  updateWorkSegmentDetails,
  updateHomeSegmentDetails,
  getUserGeoData,
} from "src/lib/api/userRoutes";
import { getAllSegments } from "src/lib/api/segmentRoutes";

interface ProfileContentProps {
  user: IUser;
  token: string;
}

const LinkTypes = Object.keys(LinkType).filter((item) => {
  return isNaN(Number(item));
});

const deleteSchoolSegmentDetail = async (user: string | undefined) => {
  if (user === undefined) {
  } else {
    await deleteSchoolSegmentDetails(user);
    window.location.reload();
  }
};

const deleteWorkSegmentDetail = async (user: string | undefined) => {
  if (user === undefined) {
  } else {
    await deleteWorkSegmentDetails(user);
    window.location.reload();
  }
};

const updateSchoolSegmentDetail = async (
  user: string | undefined,
  data: any
) => {
  if (user === undefined) {
  } else {
    await updateSchoolSegmentDetails(user, data);
  }
};

const updateWorkSegmentDetail = async (user: string | undefined, data: any) => {
  if (user === undefined) {
  } else {
    await updateWorkSegmentDetails(user, data);
  }
};

const updateHomeSegmentDetail = async (user: string | undefined, data: any) => {
  if (user === undefined) {
  } else {
    await updateHomeSegmentDetails(user, data);
  }
};

const ProfileContent: React.FC<ProfileContentProps> = ({ user, token }) => {
  const {
    email,
    userType,
    organizationName,
    fname,
    lname,
    address,
    userSegments,
    imagePath,
    displayFName,
    displayLName,
  } = user;

  const { streetAddress, streetAddress2, city, postalCode, country } = address!;
  const [show, setShow] = useState(false);
  const [stripeStatus, setStripeStatus] = useState("");
  const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
  const [communityBusinessProfile, setCommunityBusinessProfile] = useState<any>(
    {}
  );
  const [municipalProfile, setMunicipalProfile] = useState<any>({});
  const [standardProfile, setStandardProfile] = useState<any>({});
  const [links, setLinks] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [workData, setWorkData] = useState<any>({});
  const [schoolData, setSchoolData] = useState<any>({});
  const [geoData, setGeoData] = useState<any>({});
  const [segments, setSegments] = useState<any[]>([]);
  const [subSegments, setSubSegments] = useState<any[]>([]);
  const [editPersonalInfo, setEditPersonalInfo] = useState(false);

  function handleEditPersonalInfo() {
    setEditPersonalInfo(!editPersonalInfo);
  }

  function addNewRow() {
    let table = document.getElementById("formLinksBody");
    let rowCount = table?.childElementCount;
    setLinks([
      ...links,
      { linkType: LinkType.WEBSITE, link: "", index: rowCount },
    ]);
  }

  useEffect(() => {
    getUserSubscriptionStatus(user.id)
      .then((e) => setStripeStatus(e.status))
      .catch((e) => console.log(e));
    if (segmentRequests.length > 0) {
      postUserSegmentRequest(segmentRequests, token);
    }
  }, [segmentRequests]);

  useEffect(() => {
    getCommunityBusinessProfile(user.id, token)
      .then((e) => setCommunityBusinessProfile(e))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    if (communityBusinessProfile.id) {
      getCommunityBusinessLinks(communityBusinessProfile.id, token)
        .then((e) => setLinks(e))
        .catch((e) => console.log(e));
    }
  }, [communityBusinessProfile]);

  useEffect(() => {
    getMunicipalProfile(user.id, token)
      .then((e) => setMunicipalProfile(e))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    if (municipalProfile.id) {
      getMunicipalLinks(municipalProfile.id, token)
        .then((e) => setLinks(e))
        .catch((e) => console.log(e));
    }
  }, [municipalProfile]);

  useEffect(() => {
    getStandardProfile(user.id, token)
      .then((e) => setStandardProfile(e))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    getWorkSegmentDetails(user.id)
      .then((e) => setWorkData(e))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    getSchoolSegmentDetails(user.id)
      .then((e) => setSchoolData(e))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    getUserGeoData(user.id)
      .then((e) => setGeoData(e))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    getAllSegments()
      .then((e) => setSegments(e))
      .catch((e) => console.log(e));
  }, []);

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
        if (
          linkRow[i]
            .getElementsByTagName("td")[0]
            .getElementsByTagName("select")[0].value === link.linkType &&
          linkRow[i]
            .getElementsByTagName("td")[1]
            .getElementsByTagName("input")[0].value === link.link
        ) {
          linkRow[i].remove();
        }
      }
    }
  };

  function handleUpdateProfile() {
    if (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) {
      const userId = user.id;
      const statement = (
        document.getElementById("formVisionStatement") as HTMLInputElement
      ).value;
      const description = (
        document.getElementById("formServiceDescription") as HTMLInputElement
      ).value;
      const linksLocation = document.getElementById("formLinksBody");
      const linksRows = linksLocation?.getElementsByTagName("tr");
      let links: Object[] = [];
      if (linksRows) {
        for (let i = 0; i < linksRows.length; i++) {
          const linkType = linksRows[i]
            .getElementsByTagName("td")[0]
            .getElementsByTagName("select")[0].value;
          const linkUrl = linksRows[i]
            .getElementsByTagName("td")[1]
            .getElementsByTagName("input")[0].value;
          const link = {
            link: linkUrl,
            linkType: linkType,
          };
          links.push(link);
        }
      }
      const address = (
        document.getElementById("formPublicAddress") as HTMLInputElement
      ).value;
      const contactEmail = (
        document.getElementById("formContactEmail") as HTMLInputElement
      ).value;
      const contactPhone = (
        document.getElementById("formContactPhone") as HTMLInputElement
      ).value;

      const profileNew: PublicCommunityBusinessProfile = {
        userId: userId,
        statement: statement,
        description: description,
        links: links,
        address: address,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
      };

      const test = updateCommunityBusinessProfile(profileNew, token)
        .then((e) => console.log(e))
        .catch((e) => console.log(e));
      setShowAlert(true);
    } else if (userType === USER_TYPES.MUNICIPAL) {
      const userId = user.id;
      const statement = (
        document.getElementById("formVisionStatement") as HTMLInputElement
      ).value;
      const responsibility = (
        document.getElementById("formServiceResponsibility") as HTMLInputElement
      ).value;
      const linksLocation = document.getElementById("formLinksBody");
      const linksRows = linksLocation?.getElementsByTagName("tr");
      let links: Object[] = [];
      if (linksRows) {
        for (let i = 0; i < linksRows.length; i++) {
          const linkType = linksRows[i]
            .getElementsByTagName("td")[0]
            .getElementsByTagName("select")[0].value;
          const linkUrl = linksRows[i]
            .getElementsByTagName("td")[1]
            .getElementsByTagName("input")[0].value;
          const link = {
            link: linkUrl,
            linkType: linkType,
          };
          links.push(link);
        }
      }
      const address = (
        document.getElementById("formPublicAddress") as HTMLInputElement
      ).value;
      const contactEmail = (
        document.getElementById("formContactEmail") as HTMLInputElement
      ).value;
      const contactPhone = (
        document.getElementById("formContactPhone") as HTMLInputElement
      ).value;

      const profileNew: PublicMunicipalProfile = {
        userId: userId,
        statement: statement,
        responsibility: responsibility,
        links: links,
        address: address,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
      };

      const test = updateMunicipalProfile(profileNew, token)
        .then((e) => console.log(e))
        .catch((e) => console.log(e));
      setShowAlert(true);
    }
  }

  const handleStandardProfile = () => {
    const id = user.id;
    const firstName = (
      document.getElementById("formStandardFirstName") as HTMLInputElement
    ).value;
    const lastName = (
      document.getElementById("formStandardLastName") as HTMLInputElement
    ).value;
    const email = (
      document.getElementById("formStandardEmail") as HTMLInputElement
    ).value;
    const profileNew: PublicStandardProfile = {
      id: id,
      email: email,
      fname: firstName,
      lname: lastName,
    };
    const test = updateStandardProfile(profileNew, token)
      .then((e) => console.log(e))
      .catch((e) => console.log(e));
    setShowAlert(true);
    return {
      firstName: firstName,
      lastName: lastName,
      email: email,
    };
  };

  if (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) {
    return (
      <Container className="user-profile-content w-100">
        <Row className="mb-4 mt-4 justify-content-center">
          <h2 className="pb-2 pt-2 display-6">User Profile</h2>
        </Row>

        <Row>
          <Card className="text-center mx-5 mb-5" style={{ width: "18rem" }}>
            <Row className="mt-3">
              <Col>
                {imagePath ? (
                  <Image
                    fluid
                    src={imagePath}
                    style={{
                      objectFit: "cover",
                      height: "200px",
                      width: "200px",
                    }}
                    roundedCircle
                  />
                ) : (
                  <Image
                    fluid
                    src="https://ih1.redbubble.net/image.785212781.7855/st,small,507x507-pad,600x600,f8f8f8.jpg"
                    width="70%"
                    roundedCircle
                  />
                )}
              </Col>
            </Row>
            <Card.Title className="mt-3">
              {organizationName
                ? capitalizeString(organizationName)
                : "Unknown"}
            </Card.Title>
            <Card.Text className="mb-3">{email}</Card.Text>
            {stripeStatus !== "" && (
              <>
                <p>
                  Subscription Status:{" "}
                  {stripeStatus === "active" ? "Active" : "Not Active"}
                </p>
                <StripeCheckoutButton status={stripeStatus} user={user} />
              </>
            )}
          </Card>

          <Card style={{ width: "40rem" }}>
            <Row className="justify-content-center mt-3">
              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  <strong>Organization Name</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Street Address</strong>
                </ListGroup.Item>
                {streetAddress2 ? (
                  <ListGroup.Item>
                    <strong>Street Address 2</strong>
                  </ListGroup.Item>
                ) : null}
                <ListGroup.Item>
                  <strong>City</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Postal Code / Zip</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Community Request</strong>
                </ListGroup.Item>
              </ListGroup>

              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  {organizationName
                    ? capitalizeString(organizationName)
                    : "Unknown"}{" "}
                </ListGroup.Item>
                <ListGroup.Item>{email}</ListGroup.Item>
                <ListGroup.Item>
                  {streetAddress ? capitalizeString(streetAddress) : "Unknown"}
                </ListGroup.Item>
                {streetAddress2 ? (
                  <ListGroup.Item>
                    {streetAddress2
                      ? capitalizeString(streetAddress2)
                      : "Unknown"}
                  </ListGroup.Item>
                ) : null}
                <ListGroup.Item>
                  {city
                    ? capitalizeString(city)
                    : capitalizeString(userSegments!.homeSegmentName)}
                </ListGroup.Item>
                <ListGroup.Item>
                  {postalCode ? postalCode.toUpperCase() : "Unknown"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button variant="link" onClick={() => setShow((b) => !b)}>
                    Request your Community!
                  </Button>
                </ListGroup.Item>
              </ListGroup>
              <RequestSegmentModal
                showModal={show}
                setShowModal={setShow}
                index={0}
                setSegmentRequests={setSegmentRequests}
                segmentRequests={segmentRequests}
              />
            </Row>
          </Card>
        </Row>

        <Row className="mb-4 mt-4 justify-content-center">
          <h2 className="pb-2 pt-2 display-6">Public Profile</h2>
        </Row>
        <Row>
          <Card style={{ width: "80rem" }}>
            <Card.Body className="my-5">
              <Form
                id="formPublicProfile"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateProfile();
                }}
              >
                {showAlert ? (
                  <Alert
                    variant="primary"
                    dismissible
                    onClose={() => setShowAlert(false)}
                  >
                    Profile Updated
                  </Alert>
                ) : null}
                <Form.Group className="mb-3" controlId="formVisionStatement">
                  <Form.Label>Mission/Vision Statement</Form.Label>
                  <Form.Control
                    type="text"
                    id="formVisionStatement"
                    placeholder="Say a few words about your mission/vision"
                    defaultValue={communityBusinessProfile.statement}
                    maxLength={TEXT_INPUT_LIMIT.MISSION_STATEMENT}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formServiceDescription">
                  <Form.Label>Product/Service Description</Form.Label>
                  <Form.Control
                    type="text"
                    id="formServiceDescription"
                    placeholder="Tell us about the product/service you provide"
                    defaultValue={communityBusinessProfile.description}
                    maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPublicAddress">
                  <Form.Label>Public Address</Form.Label>
                  <Form.Control
                    type="text"
                    id="formPublicAddress"
                    placeholder="Public Address"
                    defaultValue={communityBusinessProfile.address}
                    maxLength={TEXT_INPUT_LIMIT.LOCATION}
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
                        <th style={{ width: "10rem" }}>Type</th>
                        <th>Link</th>
                        <th style={{ width: "10rem" }}>Controls</th>
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
                                defaultValue={link.linkType}
                              >
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
                                maxLength={TEXT_INPUT_LIMIT.EXTERNAL_LINK}
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
                        ))}
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
                          <td>{fname}</td>
                          <td>{lname}</td>
                          <td>
                            <Form.Control
                              type="email"
                              id="formContactEmail"
                              placeholder="Email Address"
                              defaultValue={
                                communityBusinessProfile.contactEmail
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="phone"
                              id="formContactPhone"
                              placeholder="Phone Number"
                              defaultValue={
                                communityBusinessProfile.contactPhone
                              }
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
      </Container>
    );
  } else if (userType === USER_TYPES.MUNICIPAL) {
    return (
      <Container className="user-profile-content w-100">
        <Row className="mb-4 mt-4 justify-content-center">
          <h2 className="pb-2 pt-2 display-6">User Profile</h2>
        </Row>

        <Row>
          <Card className="text-center mx-5 mb-5" style={{ width: "18rem" }}>
            <Row className="mt-3">
              <Col>
                {imagePath ? (
                  <Image
                    fluid
                    src={imagePath}
                    style={{
                      objectFit: "cover",
                      height: "200px",
                      width: "200px",
                    }}
                    roundedCircle
                  />
                ) : (
                  <Image
                    fluid
                    src="https://ih1.redbubble.net/image.785212781.7855/st,small,507x507-pad,600x600,f8f8f8.jpg"
                    width="70%"
                    roundedCircle
                  />
                )}
              </Col>
            </Row>
            <Card.Title className="mt-3">
              {organizationName
                ? capitalizeString(organizationName)
                : "Unknown"}
            </Card.Title>
            <Card.Text className="mb-3">{email}</Card.Text>
            {stripeStatus !== "" && (
              <>
                <p>
                  Subscription Status:{" "}
                  {stripeStatus === "active" ? "Active" : "Not Active"}
                </p>
                <StripeCheckoutButton status={stripeStatus} user={user} />
              </>
            )}
          </Card>

          <Card style={{ width: "40rem" }}>
            <Row className="justify-content-center mt-3">
              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  <strong>Organization Name</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Street Address</strong>
                </ListGroup.Item>
                {streetAddress2 ? (
                  <ListGroup.Item>
                    <strong>Street Address 2</strong>
                  </ListGroup.Item>
                ) : null}
                <ListGroup.Item>
                  <strong>City</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Postal Code / Zip</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Community Request</strong>
                </ListGroup.Item>
              </ListGroup>

              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  {organizationName
                    ? capitalizeString(organizationName)
                    : "Unknown"}{" "}
                </ListGroup.Item>
                <ListGroup.Item>{email}</ListGroup.Item>
                <ListGroup.Item>
                  {streetAddress ? capitalizeString(streetAddress) : "Unknown"}
                </ListGroup.Item>
                {streetAddress2 ? (
                  <ListGroup.Item>
                    {streetAddress2
                      ? capitalizeString(streetAddress2)
                      : "Unknown"}
                  </ListGroup.Item>
                ) : null}
                <ListGroup.Item>
                  {city
                    ? capitalizeString(city)
                    : capitalizeString(userSegments!.homeSegmentName)}
                </ListGroup.Item>
                <ListGroup.Item>
                  {postalCode ? postalCode.toUpperCase() : "Unknown"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button variant="link" onClick={() => setShow((b) => !b)}>
                    Request your Community!
                  </Button>
                </ListGroup.Item>
              </ListGroup>
              <RequestSegmentModal
                showModal={show}
                setShowModal={setShow}
                index={0}
                setSegmentRequests={setSegmentRequests}
                segmentRequests={segmentRequests}
              />
            </Row>
          </Card>
        </Row>

        <Row className="mb-4 mt-4 justify-content-center">
          <h2 className="pb-2 pt-2 display-6">Public Profile</h2>
        </Row>
        <Row>
          <Card style={{ width: "80rem" }}>
            <Card.Body className="my-5">
              <Form
                id="formPublicProfile"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateProfile();
                }}
              >
                {showAlert ? (
                  <Alert
                    variant="primary"
                    dismissible
                    onClose={() => setShowAlert(false)}
                  >
                    Profile Updated
                  </Alert>
                ) : null}
                <Form.Group className="mb-3" controlId="formVisionStatement">
                  <Form.Label>Mission/Vision Statement</Form.Label>
                  <Form.Control
                    type="text"
                    id="formVisionStatement"
                    placeholder="Say a few words about your mission/vision"
                    defaultValue={municipalProfile.statement}
                    maxLength={TEXT_INPUT_LIMIT.MISSION_STATEMENT}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="formServiceResponsibility"
                >
                  <Form.Label>Responsibility</Form.Label>
                  <Form.Control
                    type="text"
                    id="formServiceResponsibility"
                    placeholder="Tell us about your responsibility"
                    defaultValue={municipalProfile.responsibility}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPublicAddress">
                  <Form.Label>Public Address</Form.Label>
                  <Form.Control
                    type="text"
                    id="formPublicAddress"
                    placeholder="Public Address"
                    defaultValue={municipalProfile.address}
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
                        <th style={{ width: "10rem" }}>Type</th>
                        <th>Link</th>
                        <th style={{ width: "10rem" }}>Controls</th>
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
                                defaultValue={link.linkType}
                              >
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
                        ))}
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
                    {municipalProfile ? (
                      <tbody>
                        <tr>
                          <td>{fname}</td>
                          <td>{lname}</td>
                          <td>
                            <Form.Control
                              type="email"
                              id="formContactEmail"
                              placeholder="Email Address"
                              defaultValue={municipalProfile.contactEmail}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="phone"
                              id="formContactPhone"
                              placeholder="Phone Number"
                              defaultValue={municipalProfile.contactPhone}
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
      </Container>
    );
  } else {
    return (
      <Container className="user-profile-content w-100">
        <Row className="mb-4 mt-4 justify-content-center">
          <h2 className="pb-2 pt-2 display-6">User Profile</h2>
        </Row>

        <Row style={{ marginBottom: "2rem" }}>
          <Card className="text-center mx-5 mb-5" style={{ width: "18rem" }}>
            <Row className="mt-3">
              <Col>
                {imagePath ? (
                  <Image
                    fluid
                    src={imagePath}
                    style={{
                      objectFit: "cover",
                      height: "200px",
                      width: "200px",
                    }}
                    roundedCircle
                  />
                ) : (
                  <Image
                    fluid
                    src="https://ih1.redbubble.net/image.785212781.7855/st,small,507x507-pad,600x600,f8f8f8.jpg"
                    width="70%"
                    roundedCircle
                  />
                )}
              </Col>
            </Row>
            <Card.Title className="mt-3">
              {fname ? capitalizeString(fname) : "Unknown"}{" "}
              {lname ? capitalizeString(lname) : "Unknown"}
            </Card.Title>
            <Card.Text className="mb-3">{email}</Card.Text>
            {stripeStatus !== "" && (
              <>
                <p>
                  Subscription Status:{" "}
                  {stripeStatus === "active" ? "Active" : "Not Active"}
                </p>
                <StripeCheckoutButton status={stripeStatus} user={user} />
              </>
            )}
          </Card>

          <Card
            style={{
              width: "42rem",
              padding: "1.5rem",
              paddingBottom: "0",
              paddingTop: "0",
              justifyContent: "center",
            }}
          >
            {showAlert ? (
              <Alert
                variant="primary"
                dismissible
                onClose={() => setShowAlert(false)}
              >
                Profile Updated
              </Alert>
            ) : null}
            <Row>
              <Col style={{ maxWidth: "4rem" }}></Col>
              {editPersonalInfo ? (
                <Form
                  id="formPublicProfile"
                  style={{ minWidth: "20rem" }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStandardProfile();
                    setEditPersonalInfo(false);
                    // Change
                    window.location.reload();
                  }}
                >
                  <Form.Group
                    className="mb-3"
                    controlId="formProfileInformation"
                  >
                    {standardProfile ? (
                      <>
                        <Form.Group className="mb-3" controlId="firstName">
                          <Form.Label>
                            <strong>First Name:</strong>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="formStandardFirstName"
                            placeholder="First Name"
                            defaultValue={fname}
                            maxLength={TEXT_INPUT_LIMIT.NAME}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="lastName">
                          <Form.Label>
                            <strong>Last Name:</strong>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="formStandardLastName"
                            placeholder="Last Name"
                            defaultValue={lname}
                            maxLength={TEXT_INPUT_LIMIT.NAME}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>
                            <strong>Email:</strong>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            id="formStandardEmail"
                            placeholder="Email Address"
                            defaultValue={email}
                          />
                        </Form.Group>
                      </>
                    ) : null}
                    <Button
                      variant="danger"
                      className="btn-sm"
                      style={{ marginRight: "1rem" }}
                      onClick={handleEditPersonalInfo}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" className="btn-sm" type="submit">
                      Update
                    </Button>
                  </Form.Group>
                </Form>
              ) : (
                <>
                  <Col style={{ padding: "0", maxWidth: "15rem" }}>
                    <ListGroup variant="flush">
                      <ListGroupItem>
                        <strong>Full Name: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Email: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Community Request: </strong>
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ padding: "0" }}>
                    <ListGroup variant="flush">
                      <ListGroupItem>
                        {capitalizeString(fname!)} {capitalizeString(lname!)}
                      </ListGroupItem>
                      <ListGroupItem>{email!}</ListGroupItem>
                      <ListGroup.Item>
                        <Button
                          variant="link"
                          style={{ padding: "0" }}
                          onClick={() => setShow((b) => !b)}
                        >
                          Request your Community!
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col style={{ maxWidth: "8rem" }}>
                    <Button
                      variant="primary"
                      className=""
                      onClick={handleEditPersonalInfo}
                      style={{ float: "right" }}
                    >
                      Edit
                    </Button>
                  </Col>
                </>
              )}
            </Row>
            <RequestSegmentModal
              showModal={show}
              setShowModal={setShow}
              index={0}
              setSegmentRequests={setSegmentRequests}
              segmentRequests={segmentRequests}
            />
          </Card>
        </Row>

        <Row>
          <SegmentInfo
            user={user!}
            token={token!}
            title={"Residence Segment"}
            type={"home"}
            segmentData={{
              displayFName: displayFName
                ? displayFName
                : fname
                ? fname
                : "Unknown",
              displayLName: displayLName
                ? displayLName
                : streetAddress
                ? streetAddress
                : "Unknown",
              street: streetAddress ? streetAddress : "Unknown",
              city: userSegments!.homeSegmentName
                ? userSegments!.homeSegmentName
                : "Unknown",
              postalCode: postalCode ? postalCode : "Unknown",
              neighborhood: userSegments!.homeSubSegmentName
                ? userSegments!.homeSubSegmentName
                : "Unknown",
            }}
            geoData={{
              lat: geoData!.lat ? geoData!.lat : 0,
              lon: geoData!.lon ? geoData!.lon : 0,
            }}
            segments={segments!}
            updateFunction={updateHomeSegmentDetail}
          ></SegmentInfo>
          {workData && (
            <SegmentInfo
              user={user!}
              token={token!}
              title={"Business Segment"}
              type={"work"}
              segmentData={{
                displayFName: workData!.displayFName
                  ? workData!.displayFName
                  : fname
                  ? fname
                  : "Unknown",
                displayLName: workData!.displayLName
                  ? workData!.displayLName
                  : workData!.company
                  ? workData!.company
                  : streetAddress
                  ? streetAddress
                  : "Unknown",
                street: workData!.streetAddress
                  ? workData!.streetAddress
                  : streetAddress
                  ? streetAddress
                  : "Unknown",
                city: userSegments!.workSegmentName
                  ? userSegments!.workSegmentName
                  : userSegments!.homeSegmentName
                  ? userSegments!.homeSegmentName
                  : "Unknown",
                postalCode: workData!.postalCode
                  ? workData!.postalCode
                  : postalCode
                  ? postalCode
                  : "Unknown",
                neighborhood: userSegments!.workSubSegmentName
                  ? userSegments!.workSubSegmentName
                  : userSegments!.homeSubSegmentName
                  ? userSegments!.homeSubSegmentName
                  : "Unknown",
              }}
              geoData={{
                lat: geoData!.work_lat ? geoData!.work_lat : 0,
                lon: geoData!.work_lon ? geoData!.work_lon : 0,
              }}
              segments={segments!}
              deleteFunction={deleteWorkSegmentDetail}
              updateFunction={updateWorkSegmentDetail}
            ></SegmentInfo>
          )}
          {schoolData && (
            <SegmentInfo
              user={user!}
              token={token!}
              title={"School Segment"}
              type={"school"}
              segmentData={{
                displayFName: schoolData!.displayFName
                  ? schoolData!.displayFName
                  : fname
                  ? fname
                  : "Unknown",
                displayLName: schoolData!.displayLName
                  ? schoolData!.displayLName
                  : schoolData!.faculty
                  ? schoolData!.faculty
                  : streetAddress
                  ? streetAddress
                  : "Unknown",
                street: schoolData!.streetAddress
                  ? schoolData!.streetAddress
                  : streetAddress
                  ? streetAddress
                  : "Unknown",
                city: userSegments!.schoolSegmentName
                  ? userSegments!.schoolSegmentName
                  : userSegments!.homeSegmentName
                  ? userSegments!.homeSegmentName
                  : "Unknown",
                postalCode: schoolData!.postalCode
                  ? schoolData!.postalCode
                  : postalCode
                  ? postalCode
                  : "Unknown",
                neighborhood: userSegments!.schoolSubSegmentName
                  ? userSegments!.schoolSubSegmentName
                  : userSegments!.homeSubSegmentName
                  ? userSegments!.homeSubSegmentName
                  : "Unknown",
              }}
              geoData={{
                lat: geoData!.school_lat ? geoData!.school_lat : 0,
                lon: geoData!.school_lon ? geoData!.school_lon : 0,
              }}
              segments={segments!}
              deleteFunction={deleteSchoolSegmentDetail}
              updateFunction={updateSchoolSegmentDetail}
            ></SegmentInfo>
          )}
        </Row>
      </Container>
    );
  }
};

export default ProfileContent;
