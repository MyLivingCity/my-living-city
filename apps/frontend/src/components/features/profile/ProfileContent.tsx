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
  Collapse,
  Badge,
} from "react-bootstrap";
import { postUserSegmentRequest } from "@lib/api/userSegmentRequest.routes";
import { TEXT_INPUT_LIMIT, USER_TYPES } from "@lib/constants/constants";
import { capitalize, getSegmentsFromUserSegments } from "@lib/utils";
import { RequestSegmentModal } from "@components/RequestSegmentModal";
import StripeCheckoutButton from "@components/StripeCheckoutButton";
import { SegmentInfo } from "@components/features/profile/SegmentInfo";
import type z from "zod";
import type { UserSchema } from "@mlc/lib/api";
import {
  LinkType,
  ProfileVisibility,
  type PublicStandardProfile,
  type PublicCommunityBusinessProfile,
  type PublicMunicipalProfile,
  type PublicSubGroup,
  type JoinRequest,
  type JoinRequestResponse,
} from "@/types/publicProfile.types";
import {
  getSchoolSegmentDetails,
  getEnhancedMemberStatus,
  promoteToEnhancedMember,
  getUserSubscriptionStatus,
  getWorkSegmentDetails,
  deleteSchoolSegmentDetails,
  deleteWorkSegmentDetails,
  updateSchoolSegmentDetails,
  updateWorkSegmentDetails,
  updateHomeSegmentDetails,
  getUserGeoData,
  patchUserHandle,
} from "@lib/api/user.routes";
import {
  getCommunityBusinessProfile,
  updateCommunityBusinessProfile,
  getCommunityBusinessLinks,
  getMunicipalProfile,
  getStandardProfile,
  updateStandardProfile,
  updateMunicipalProfile,
  getMunicipalLinks,
} from "@lib/api/publicProfile.routes";
import { getAllSegments } from "@lib/api/segment.routes";
import { getPublicSubGroups } from "@lib/api/publicSubgroup.routes";
import {
  getAllSubGroupRequests,
  createJoinRequest,
} from "@lib/api/subgroupRequest.routes";
import { UserSegmentRelationship } from "@lib/types/segment.types";

interface ProfileContentProps {
  user: z.infer<typeof UserSchema>;
  token: string;
}

const UNKNOWN = "";
const NOT_SELECTED = "Not Selected";

const LinkTypes = Object.keys(LinkType).filter((item) => {
  return isNaN(Number(item));
});

const FILTER_OPTIONS = ["name", "region", "municipality", "neighborhood"];

const PROFILE_VISIBILITY_OPTIONS: Array<{
  value: ProfileVisibility;
  label: string;
}> = [
  {
    value: ProfileVisibility.PUBLIC,
    label: "Visible to public (visible to anyone looking at website)",
  },
  {
    value: ProfileVisibility.COMMUNITY_MEMBERS,
    label:
      "Visible only to other community members (public profile only visible to members of communities you belong to)",
  },
  {
    value: ProfileVisibility.CONTACTS_ONLY,
    label:
      "Visible only to contacts (only people in your approved contact lists can view public profile)",
  },
  {
    value: ProfileVisibility.PRIVATE,
    label: "Private (no one can view your public profile)",
  },
];

const deleteSchoolSegmentDetail = async (user: string | undefined) => {
  if (user === undefined) return;
  await deleteSchoolSegmentDetails(user);
};

const deleteWorkSegmentDetail = async (user: string | undefined) => {
  if (user === undefined) return;

  await deleteWorkSegmentDetails(user);
};

const updateSchoolSegmentDetail = async (
  user: string | undefined,
  data: any,
) => {
  if (user === undefined) {
    return;
  } else {
    // Build segment handle for UserSegment table
    const segmentHandle = `${data.displayFName}@${data.displayLName}`;

    // Update the scho0ol userHandle
    await patchUserHandle(user, {
      handle: segmentHandle,
      userSegmentRelationship: UserSegmentRelationship.SCHOOL,
    });

    // Update the user details
    await updateSchoolSegmentDetails(user, data);
  }
};

const updateWorkSegmentDetail = async (user: string | undefined, data: any) => {
  if (user === undefined) {
    return;
  } else {
    // Build segment handle for UserSegment table
    const segmentHandle = `${data.displayFName}@${data.displayLName}`;

    // Update the "work" userHandle
    await patchUserHandle(user, {
      handle: segmentHandle,
      userSegmentRelationship: UserSegmentRelationship.WORK,
    });

    // Update the user details
    await updateWorkSegmentDetails(user, data);
  }
};

const updateHomeSegmentDetail = async (user: string | undefined, data: any) => {
  if (user === undefined) return;

  // Build segment handle for UserSegment table
  const segmentHandle = `${data.displayFName}@${data.displayLName}`;

  // Update the "home" userHandle
  await patchUserHandle(user, {
    handle: segmentHandle,
    userSegmentRelationship: UserSegmentRelationship.HOME,
  });

  console.log("updateSegment data: ", data);

  // Update the user details
  await updateHomeSegmentDetails(user, data);
};

const ProfileContent: React.FC<ProfileContentProps> = ({ user, token }) => {
  const {
    email,
    adminmodEmail,
    userType,
    organizationName,
    fname,
    lname,
    address,
    userSegments,
    userHandles,
    imagePath,
    displayFName,
    displayLName,
    createdAt,
  } = user;

  const { streetAddress, streetAddress2, city, postalCode, country } = address!;
  const { homeSegments, workSegments, schoolSegments } =
    getSegmentsFromUserSegments(userSegments);
  const [show, setShow] = useState(false);
  const [stripeStatus, setStripeStatus] = useState("");
  const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
  const [communityBusinessProfile, setCommunityBusinessProfile] = useState<any>(
    {},
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
  const [showWorkSegment, setShowWorkSegment] = useState(
    !!workSegments.segment,
  );
  const [showSchoolSegment, setShowSchoolSegment] = useState(
    !!schoolSegments.segment,
  );
  const [editHomeSegment, setEditHomeSegment] = useState(false);
  const [editWorkSegment, setEditWorkSegment] = useState(false);
  const [editSchoolSegment, setEditSchoolSegment] = useState(false);
  const [isEnhancedMember, setIsEnhancedMember] = useState(false);
  const [upgradingToEnhanced, setUpgradingToEnhanced] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  //find and join public subgroups
  const [publicSubgroupData, setPublicSubgroupData] = useState<
    PublicSubGroup[]
  >([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<PublicSubGroup[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(),
  );
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [joinRequestStatus, setJoinRequestsStatus] = useState<{
    success: boolean;
    sendRequestMessage: string;
  } | null>(null);

  //both now have the handles
  console.log("userHandles", userHandles);
  console.log("User Segments:", userSegments);
  console.log("Full user object in ProfileContent", user);
  console.log("HOMESEGMENT: ", homeSegments);
  console.log("CITY:", homeSegments?.segment?.name);
  console.log("NEIGHBOOURHOOD:", homeSegments?.subSegment?.name);
  console.log("SETSCHOOLSEGMENTS: ", showSchoolSegment);
  console.log("SCHOOLSEGMENT: ", schoolSegments);
  console.log("schoolData: ", schoolData);

  function handleEditPersonalInfo() {
    setEditPersonalInfo(!editPersonalInfo);
  }

  function addNewRow() {
    const table = document.getElementById("formLinksBody");
    const rowCount = table?.childElementCount;
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
  }, [communityBusinessProfile, token]);

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
  }, [municipalProfile, token]);

  useEffect(() => {
    getStandardProfile(user.id, token)
      .then((e) => setStandardProfile(e))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    getEnhancedMemberStatus(user.id, token)
      .then((response) => setIsEnhancedMember(!!response?.isEnhancedMember))
      .catch((e) => console.log(e));
  }, [user.id, token]);

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

  const formatPublicSubGroup = (subgroups: any[]): PublicSubGroup[] => {
    return subgroups.map((s) => ({
      subgroupId: s.id,
      subgroupName: s.name,
      region: s.region.name,
      municipality: s.segment?.name || "",
      neighborhood: s.subSegment?.name || "",
      description: s.description || "",
    }));
  };
  useEffect(() => {
    getPublicSubGroups(user.id, token)
      .then((subgroups: any[]) => {
        setPublicSubgroupData(formatPublicSubGroup(subgroups));
      })
      .catch((e) => console.error(e));
  }, []);

  const formatJoinRequests = (requests: any[]): JoinRequest[] => {
    return requests.map((re) => ({
      requestId: re.id,
      subGroupName: re.subGroup.name,
      status: re.status,
      joinAt: re.joinAt,
    }));
  };

  useEffect(() => {
    getAllSubGroupRequests(user.id, token)
      .then((requests: any[]) => {
        setJoinRequests(formatJoinRequests(requests));
      })
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

  async function handleUpdateProfile() {
    const getInputValue = (id: string, fallback: string = "") => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      return element?.value ?? fallback;
    };

    try {
      if (
        userType === USER_TYPES.BUSINESS ||
        userType === USER_TYPES.COMMUNITY ||
        (userType === USER_TYPES.RESIDENTIAL && isEnhancedMember)
      ) {
        const userId = user.id;
        const statement = getInputValue(
          "formVisionStatement",
          communityBusinessProfile.statement || "",
        );
        const description = getInputValue(
          "formServiceDescription",
          communityBusinessProfile.description || "",
        );
        const linksLocation = document.getElementById("formLinksBody");
        const linksRows = linksLocation?.getElementsByTagName("tr");
        const links: object[] = [];
        if (linksRows) {
          for (let i = 0; i < linksRows.length; i++) {
            const linkType = linksRows[i]
              .getElementsByTagName("td")[0]
              .getElementsByTagName("select")[0].value;
            const linkUrl = linksRows[i]
              .getElementsByTagName("td")[1]
              .getElementsByTagName("input")[0].value;
            links.push({ link: linkUrl, linkType: linkType });
          }
        }

        const profileNew: PublicCommunityBusinessProfile = {
          userId: userId,
          statement: statement,
          description: description,
          links: links,
          profileVisibility: getInputValue(
            "formProfileVisibility",
            communityBusinessProfile.profileVisibility ||
            ProfileVisibility.PUBLIC,
          ) as ProfileVisibility,
          address: getInputValue(
            "formPublicAddress",
            communityBusinessProfile.address || "",
          ),
          contactFirstName: getInputValue(
            "formContactFirstName",
            communityBusinessProfile.contactFirstName || "",
          ),
          contactLastName: getInputValue(
            "formContactLastName",
            communityBusinessProfile.contactLastName || "",
          ),
          contactEmail: getInputValue(
            "formContactEmail",
            communityBusinessProfile.contactEmail || "",
          ),
          contactPhone: getInputValue(
            "formContactPhone",
            communityBusinessProfile.contactPhone || "",
          ),
        };

        const updatedProfile = await updateCommunityBusinessProfile(
          profileNew,
          token,
        );
        setCommunityBusinessProfile(updatedProfile);
        setLinks(updatedProfile.links || []);
        setShowAlert(true);
        setUpgradeStatus(null);
      } else if (userType === USER_TYPES.MUNICIPAL) {
        const userId = user.id;
        const statement = getInputValue(
          "formVisionStatement",
          municipalProfile.statement || "",
        );
        const responsibility = getInputValue(
          "formServiceResponsibility",
          municipalProfile.responsibility || "",
        );
        const linksLocation = document.getElementById("formLinksBody");
        const linksRows = linksLocation?.getElementsByTagName("tr");
        const links: object[] = [];
        if (linksRows) {
          for (let i = 0; i < linksRows.length; i++) {
            const linkType = linksRows[i]
              .getElementsByTagName("td")[0]
              .getElementsByTagName("select")[0].value;
            const linkUrl = linksRows[i]
              .getElementsByTagName("td")[1]
              .getElementsByTagName("input")[0].value;
            links.push({ link: linkUrl, linkType: linkType });
          }
        }

        const profileNew: PublicMunicipalProfile = {
          userId: userId,
          statement: statement,
          responsibility: responsibility,
          links: links,
          address: getInputValue(
            "formPublicAddress",
            municipalProfile.address || "",
          ),
          contactEmail: getInputValue(
            "formContactEmail",
            municipalProfile.contactEmail || "",
          ),
          contactPhone: getInputValue(
            "formContactPhone",
            municipalProfile.contactPhone || "",
          ),
        };

        const updatedProfile = await updateMunicipalProfile(profileNew, token);
        setMunicipalProfile(updatedProfile);
        setLinks(updatedProfile.links || []);
        setShowAlert(true);
        setUpgradeStatus(null);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setShowAlert(false);
      setUpgradeStatus({
        success: false,
        message:
          error?.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
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

  const handleUpgradeToEnhanced = async () => {
    try {
      setUpgradingToEnhanced(true);
      await promoteToEnhancedMember(user.id, token);
      setIsEnhancedMember(true);
      setUpgradeStatus({
        success: true,
        message: "Your account is now upgraded to Enhanced Member.",
      });
    } catch (error) {
      setUpgradeStatus({
        success: false,
        message: "Failed to upgrade account. Please try again.",
      });
    } finally {
      setUpgradingToEnhanced(false);
    }
  };

  // Find and join public SubGroups
  //Handle Filters
  const switchFilter = (filter: string) => {
    setSelectedFilters((curr) => {
      const newSet = new Set(curr);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });
  };

  const getFilterOption = (
    selectedFilters: Set<string>,
    FILTER_OPTIONS: string[],
  ) => {
    if (selectedFilters.size === 0) {
      return [...FILTER_OPTIONS];
    } else {
      return Array.from(selectedFilters);
    }
  };

  //Handle search
  const matchPublicSubGroup = (
    subGroup: PublicSubGroup,
    filtersSearchOption: string[],
    keyword: string | undefined | null,
  ) => {
    const matchResult = filtersSearchOption.some((option) => {
      const lowerCaseKeyword = (keyword ?? "").toLowerCase();
      let value = "";
      switch (option) {
        case "name":
          value = subGroup.subgroupName;
          break;
        case "region":
          value = subGroup.region;
          break;
        case "municipality":
          value = subGroup.municipality || "";
          break;
        case "neighborhood":
          value = subGroup.neighborhood || "";
          break;
      }
      return value.toLowerCase().includes(lowerCaseKeyword);
    });
    return matchResult;
  };

  const handleSearch = (keyword: string) => {
    if (!keyword) {
      setSearchResults([]);
      return;
    }
    if (keyword.trim() === "") {
      setSearchResults(publicSubgroupData);
      return;
    }

    const filtersSearchOption = getFilterOption(
      selectedFilters,
      FILTER_OPTIONS,
    );

    const searchResult = publicSubgroupData.filter((subGroup) =>
      matchPublicSubGroup(subGroup, filtersSearchOption, keyword),
    );

    setSearchResults(searchResult);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    handleSearch(value);
  };

  //Handle Join Request
  const handleJoinRequest = async (
    userId: string | undefined,
    subgroupId: string,
    token: string | undefined,
  ) => {
    if (userId === undefined || token == undefined) {
      return;
    } else {
      try {
        const joinRequestsData: JoinRequestResponse = {
          userId,
          subgroupId,
        };

        const res = await createJoinRequest(joinRequestsData, token);

        if (res.status === 200) {
          setJoinRequestsStatus({
            success: true,
            sendRequestMessage: "Join request sent successfully!",
          });

          const updatedRequests = await getAllSubGroupRequests(userId, token);
          setJoinRequests(formatJoinRequests(updatedRequests));

          const updatedPublicSubgroups = await getPublicSubGroups(
            userId,
            token,
          );
          setPublicSubgroupData(formatPublicSubGroup(updatedPublicSubgroups));

          setSearchResults((prevSearchResults) =>
            prevSearchResults.filter((sub) => sub.subgroupId !== subgroupId),
          );
        } else if (res.status === 409) {
          setJoinRequestsStatus({
            success: false,
            sendRequestMessage: "Request already exists.",
          });
        } else {
          setJoinRequestsStatus({
            success: false,
            sendRequestMessage: "Failed to send the join request.",
          });
        }
      } catch (error) {
        setJoinRequestsStatus({
          success: false,
          sendRequestMessage: "Failed to send the join request.",
        });
      }
    }
  };

  const renderStatusBadge = (status: JoinRequest["status"]) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">APPROVED</Badge>;
      case "REJECTED":
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="warning">PENDING</Badge>;
    }
  };

  console.log(joinRequests);
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
              </ListGroup>

              <ListGroup variant="flush" className="">
                <ListGroup.Item>
                  {organizationName
                    ? capitalize(organizationName)
                    : "Unknown"}{" "}
                </ListGroup.Item>
                <ListGroup.Item>{email}</ListGroup.Item>
                <ListGroup.Item>
                  {streetAddress ? capitalize(streetAddress) : "Unknown"}
                </ListGroup.Item>
                {streetAddress2 ? (
                  <ListGroup.Item>
                    {streetAddress2 ? capitalize(streetAddress2) : "Unknown"}
                  </ListGroup.Item>
                ) : null}
                <ListGroup.Item>
                  {city
                    ? capitalize(city)
                    : capitalize(homeSegments?.segment?.name)}
                </ListGroup.Item>
                <ListGroup.Item>
                  {postalCode ? postalCode.toUpperCase() : "Unknown"}
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
            <Card.Body className="p-4">
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
                          <td>
                            <Form.Control
                              type="text"
                              id="formContactFirstName"
                              placeholder="FirstName"
                              defaultValue={
                                communityBusinessProfile.contactFirstName
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              id="formContactLastName"
                              placeholder="Last Name"
                              defaultValue={
                                communityBusinessProfile.contactLastName
                              }
                            />
                          </td>
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
                              type="text"
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

        <h2 className="mt-4">Find and Join SubGroups</h2>
        <Form className="mb-3">
          <Row className="align-items-start position-relative">
            <Col xs={8} md={6}>
              <Form.Control
                type="text"
                placeholder="Type keywords to search..."
                value={searchKeyword}
                onChange={onSearchChange}
              />
            </Col>

            <Col xs="auto" className="position-relative">
              <Button
                variant="primary"
                onClick={() => setShowFilterOptions((show) => !show)}
                aria-controls="filter-collapse"
                aria-expanded={showFilterOptions}
              >
                Filters
              </Button>
            </Col>
          </Row>

          <Collapse in={showFilterOptions}>
            <div className="mt-2" id="filter-collapse">
              <Form.Label>
                <strong>Select Filters:</strong>
              </Form.Label>
              <div>
                {FILTER_OPTIONS.map((filter) => (
                  <Form.Check
                    inline
                    key={filter}
                    type="checkbox"
                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                    id={`filter-${filter}`}
                    checked={selectedFilters.has(filter)}
                    onChange={() => switchFilter(filter)}
                  />
                ))}
              </div>
            </div>
          </Collapse>
        </Form>

        {joinRequestStatus && (
          <Alert
            variant={joinRequestStatus.success ? "success" : "danger"}
            dismissible
            onClose={() => setJoinRequestsStatus(null)}
          >
            {joinRequestStatus.sendRequestMessage}
          </Alert>
        )}
        <div
          className="border"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {searchResults.length === 0 && searchKeyword.trim() !== "" && (
            <p>No matching subgroups found.</p>
          )}
          {searchResults.map((subGroup: PublicSubGroup) => (
            <Card key={subGroup.subgroupId} className="mb-3 mx-2">
              <Card.Body>
                <Card.Title>{subGroup.subgroupName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {subGroup.region || "No Region"} /{" "}
                  {subGroup.municipality || "No Municipality"} /{" "}
                  {subGroup.neighborhood || "No Neighborhood"}
                </Card.Subtitle>
                <Card.Text>{subGroup.description}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleJoinRequest(user.id, subGroup.subgroupId, token)
                  }
                >
                  Requset to Join
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="mt-4 justify-content-center">
          <h2>Your Join Requests</h2>
          {joinRequests.length === 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tbody>
            </Table>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {joinRequests.map(
                  ({ requestId, subGroupName, status, joinAt }) => (
                    <tr key={requestId}>
                      <td>{subGroupName}</td>
                      <td>{requestId}</td>
                      <td>{renderStatusBadge(status)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    );
  } else if (userType === USER_TYPES.MUNICIPAL_SEG_ADMIN) {
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
              padding: "2rem",
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
                        <strong>Municipality Name: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Full Name: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Email: </strong>
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ padding: "0" }}>
                    <ListGroup variant="flush">
                      <ListGroupItem>
                        {homeSegments
                          ? capitalize(homeSegments.segment?.name)
                          : "Unknown"}
                      </ListGroupItem>
                      <ListGroupItem>
                        {capitalize(fname!)} {capitalize(lname!)}
                      </ListGroupItem>
                      <ListGroupItem>{email!}</ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ maxWidth: "8rem" }}>
                    <Button
                      variant="primary"
                      className="mr-2 mb-2"
                      onClick={handleEditPersonalInfo}
                      style={{ float: "right", marginTop: "10px" }}
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

        <h2 className="mt-4">Find and Join SubGroups</h2>
        <Form className="mb-3">
          <Row className="align-items-start position-relative">
            <Col xs={8} md={6}>
              <Form.Control
                type="text"
                placeholder="Type keywords to search..."
                value={searchKeyword}
                onChange={onSearchChange}
              />
            </Col>

            <Col xs="auto" className="position-relative">
              <Button
                variant="primary"
                onClick={() => setShowFilterOptions((show) => !show)}
                aria-controls="filter-collapse"
                aria-expanded={showFilterOptions}
              >
                Filters
              </Button>
            </Col>
          </Row>

          <Collapse in={showFilterOptions}>
            <div className="mt-2" id="filter-collapse">
              <Form.Label>
                <strong>Select Filters:</strong>
              </Form.Label>
              <div>
                {FILTER_OPTIONS.map((filter) => (
                  <Form.Check
                    inline
                    key={filter}
                    type="checkbox"
                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                    id={`filter-${filter}`}
                    checked={selectedFilters.has(filter)}
                    onChange={() => switchFilter(filter)}
                  />
                ))}
              </div>
            </div>
          </Collapse>
        </Form>

        {joinRequestStatus && (
          <Alert
            variant={joinRequestStatus.success ? "success" : "danger"}
            dismissible
            onClose={() => setJoinRequestsStatus(null)}
          >
            {joinRequestStatus.sendRequestMessage}
          </Alert>
        )}
        <div
          className="border"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {searchResults.length === 0 && searchKeyword.trim() !== "" && (
            <p>No matching subgroups found.</p>
          )}
          {searchResults.map((subGroup: PublicSubGroup) => (
            <Card key={subGroup.subgroupId} className="mb-3 mx-2">
              <Card.Body>
                <Card.Title>{subGroup.subgroupName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {subGroup.region || "No Region"} /{" "}
                  {subGroup.municipality || "No Municipality"} /{" "}
                  {subGroup.neighborhood || "No Neighborhood"}
                </Card.Subtitle>
                <Card.Text>{subGroup.description}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleJoinRequest(user.id, subGroup.subgroupId, token)
                  }
                >
                  Requset to Join
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="mt-4 justify-content-center">
          <h2>Your Join Requests</h2>
          {joinRequests.length === 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tbody>
            </Table>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {joinRequests.map(
                  ({ requestId, subGroupName, status, joinAt }) => (
                    <tr key={requestId}>
                      <td>{subGroupName}</td>
                      <td>{requestId}</td>
                      <td>{renderStatusBadge(status)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    );
  } else if (userType === USER_TYPES.MUNICIPAL) {
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
              {fname ? capitalize(fname) : "Unknown"}{" "}
              {lname ? capitalize(lname) : "Unknown"}
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
                        <strong>Municipality Name: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Full Name: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Email: </strong>
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ padding: "0" }}>
                    <ListGroup variant="flush">
                      <ListGroupItem>
                        {homeSegments
                          ? capitalize(homeSegments.segment?.name)
                          : "Unknown"}
                      </ListGroupItem>
                      <ListGroupItem>
                        {capitalize(fname!)} {capitalize(lname!)}
                      </ListGroupItem>
                      <ListGroupItem>{email!}</ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ maxWidth: "8rem" }}>
                    <Button
                      variant="primary"
                      className="mr-2 mb-2"
                      onClick={handleEditPersonalInfo}
                      style={{ float: "right", marginTop: "5px" }}
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

        <h2 className="mt-4">Find and Join SubGroups</h2>
        <Form className="mb-3">
          <Row className="align-items-start position-relative">
            <Col xs={8} md={6}>
              <Form.Control
                type="text"
                placeholder="Type keywords to search..."
                value={searchKeyword}
                onChange={onSearchChange}
              />
            </Col>

            <Col xs="auto" className="position-relative">
              <Button
                variant="primary"
                onClick={() => setShowFilterOptions((show) => !show)}
                aria-controls="filter-collapse"
                aria-expanded={showFilterOptions}
              >
                Filters
              </Button>
            </Col>
          </Row>

          <Collapse in={showFilterOptions}>
            <div className="mt-2" id="filter-collapse">
              <Form.Label>
                <strong>Select Filters:</strong>
              </Form.Label>
              <div>
                {FILTER_OPTIONS.map((filter) => (
                  <Form.Check
                    inline
                    key={filter}
                    type="checkbox"
                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                    id={`filter-${filter}`}
                    checked={selectedFilters.has(filter)}
                    onChange={() => switchFilter(filter)}
                  />
                ))}
              </div>
            </div>
          </Collapse>
        </Form>

        {joinRequestStatus && (
          <Alert
            variant={joinRequestStatus.success ? "success" : "danger"}
            dismissible
            onClose={() => setJoinRequestsStatus(null)}
          >
            {joinRequestStatus.sendRequestMessage}
          </Alert>
        )}
        <div
          className="border"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {searchResults.length === 0 && searchKeyword.trim() !== "" && (
            <p>No matching subgroups found.</p>
          )}
          {searchResults.map((subGroup: PublicSubGroup) => (
            <Card key={subGroup.subgroupId} className="mb-3 mx-2">
              <Card.Body>
                <Card.Title>{subGroup.subgroupName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {subGroup.region || "No Region"} /{" "}
                  {subGroup.municipality || "No Municipality"} /{" "}
                  {subGroup.neighborhood || "No Neighborhood"}
                </Card.Subtitle>
                <Card.Text>{subGroup.description}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleJoinRequest(user.id, subGroup.subgroupId, token)
                  }
                >
                  Requset to Join
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="mt-4 justify-content-center">
          <h2>Your Join Requests</h2>
          {joinRequests.length === 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tbody>
            </Table>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {joinRequests.map(
                  ({ requestId, subGroupName, status, joinAt }) => (
                    <tr key={requestId}>
                      <td>{subGroupName}</td>
                      <td>{requestId}</td>
                      <td>{renderStatusBadge(status)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    );
  } else if (
    userType === USER_TYPES.SUPER_ADMIN ||
    userType === USER_TYPES.ADMIN ||
    userType === USER_TYPES.SEG_ADMIN ||
    userType === USER_TYPES.MOD ||
    userType === USER_TYPES.SEG_MOD
  ) {
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
              {fname ? capitalize(fname) : "Unknown"}{" "}
              {lname ? capitalize(lname) : "Unknown"}
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
                        <strong>Contact Email: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Login Email: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>User Type: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Access Level: </strong>
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ padding: "0" }}>
                    <ListGroup variant="flush">
                      <ListGroupItem>
                        {capitalize(fname!)} {capitalize(lname!)}
                      </ListGroupItem>
                      <ListGroupItem>{email!}</ListGroupItem>
                      <ListGroupItem>{adminmodEmail!}</ListGroupItem>
                      <ListGroupItem>{userType!}</ListGroupItem>
                      <ListGroupItem>
                        {userType === USER_TYPES.SUPER_ADMIN ||
                          USER_TYPES.ADMIN ||
                          userType === USER_TYPES.MOD
                          ? "Full Access"
                          : userType === USER_TYPES.SEG_ADMIN ||
                            userType === USER_TYPES.SEG_MOD
                            ? user.userSegments
                            : "Unknown"}
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ maxWidth: "8rem" }}>
                    <Button
                      variant="primary"
                      className=""
                      onClick={handleEditPersonalInfo}
                      style={{ float: "right", marginTop: "10px" }}
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

        <h2 className="mt-4">Find and Join SubGroups</h2>
        <Form className="mb-3">
          <Row className="align-items-start position-relative">
            <Col xs={8} md={6}>
              <Form.Control
                type="text"
                placeholder="Type keywords to search..."
                value={searchKeyword}
                onChange={onSearchChange}
              />
            </Col>

            <Col xs="auto" className="position-relative">
              <Button
                variant="primary"
                onClick={() => setShowFilterOptions((show) => !show)}
                aria-controls="filter-collapse"
                aria-expanded={showFilterOptions}
              >
                Filters
              </Button>
            </Col>
          </Row>

          <Collapse in={showFilterOptions}>
            <div className="mt-2" id="filter-collapse">
              <Form.Label>
                <strong>Select Filters:</strong>
              </Form.Label>
              <div>
                {FILTER_OPTIONS.map((filter) => (
                  <Form.Check
                    inline
                    key={filter}
                    type="checkbox"
                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                    id={`filter-${filter}`}
                    checked={selectedFilters.has(filter)}
                    onChange={() => switchFilter(filter)}
                  />
                ))}
              </div>
            </div>
          </Collapse>
        </Form>

        {joinRequestStatus && (
          <Alert
            variant={joinRequestStatus.success ? "success" : "danger"}
            dismissible
            onClose={() => setJoinRequestsStatus(null)}
          >
            {joinRequestStatus.sendRequestMessage}
          </Alert>
        )}
        <div
          className="border"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {searchResults.length === 0 && searchKeyword.trim() !== "" && (
            <p>No matching subgroups found.</p>
          )}
          {searchResults.map((subGroup: PublicSubGroup) => (
            <Card key={subGroup.subgroupId} className="mb-3 mx-2">
              <Card.Body>
                <Card.Title>{subGroup.subgroupName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {subGroup.region || "No Region"} /{" "}
                  {subGroup.municipality || "No Municipality"} /{" "}
                  {subGroup.neighborhood || "No Neighborhood"}
                </Card.Subtitle>
                <Card.Text>{subGroup.description}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleJoinRequest(user.id, subGroup.subgroupId, token)
                  }
                >
                  Requset to Join
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="mt-4 justify-content-center">
          <h2>Your Join Requests</h2>
          {joinRequests.length === 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tbody>
            </Table>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {joinRequests.map(
                  ({ requestId, subGroupName, status, joinAt }) => (
                    <tr key={requestId}>
                      <td>{subGroupName}</td>
                      <td>{requestId}</td>
                      <td>{renderStatusBadge(status)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </Table>
          )}
        </div>
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
              {fname ? capitalize(fname) : "Unknown"}{" "}
              {lname ? capitalize(lname) : "Unknown"}
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
                        <strong>User Type: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Creation Date: </strong>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Community Request: </strong>
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                  <Col style={{ padding: "0" }}>
                    <ListGroup variant="flush">
                      <ListGroupItem>
                        {capitalize(fname!)} {capitalize(lname!)}
                      </ListGroupItem>
                      <ListGroupItem>{email!}</ListGroupItem>
                      <ListGroupItem>{userType!}</ListGroupItem>
                      <ListGroupItem>
                        {new Date(createdAt!).toISOString().split("T")[0]}
                      </ListGroupItem>
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
                      style={{ float: "right", marginTop: "10px" }}
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

        <Row className="mb-4 mt-4 justify-content-center">
          <h2 className="pb-2 pt-2 display-6">Public Profile</h2>
        </Row>

        <Row>
          <Card style={{ width: "80rem" }}>
            <Card.Body className="my-5">
              {upgradeStatus ? (
                <Alert
                  variant={upgradeStatus.success ? "success" : "danger"}
                  dismissible
                  onClose={() => setUpgradeStatus(null)}
                >
                  {upgradeStatus.message}
                </Alert>
              ) : null}

              {isEnhancedMember ? (
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
                  <h4 className="mb-3">Public Profile Information</h4>
                  <Form.Group className="mb-3" controlId="formVisionStatement">
                    <Form.Label>Personal Statement</Form.Label>
                    <Form.Control
                      type="text"
                      id="formVisionStatement"
                      placeholder="Say a few words about your mission/vision"
                      defaultValue={communityBusinessProfile.statement}
                      maxLength={TEXT_INPUT_LIMIT.MISSION_STATEMENT}
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="formServiceDescription"
                  >
                    <Form.Label>Skill Set</Form.Label>
                    <Form.Control
                      type="text"
                      id="formServiceDescription"
                      placeholder="Tell us about the skills you have"
                      defaultValue={communityBusinessProfile.description}
                      maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="formLinks"
                    id="formLinks"
                  >
                    <Form.Label>Social Media Links</Form.Label>
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
                            <tr key={links.indexOf(link)}>
                              <td>
                                <Form.Control
                                  as="select"
                                  onChange={(e) => {
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

                  <hr className="my-4" />
                  <h4 className="mb-3">Public Profile Settings</h4>
                  <Form.Group
                    className="mb-0"
                    controlId="formProfileVisibility"
                  >
                    <Form.Label>Visibility Preferences</Form.Label>
                    <Form.Control
                      as="select"
                      id="formProfileVisibility"
                      defaultValue={
                        communityBusinessProfile.profileVisibility ||
                        ProfileVisibility.PUBLIC
                      }
                    >
                      {PROFILE_VISIBILITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Text className="text-muted">
                      Admins, Moderators, and Municipal users can always view
                      public profiles.
                    </Form.Text>
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Update
                  </Button>
                </Form>
              ) : (
                <div className="bg-light p-4 rounded text-muted">
                  <h4 className="mb-3">Public Profile Information</h4>
                  <Form id="formPublicProfile">
                    <fieldset disabled>
                      <Form.Group
                        className="mb-3"
                        controlId="formVisionStatement"
                      >
                        <Form.Label>Personal Statement</Form.Label>
                        <Form.Control
                          type="text"
                          id="formVisionStatement"
                          placeholder="Say a few words about your mission/vision"
                          defaultValue={communityBusinessProfile.statement}
                          maxLength={TEXT_INPUT_LIMIT.MISSION_STATEMENT}
                        />
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="formServiceDescription"
                      >
                        <Form.Label>Skill Set</Form.Label>
                        <Form.Control
                          type="text"
                          id="formServiceDescription"
                          placeholder="Tell us about the skills you have"
                          defaultValue={communityBusinessProfile.description}
                          maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
                        />
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="formLinks"
                        id="formLinks"
                      >
                        <Form.Label>Social Media Links</Form.Label>
                        <Button className="float-right" size="sm" disabled>
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
                                <tr key={links.indexOf(link)}>
                                  <td>
                                    <Form.Control
                                      as="select"
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
                                      maxLength={TEXT_INPUT_LIMIT.EXTERNAL_LINK}
                                    />
                                  </td>
                                  <td>
                                    <NavDropdown
                                      title="Controls"
                                      id="nav-dropdown"
                                    >
                                      <Dropdown.Item class="deleteButton">
                                        Delete
                                      </Dropdown.Item>
                                    </NavDropdown>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      </Form.Group>
                      <hr className="my-4" />
                      <h4 className="mb-3">Public Profile Settings</h4>
                      <Form.Group
                        className="mb-0"
                        controlId="formProfileVisibility"
                      >
                        <Form.Label>Visibility Preferences</Form.Label>
                        <Form.Control
                          as="select"
                          id="formProfileVisibility"
                          defaultValue={
                            communityBusinessProfile.profileVisibility ||
                            ProfileVisibility.PUBLIC
                          }
                        >
                          {PROFILE_VISIBILITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Control>
                        <Form.Text className="text-muted">
                          Admins, Moderators, and Municipal users can always
                          view public profiles.
                        </Form.Text>
                      </Form.Group>
                    </fieldset>
                  </Form>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      Upgrade to Enhanced Member to edit your public profile.
                    </span>
                    <Button
                      variant="secondary"
                      onClick={handleUpgradeToEnhanced}
                      disabled={upgradingToEnhanced}
                    >
                      {upgradingToEnhanced ? "Upgrading..." : "Upgrade Account"}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Row>

        <Row className="mt-3">
          <SegmentInfo
            user={user!}
            token={token!}
            title={"Residence Segment"}
            type={"home"}
            segmentData={{
              segmentId: homeSegments?.segment ? homeSegments.segment.segId : 0,
              segmentHandle:
                userHandles?.find(
                  (h) =>
                    h.userSegmentRelationship ===
                    UserSegmentRelationship.HOME,
                )?.handle ?? "",
              street: streetAddress ? streetAddress : UNKNOWN,
              city: homeSegments.segment
                ? homeSegments.segment.name
                : NOT_SELECTED,
              postalCode: postalCode ? postalCode : UNKNOWN,
              neighborhood: homeSegments.subSegment
                ? homeSegments.subSegment.name
                : NOT_SELECTED,
            }}
            geoData={{
              lat: geoData!.lat ? geoData!.lat : 0,
              lon: geoData!.lon ? geoData!.lon : 0,
            }}
            segments={segments!}
            edit={editHomeSegment}
            setEdit={setEditHomeSegment}
            updateFunction={updateHomeSegmentDetail}
          ></SegmentInfo>
        </Row>
        <Row className="mt-3">
          {showWorkSegment ? (
            <SegmentInfo
              user={user!}
              token={token!}
              title={"Business Segment"}
              type={"work"}
              segmentData={{
                segmentId: workSegments?.segment
                  ? workSegments.segment.segId
                  : 0,
                segmentHandle:
                  userHandles?.find(
                    (h) =>
                      h.userSegmentRelationship ===
                      UserSegmentRelationship.WORK,
                  )?.handle ?? "",
                street: workData!.streetAddress
                  ? workData!.streetAddress
                  : UNKNOWN,
                city: workSegments?.segment
                  ? workSegments.segment.name
                  : NOT_SELECTED,
                postalCode: workData!.postalCode
                  ? workData!.postalCode
                  : UNKNOWN,
                neighborhood: workSegments.subSegment
                  ? workSegments.subSegment.name
                  : NOT_SELECTED,
              }}
              geoData={{
                lat: geoData!.work_lat ? geoData!.work_lat : 0,
                lon: geoData!.work_lon ? geoData!.work_lon : 0,
              }}
              segments={segments!}
              edit={editWorkSegment}
              setEdit={setEditWorkSegment}
              deleteFunction={deleteWorkSegmentDetail}
              updateFunction={updateWorkSegmentDetail}
            ></SegmentInfo>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setShowWorkSegment(true);
                setEditWorkSegment(true);
              }}
            >
              Add Work Segment
            </Button>
          )}
        </Row>
        <Row className="mt-3">
          {showSchoolSegment ? (
            <SegmentInfo
              user={user!}
              token={token!}
              title={"School Segment"}
              type={"school"}
              segmentData={{
                segmentId: schoolSegments?.segment
                  ? schoolSegments.segment.segId
                  : 0,
                segmentHandle:
                  userHandles?.find(
                    (h) =>
                      h.userSegmentRelationship ===
                      UserSegmentRelationship.SCHOOL,
                  )?.handle ?? "",
                street: schoolData?.streetAddress ?? UNKNOWN,
                city: schoolSegments?.segment
                  ? schoolSegments.segment.name
                  : NOT_SELECTED,
                postalCode: schoolData?.postalCode ?? UNKNOWN,
                neighborhood: schoolSegments.subSegment
                  ? schoolSegments.subSegment.name
                  : NOT_SELECTED,
              }}
              geoData={{
                lat: geoData!.school_lat ? geoData!.school_lat : 0,
                lon: geoData!.school_lon ? geoData!.school_lon : 0,
              }}
              segments={segments!}
              edit={editSchoolSegment}
              setEdit={setEditSchoolSegment}
              deleteFunction={deleteSchoolSegmentDetail}
              updateFunction={updateSchoolSegmentDetail}
            ></SegmentInfo>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setShowSchoolSegment(true);
                setEditSchoolSegment(true);
              }}
            >
              Add School Segment
            </Button>
          )}
        </Row>

        <h2 className="mt-4">Find and Join SubGroups</h2>
        <Form className="mb-3">
          <Row className="align-items-start position-relative">
            <Col xs={8} md={6}>
              <Form.Control
                type="text"
                placeholder="Type keywords to search..."
                value={searchKeyword}
                onChange={onSearchChange}
              />
            </Col>

            <Col xs="auto" className="position-relative">
              <Button
                variant="primary"
                onClick={() => setShowFilterOptions((show) => !show)}
                aria-controls="filter-collapse"
                aria-expanded={showFilterOptions}
              >
                Filters
              </Button>
            </Col>
          </Row>

          <Collapse in={showFilterOptions}>
            <div className="mt-2" id="filter-collapse">
              <Form.Label>
                <strong>Select Filters:</strong>
              </Form.Label>
              <div>
                {FILTER_OPTIONS.map((filter) => (
                  <Form.Check
                    inline
                    key={filter}
                    type="checkbox"
                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                    id={`filter-${filter}`}
                    checked={selectedFilters.has(filter)}
                    onChange={() => switchFilter(filter)}
                  />
                ))}
              </div>
            </div>
          </Collapse>
        </Form>

        {joinRequestStatus && (
          <Alert
            variant={joinRequestStatus.success ? "success" : "danger"}
            dismissible
            onClose={() => setJoinRequestsStatus(null)}
          >
            {joinRequestStatus.sendRequestMessage}
          </Alert>
        )}
        <div
          className="border"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {searchResults.length === 0 && searchKeyword.trim() !== "" && (
            <p>No matching subgroups found.</p>
          )}
          {searchResults.map((subGroup: PublicSubGroup) => (
            <Card key={subGroup.subgroupId} className="mb-3 mx-2">
              <Card.Body>
                <Card.Title>{subGroup.subgroupName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {subGroup.region || "No Region"} /{" "}
                  {subGroup.municipality || "No Municipality"} /{" "}
                  {subGroup.neighborhood || "No Neighborhood"}
                </Card.Subtitle>
                <Card.Text>{subGroup.description}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleJoinRequest(user.id, subGroup.subgroupId, token)
                  }
                >
                  Requset to Join
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="mt-4 justify-content-center">
          <h2>Your Join Requests</h2>
          {joinRequests.length === 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tbody>
            </Table>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>SubGroup Name</th>
                  <th>Request ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {joinRequests.map(
                  ({ requestId, subGroupName, status, joinAt }) => (
                    <tr key={requestId}>
                      <td>{subGroupName}</td>
                      <td>{requestId}</td>
                      <td>{renderStatusBadge(status)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    );
  }
};

export default ProfileContent;
