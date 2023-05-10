import { useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Form,
  Button,
  Alert,
  Image,
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
// import { getUserHomeSegmentInfo, getUserSchoolSegmentInfo, getUserWorkSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { API_BASE_URL } from "src/lib/constants";
import {
  ISegment,
  ISegmentData,
  ISubSegment,
} from "src/lib/types/data/segment.type";
import { UserProfileContext } from "../../contexts/UserProfile.Context";
import { postCreateIdea } from "../../lib/api/ideaRoutes";
import { ICategory } from "../../lib/types/data/category.type";
import { ICreateIdeaInput } from "../../lib/types/input/createIdea.input";
import { IFetchError } from "../../lib/types/types";
import {
  capitalizeFirstLetterEachWord,
  capitalizeString,
  handlePotentialAxiosError,
} from "../../lib/utilityFunctions";
import { CONTENT, Toastie } from "../partials/LandingContent/CategoriesSection";
import ImageUploader from "react-images-upload";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import SubmitDirectProposalPage from "src/pages/SubmitDirectProposalPage";
import {
  getDirectProposal,
  postCreateProposal,
} from "src/lib/api/proposalRoutes";
import SimpleMap from "../map/SimpleMap";
import { MAP_KEY } from "../../lib/constants";

interface SubmitDirectProposalPageContentProps {
  categories: ICategory[] | undefined;
  segData: ISegmentData[];
}

/**
 * Idea needs categoryId to submit
 * default will be used if categories can't be fetched from server
 */
const DEFAULT_CAT_ID = 1;

const SubmitDirectProposalPageContent: React.FC<
  SubmitDirectProposalPageContentProps
> = ({ categories, segData }) => {
  const [markers, sendData]: any = useState({
    home: { lat: null, lon: null },
  });

  const [map, showMap] = useState(false);
  const { token, user } = useContext(UserProfileContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IFetchError | null>(null);
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  const history = useHistory();

  const [extraFeedback, setExtraFeedback] = useState(false);

  const toggleExtraFeedback = () => {
    setExtraFeedback(!extraFeedback);
  };

  const [numberOfFeedback, setNumberOfFeedback] = useState(1);

  const toggleNumberOfFeedback = (num: number) => {
    if (
      (numberOfFeedback == 1 && num < 0) ||
      (numberOfFeedback == 5 && num > 0)
    ) {
      return;
    }
    setNumberOfFeedback(numberOfFeedback + num);
  };

  const handleCommunityChange = (index: number) => {
    if (segData[index].segType === "Segment") {
      formik.setFieldValue("segmentId", segData[index].id);
      formik.setFieldValue("superSegmentId", undefined);
      formik.setFieldValue("subSegmentId", undefined);
    }
    if (segData[index].segType === "Sub-Segment") {
      formik.setFieldValue("subSegmentId", segData[index].id);
      formik.setFieldValue("superSegmentId", undefined);
      formik.setFieldValue("segmentId", undefined);
    }
    if (segData[index].segType === "Super-Segment") {
      formik.setFieldValue("superSegmentId", segData[index].id);
      formik.setFieldValue("subSegmentId", undefined);
      formik.setFieldValue("segmentId", undefined);
    }
    formik.setFieldValue("userType", segData[index].userType);
  };
  const submitHandler = async (values: ICreateIdeaInput) => {
    try {
      // Set loading and error state
      console.log(values);
      setError(null);
      setIsLoading(true);
      setTimeout(() => console.log("timeout"), 5000);
      //const ideaValues with <ICreateIdeaInput> interface
      const ideaValues: ICreateIdeaInput = {
        categoryId: values.categoryId,
        title: values.title,
        userType: values.userType,
        description: values.description,
        artsImpact: values.artsImpact,
        communityImpact: values.communityImpact,
        energyImpact: values.energyImpact,
        manufacturingImpact: values.manufacturingImpact,
        natureImpact: values.natureImpact,
        address: {
          streetAddress: values.address!.streetAddress,
          streetAddress2: values.address!.streetAddress2,
          city: values.address!.city,
          postalCode: values.address!.postalCode,
          country: values.address!.country,
        },
        geo: {
          lat: values.geo!.lat,
          lon: values.geo!.lon,
        },
        segmentId: values.segmentId,
        subSegmentId: values.subSegmentId,
        superSegmentId: values.superSegmentId,
        state: "PROPOSAL",
      };
      const idea = await postCreateIdea(ideaValues, user!.banned, token);
      const proposalValues = {
        ideaId: idea.id,
        needCollaborators: values.needCollaborators,
        needVolunteers: values.needVolunteers,
        needDonations: values.needDonations,
        needFeedback: values.needFeedback,
        needSuggestions: values.needSuggestions,
        location: values.location,
      };
      console.log("proposalValues", proposalValues);
      const proposal = await postCreateProposal(
        proposalValues,
        user!.banned,
        token
      );
      console.log(idea);
      console.log(proposal);
      setError(null);
      history.push("/proposals/" + proposal.id);
      formik.resetForm();
    } catch (error) {
      const genericMessage =
        "An error occured while trying to create a Proposal.";
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  function toggleElement(str: string, str2: string) {
    let x = document.getElementById(str)!;
    let y = document.getElementById(str2)!;
    if (x.style.display === "none") {
      x.style.display = "block";
      y.style.display = "none";
    } else {
      x.style.display = "none";
      y.style.display = "block";
    }
  }

  const formik = useFormik<ICreateIdeaInput>({
    initialValues: {
      // TODO: CatId when chosen is a string
      categoryId: categories ? categories[0].id : DEFAULT_CAT_ID,
      title: "",
      userType: segData ? segData[0].userType : "Resident",
      description: "",
      artsImpact: "",
      communityImpact: "",
      energyImpact: "",
      manufacturingImpact: "",
      natureImpact: "",
      address: {
        streetAddress: "",
        streetAddress2: "",
        city: "",
        postalCode: "",
        country: "",
      },
      geo: {
        lat: undefined,
        lon: undefined,
      },
      segmentId: undefined,
      subSegmentId: undefined,
      superSegmentId: undefined,
      needCollaborators: false,
      needVolunteers: false,
      needDonations: false,
      needFeedback: false,
      needSuggestions: false,
      location: "",
    },
    onSubmit: submitHandler,
  });

  useEffect(() => {
    if (segData) {
      handleCommunityChange(0);
    }
  }, []);

  function reverseGeocode() {
    setIsLoading(true);
    fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        (markers.home.lat ? markers.home.lat : "48.4284") +
        "," +
        (markers.home.lng ? markers.home.lng : "-123.3656") +
        "&key=" +
        MAP_KEY
    )
      .then((response) => response.json())
      .then((data) => {
        let address = data.results[0].formatted_address;
        console.log(address);
        formik.setFieldValue("location", address);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("error", error);
        setIsLoading(false);
      });
  }

  return (
    <Container className="submit-idea-page-content">
      <Row className="mb-4 mt-4 justify-content-center">
        <h2 className="pb-2 pt-2 display-6">Submit Direct Proposal</h2>
      </Row>
      <Row className="submit-idea-form-group justify-content-center">
        <Col lg={10}>
          <Form onSubmit={formik.handleSubmit}>
            <Form.Group controlId="submitIdeaCategory">
              <h3
                className="border-bottom mb-3"
                style={{ paddingBottom: "1rem" }}
              >
                Direct Proposal Details
              </h3>
              <Form.Label>*Select Category:</Form.Label>
              <Form.Control
                as="select"
                name="categoryId"
                onChange={formik.handleChange}
                value={formik.values.categoryId}
              >
                {categories &&
                  categories.map((cat) => (
                    <option
                      key={String(cat.id)}
                      value={Number(cat.id)}
                      style={{
                        textTransform: "capitalize",
                      }}
                    >
                      {capitalizeString(cat.title)}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>*Select your community of interest</Form.Label>
              <Form.Control
                as="select"
                type="number"
                onChange={(e) => handleCommunityChange(Number(e.target.value))}
              >
                {segData &&
                  segData.map((seg, index) => (
                    <option key={String(seg.name)} value={index}>
                      {capitalizeString(seg.name)}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>*What is the title of your proposal?</Form.Label>
              <Form.Control
                type="text"
                name="title"
                onChange={formik.handleChange}
                value={formik.values.title}
                placeholder="Enter the title of your proposal"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>*Describe your proposal</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Proposal image</Form.Label>
              <ImageUploader
                name="imagePath"
                fileContainerStyle={{ backgroundColor: "#F8F9FA" }}
                withPreview={true}
                onChange={(picture) => {
                  formik.setFieldValue("imagePath", picture);
                  console.log(picture);
                }}
                imgExtension={[".jpg", ".jpeg", ".png", ".webp"]}
                buttonText="Select Proposal Image"
                maxFileSize={10485760}
                label={"Max file size 10mb, \n jpg, jpeg, png, webp"}
                singleImage={true}
              />
            </Form.Group>
            <Form.Group>
              <h3
                className="border-bottom mb-3"
                style={{ paddingBottom: "1rem", paddingTop: "1rem" }}
              >
                Impact Areas
              </h3>
              <Row className="align-items-end">
                <Col xs={12}>
                  <Row>
                    <div className="container">
                      <div style={{ width: "fit-content", float: "left" }}>
                        <Form.Label>Community and Place</Form.Label>
                      </div>
                      <div
                        style={{
                          marginTop: "-5px",
                          marginLeft: "10px",
                          float: "left",
                          height: "2rem",
                          width: "2rem",
                        }}
                      >
                        <a href="javascript:void(0)">
                          <Toastie
                            header={CONTENT.community.header}
                            subHeader={CONTENT.community.subHeader}
                            body={CONTENT.community.body}
                            img="/greenI.png"
                            sizePercent="90%"
                          />
                        </a>
                      </div>
                    </div>
                  </Row>

                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="communityImpact"
                    onChange={formik.handleChange}
                    value={formik.values.communityImpact}
                    placeholder=""
                    style={{ marginTop: "0rem" }}
                  />
                </Col>
                <Col></Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={12}>
                  <Row>
                    <div className="container" style={{ marginTop: "1rem" }}>
                      <div style={{ width: "fit-content", float: "left" }}>
                        <Form.Label>Nature and Food Security</Form.Label>
                      </div>
                      <div
                        style={{
                          marginTop: "-5px",
                          marginLeft: "10px",
                          float: "left",
                          height: "2rem",
                          width: "2rem",
                        }}
                      >
                        <a href="javascript:void(0)">
                          <Toastie
                            header={CONTENT.nature.header}
                            subHeader={CONTENT.nature.subHeader}
                            body={CONTENT.nature.body}
                            img="/greenI.png"
                            sizePercent="90%"
                          />
                        </a>
                      </div>
                    </div>
                  </Row>

                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="natureImpact"
                    onChange={formik.handleChange}
                    value={formik.values.natureImpact}
                    placeholder=""
                    style={{ marginTop: "0rem" }}
                  />
                </Col>
                <Col></Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={12}>
                  <Row>
                    <div className="container" style={{ marginTop: "1rem" }}>
                      <div style={{ width: "fit-content", float: "left" }}>
                        <Form.Label>Arts, Culture, and Education</Form.Label>
                      </div>
                      <div
                        style={{
                          marginTop: "-5px",
                          marginLeft: "10px",
                          float: "left",
                          height: "2rem",
                          width: "2rem",
                        }}
                      >
                        <a href="javascript:void(0)">
                          <Toastie
                            header={CONTENT.arts.header}
                            subHeader={CONTENT.arts.subHeader}
                            body={CONTENT.arts.body}
                            img="/greenI.png"
                            sizePercent="90%"
                          />
                        </a>
                      </div>
                    </div>
                  </Row>

                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="artsImpact"
                    onChange={formik.handleChange}
                    value={formik.values.artsImpact}
                    placeholder=""
                    style={{ marginTop: "0rem" }}
                  />
                </Col>
                <Col></Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={12}>
                  <Row>
                    <div className="container" style={{ marginTop: "1rem" }}>
                      <div style={{ width: "fit-content", float: "left" }}>
                        <Form.Label>Water and Energy</Form.Label>
                      </div>
                      <div
                        style={{
                          marginTop: "-5px",
                          marginLeft: "10px",
                          float: "left",
                          height: "2rem",
                          width: "2rem",
                        }}
                      >
                        <a href="javascript:void(0)">
                          <Toastie
                            header={CONTENT.water.header}
                            subHeader={CONTENT.water.subHeader}
                            body={CONTENT.water.body}
                            img="/greenI.png"
                            sizePercent="90%"
                          />
                        </a>
                      </div>
                    </div>
                  </Row>

                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="energyImpact"
                    onChange={formik.handleChange}
                    value={formik.values.energyImpact}
                    placeholder=""
                    style={{ marginTop: "0rem" }}
                  />
                </Col>
                <Col></Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={12}>
                  <Row>
                    <div className="container" style={{ marginTop: "1rem" }}>
                      <div style={{ width: "fit-content", float: "left" }}>
                        <Form.Label>Manufacturing and Waste</Form.Label>
                      </div>
                      <div
                        style={{
                          marginTop: "-5px",
                          marginLeft: "10px",
                          float: "left",
                          height: "2rem",
                          width: "2rem",
                        }}
                      >
                        <a href="javascript:void(0)">
                          <Toastie
                            header={CONTENT.manufacturing.header}
                            subHeader={CONTENT.manufacturing.subHeader}
                            body={CONTENT.manufacturing.body}
                            img="/greenI.png"
                            sizePercent="90%"
                          />
                        </a>
                      </div>
                    </div>
                  </Row>

                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="manufacturingImpact"
                    onChange={formik.handleChange}
                    value={formik.values.manufacturingImpact}
                    placeholder=""
                    style={{ marginTop: "0rem" }}
                  />
                </Col>
                <Col></Col>
              </Row>
            </Form.Group>

            <Form.Group>
              <div className="checkbox">
                <h3
                  className="border-bottom mb-3"
                  style={{ paddingBottom: "1rem", paddingTop: "1rem" }}
                >
                  Community Solicitation
                </h3>
                <div>
                  <input
                    className="collaboration-checkbox"
                    type="checkbox"
                    name="needCollaborators"
                    onChange={formik.handleChange}
                  />
                  <Form.Label>
                    &nbsp;&nbsp;Project Team/Collaborators
                  </Form.Label>
                  <br />
                  <input
                    className="volunteer-checkbox"
                    type="checkbox"
                    name="needVolunteers"
                    onChange={formik.handleChange}
                  />
                  <Form.Label>&nbsp;&nbsp;Volunteers</Form.Label> <br />
                  <input
                    className="donation-checkbox"
                    type="checkbox"
                    name="needDonations"
                    onChange={formik.handleChange}
                  />
                  <Form.Label>&nbsp;&nbsp;Material Donations</Form.Label> <br />
                  <input
                    className="suggestion-checkbox"
                    type="checkbox"
                    name="needSuggestions"
                    onChange={formik.handleChange}
                  />
                  <Form.Label>&nbsp;&nbsp;Idea Proposals</Form.Label> <br />
                  <input
                    className="other-checkbox"
                    type="checkbox"
                    name="needFeedback"
                    onClick={toggleExtraFeedback}
                  />
                  <Form.Label>
                    &nbsp;&nbsp;Specific Feedback&nbsp;&nbsp;
                  </Form.Label>
                  {extraFeedback && (
                    <>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => toggleNumberOfFeedback(-1)}
                      >
                        -
                      </Button>
                      &nbsp;&nbsp;
                      <Button
                        color="success"
                        size="sm"
                        onClick={() => toggleNumberOfFeedback(1)}
                      >
                        +
                      </Button>
                      {numberOfFeedback > 0 && (
                        <div className="feedback-1">
                          <br />
                          <Form.Label>
                            &nbsp;&nbsp;Specific Feedback #1
                          </Form.Label>
                          <br />
                          <Form.Control
                            type="text"
                            name="specificFeedback1"
                            onChange={formik.handleChange}
                            placeholder="Extra Feedback"
                          />
                        </div>
                      )}
                      {numberOfFeedback > 1 && (
                        <div className="feedback-2">
                          <br />
                          <Form.Label>
                            &nbsp;&nbsp;Specific Feedback #2
                          </Form.Label>
                          <br />
                          <Form.Control
                            type="text"
                            name="specificFeedback1"
                            onChange={formik.handleChange}
                            placeholder="Extra Feedback"
                          />
                        </div>
                      )}
                      {numberOfFeedback > 2 && (
                        <div className="feedback-3">
                          <br />
                          <Form.Label>
                            &nbsp;&nbsp;Specific Feedback #3
                          </Form.Label>
                          <br />
                          <Form.Control
                            type="text"
                            name="specificFeedback1"
                            onChange={formik.handleChange}
                            placeholder="Extra Feedback"
                          />
                        </div>
                      )}
                      {numberOfFeedback > 3 && (
                        <div className="feedback-4">
                          <br />
                          <Form.Label>
                            &nbsp;&nbsp;Specific Feedback #4
                          </Form.Label>
                          <br />
                          <Form.Control
                            type="text"
                            name="specificFeedback1"
                            onChange={formik.handleChange}
                            placeholder="Extra Feedback"
                          />
                        </div>
                      )}
                      {numberOfFeedback > 4 && (
                        <div className="feedback-5">
                          <br />
                          <Form.Label>
                            &nbsp;&nbsp;Specific Feedback #5
                          </Form.Label>
                          <br />
                          <Form.Control
                            type="text"
                            name="specificFeedback1"
                            onChange={formik.handleChange}
                            placeholder="Extra Feedback"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Form.Group>
            <Form.Group>
              <h3
                className="border-bottom mb-3"
                style={{ paddingBottom: "1rem", paddingTop: "1rem" }}
              >
                Location
              </h3>
              <input
                type="checkbox"
                onClick={() => toggleElement("location", "map")}
              />
              <Form.Label>&nbsp;&nbsp;Use Map</Form.Label>
              <div id="location">
                <Form.Control
                  type="text"
                  name="location"
                  onChange={formik.handleChange}
                  placeholder="Enter Location (Optional)"
                  style={{ marginBottom: "1rem" }}
                />
              </div>

              <div
                id="map"
                style={{ display: "none" }}
                onClick={() => reverseGeocode()}
              >
                <SimpleMap
                  iconName={"home"}
                  sendData={(markers: any) => sendData(markers)}
                />
              </div>
            </Form.Group>
            <div style={{ display: "flex" }}>
              <Button
                block
                size="lg"
                type="submit"
                disabled={isLoading ? true : false}
                style={{
                  marginLeft: "auto",
                  width: "19rem",
                  marginTop: "2rem",
                }}
              >
                {isLoading ? "Saving..." : "Submit Your Direct Proposal"}
              </Button>
            </div>
          </Form>

          {error && (
            <Alert variant="danger" className="error-alert">
              {error.message}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SubmitDirectProposalPageContent;
