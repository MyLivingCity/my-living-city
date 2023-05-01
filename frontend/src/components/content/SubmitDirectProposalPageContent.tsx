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
import { API_BASE_URL, TEXT_INPUT_LIMIT } from "src/lib/constants";
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
import { getUserBanWithToken } from "../../lib/api/banRoutes";
import { checkUser } from "src/lib/api/badPostingBehaviorRoutes";

interface SubmitDirectProposalPageContentProps {
  categories: ICategory[] | undefined;
  segData: ISegmentData[];
}

// interface FeedbackProps {
//   feedbackName: String;
//   input: HTMLInputElement;
//   button: HTMLButtonElement;
// }

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

  const [numberOfFeedback, setNumberOfFeedback] = useState(0);
  const emptyFeedbackList: string[] = [];
  const [feedbackList, setFeedbackList] = useState<string[]>(emptyFeedbackList);
  const emptyFeedbackTypeList: string[] = [
    "YESNO",
    "YESNO",
    "YESNO",
    "YESNO",
    "YESNO",
  ];
  const [feedbackTypeList, setFeedbackTypeList] = useState<string[]>(
    emptyFeedbackTypeList
  );

  // const toggleNumberOfFeedback = (num: number) => {
  //   //let numberOfFeedback = 0;
  //   if (
  //     (numberOfFeedback == 1 && num < 0) ||
  //     (numberOfFeedback == 5 && num > 0)
  //   ) {
  //     return;
  //   }
  //   setNumberOfFeedback(numberOfFeedback + num);
  // };

  const updateFeedback = (feedback: string, index: number) => {
    const newFeedbackList = [...feedbackList];
    newFeedbackList[index] = feedback;
    setFeedbackList(newFeedbackList);

    formik.values.feedback![index] = feedback;
  };

  // rename to "addNewFeedback"
  const addNewFeedback = (item: number) => {
    if (numberOfFeedback == 5) {
      return;
    }

    //<Form.Control type="text" name="specificFeedback1" onChange={formik.handleChange} placeholder="Extra Feedback"/>
    const feedback = item.toString();
    setNumberOfFeedback(numberOfFeedback + 1);
    const newFeedbackList = [...feedbackList, feedback];
    setFeedbackList(newFeedbackList);
  };

  const removeFeedback = (index: number) => {
    //check if index less than size-1

    setNumberOfFeedback(numberOfFeedback - 1);
    const newFeedbackList = [...feedbackList];
    newFeedbackList.splice(index, 1);
    //formik.values.feedback![index] = "";
    for (let i = index; i < formik.values.feedback!.length - 1; i++) {
      formik.values.feedback![i] = formik.values.feedback![i + 1];
    }
    formik.values.feedback![formik.values.feedback!.length - 1] = "";
    setFeedbackList(newFeedbackList);

    const newFeedbackTypeList = [...feedbackTypeList];
    newFeedbackTypeList.splice(index, 1);
    for (let i = index; i < formik.values.feedbackRatingType!.length - 1; i++) {
      formik.values.feedbackRatingType![i] =
        formik.values.feedbackRatingType![i + 1];
    }
    formik.values.feedbackRatingType![
      formik.values.feedbackRatingType!.length - 1
    ] = "YESNO";
    setFeedbackTypeList(newFeedbackTypeList);
  };

  const updateFeedbackType = (feedbackType: string, index: number) => {
    const newFeedbackTypeList = [...feedbackTypeList];
    newFeedbackTypeList[index] = feedbackType;
    formik.values.feedbackRatingType![index] = feedbackType;
    setFeedbackTypeList(newFeedbackTypeList);
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
      const metThreshhold = await checkUser(token, user!.id);
      try {
        setError(null);
        setIsLoading(true);
        setTimeout(() => console.log("timeout"), 5000);
        //const ideaValues with <ICreateIdeaInput> interface
        const ideaValues: ICreateIdeaInput = {
          categoryId: values.categoryId,
          title: values.title,
          userType: values.userType,
          description: values.description,
          proposal_role: values.proposal_role,
          requirements: values.requirements,
          proposal_benefits: values.proposal_benefits,
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
          imagePath: values.imagePath,
        };
        const banDetails = await getUserBanWithToken(token);
        let banned = true;
        if (!user!.banned || !banDetails || banDetails.banType === "WARNING") {
          banned = false;
        }
        const idea = await postCreateIdea(ideaValues, banned, token);
        const proposalValues = {
          ideaId: idea.id,
          needCollaborators: values.needCollaborators,
          needVolunteers: values.needVolunteers,
          needDonations: values.needDonations,
          needFeedback: values.needFeedback,
          needSuggestions: values.needSuggestions,
          location: values.location,
          feedback: values.feedback,
          feedbackRatingType: values.feedbackRatingType,
        };

        const proposal = await postCreateProposal(
          proposalValues,
          user!.banned,
          token
        );

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
    } catch (error) {
      const genericMessage =
        "You have too many bad posts / post flagged. Post was NOT submittted.";
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
      proposal_role: "",
      requirements: "",
      proposal_benefits: "",
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
      feedback: ["", "", "", "", ""],
      feedbackRatingType: ["YESNO", "YESNO", "YESNO", "YESNO", "YESNO"],
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

        formik.setFieldValue("location", address);
        setIsLoading(false);
      })
      .catch((error) => {
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
                maxLength={TEXT_INPUT_LIMIT.TITLE}
              />
              <p>Character count: {formik.values.title.length}</p>
            </Form.Group>
            {/* <Form.Group>
              <Form.Label>*Describe your proposal</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </Form.Group> */}
            <Form.Group>
              <Form.Label>
                Proposer info (Describe you, your organization, and what you
                bring to the table to help make this proposal happen).
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="proposal_role"
                onChange={formik.handleChange}
                value={formik.values.proposal_role}
                maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
              />
              <p>Character count: {formik.values.proposal_role.length}</p>
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Describe your Proposal (What is the goal, what does it look
                like, how it will work).
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={formik.handleChange}
                value={formik.values.description}
                maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
              />
              <p>Character count: {formik.values.description.length}</p>
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Community Benefits (Describe how it will improve and benefit the
                community).
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="proposal_benefits"
                onChange={formik.handleChange}
                value={formik.values.proposal_benefits}
                maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
              />
              <p>Character count: {formik.values.proposal_benefits.length}</p>
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Requirements (Describe what will be needed to make this a
                reality: number of people, resources, land use agreement,
                municipal agreement etc…).
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="requirements"
                onChange={formik.handleChange}
                value={formik.values.requirements}
                maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
              />
              <p>Character count: {formik.values.requirements.length}</p>
            </Form.Group>
            <Form.Group>
              <Form.Label>Proposal image</Form.Label>
              <ImageUploader
                name="imagePath"
                fileContainerStyle={{ backgroundColor: "#F8F9FA" }}
                withPreview={true}
                onChange={(picture) => {
                  formik.setFieldValue("imagePath", picture);
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
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p>
                    Character count: {formik.values.communityImpact?.length}
                  </p>
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
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p>Character count: {formik.values.natureImpact?.length}</p>
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
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p>Character count: {formik.values.artsImpact?.length}</p>
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
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p>Character count: {formik.values.energyImpact?.length}</p>
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
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p className="text-right">
                    {`${formik.values.manufacturingImpact?.length}/${TEXT_INPUT_LIMIT.IMPACT_AREAS}`}
                  </p>
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
                    <Button
                      color="success"
                      size="sm"
                      onClick={() => addNewFeedback(numberOfFeedback)}
                    >
                      +
                    </Button>
                  )}
                  {extraFeedback &&
                    feedbackList.map((feedback, index) => {
                      return (
                        <div className="feedback-1">
                          <br />
                          <Form.Label style={{ display: "flex" }}>
                            &nbsp;&nbsp;Specific Feedback {index + 1}
                            <Button
                              style={{ marginLeft: "auto" }}
                              color="danger"
                              size="sm"
                              onClick={() => removeFeedback(index)}
                            >
                              -
                            </Button>
                          </Form.Label>
                          <br />
                          <Form.Control
                            type="text"
                            name="specificFeedback1"
                            onChange={(event) => {
                              updateFeedback(event.target.value, index);
                              formik.handleChange(
                                formik.values.feedback![index]
                              )(event);
                            }}
                            value={formik.values.feedback![index]}
                            placeholder="Extra Feedback"
                          />
                          <Form.Check
                            inline
                            label="Yes/No"
                            name={`group-${index}`}
                            type="radio"
                            id={`inline-radio-1`}
                            checked={
                              formik.values.feedbackRatingType![index] ===
                              "YESNO"
                            }
                            onClick={(event) => {
                              formik.values.feedbackRatingType![index] =
                                "YESNO";
                              updateFeedbackType("YESNO", index);
                            }}
                          />
                          <Form.Check
                            inline
                            label="Rating Scale"
                            name={`group-${index}`}
                            type={"radio"}
                            id={`inline-radio-2`}
                            checked={
                              formik.values.feedbackRatingType![index] ===
                              "RATING"
                            }
                            onClick={(event) => {
                              formik.values.feedbackRatingType![index] =
                                "RATING";
                              updateFeedbackType("RATING", index);
                            }}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </Form.Group>
            <Form.Group>
              <h3
                className="border-bottom mb-3"
                style={{ paddingBottom: "1rem", paddingTop: "1rem" }}
              >
                Location (Optional)
              </h3>
              <input
                type="checkbox"
                onClick={() => toggleElement("location", "map")}
              />
              <Form.Label>&nbsp;&nbsp;Click the checkbox to use map</Form.Label>
              <div id="location">
                <Form.Control
                  type="text"
                  name="location"
                  onChange={formik.handleChange}
                  placeholder="Please Enter The Address and The Postal Code of The Location (Optional)"
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
