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
interface SubmitIdeaPageContentProps {
  categories: ICategory[] | undefined;
  segData: ISegmentData[];
}

/**
 * Idea needs categoryId to submit
 * default will be used if categories can't be fetched from server
 */
const DEFAULT_CAT_ID = 1;

const SubmitIdeaPageContent: React.FC<SubmitIdeaPageContentProps> = ({
  categories,
  segData,
}) => {
  const { token, user } = useContext(UserProfileContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IFetchError | null>(null);
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  const history = useHistory();
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
      const res = await postCreateIdea(values, user!.banned, token);
      console.log(res);

      setError(null);
      history.push("/ideas/" + res.id);
      formik.resetForm();
    } catch (error) {
      const genericMessage =
        "An error occured while trying to create an Proposal.";
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const supportedProposal = urlParams.get("supportedProposal");
  const parsedProposalId = parseInt(supportedProposal!);
  console.log("supportedProposal: ");
  console.log(supportedProposal);

  // console.log(segment);
  // console.log(subSegment);
  const formik = useFormik<ICreateIdeaInput>({
    initialValues: {
      // TODO: CatId when chosen is a string value
      categoryId: categories ? categories[0].id : DEFAULT_CAT_ID,
      title: "",
      userType: segData ? segData[0].userType : "Resident",
      description: "",
      proposal_role: "",
      proposal_goal: "",
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
      //supportingProposalId that is not null
      supportingProposalId: parsedProposalId,
    },
    onSubmit: submitHandler,
  });

  useEffect(() => {
    if (segData) {
      handleCommunityChange(0);
    }
  }, []);

  return (
    <Container className="submit-idea-page-content">
      <Row className="mb-4 mt-4 justify-content-center">
        <h2 className="pb-2 pt-2 display-6">Submit Idea</h2>
      </Row>
      <Row className="submit-idea-form-group justify-content-center">
        <Col lg={10}>
          <Form onSubmit={formik.handleSubmit}>
            <Form.Group controlId="submitIdeaCategory">
              <h3 className="border-bottom mb-3">Idea Details</h3>
              <Form.Label>Select Category:</Form.Label>
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
              <Form.Label>Select your community of interest</Form.Label>
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
              <Form.Label>What is the title of your idea?</Form.Label>
              <Form.Control
                type="text"
                name="title"
                onChange={formik.handleChange}
                value={formik.values.title}
                placeholder="Enter the title of your idea"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Describe your idea</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Idea image</Form.Label>
              <ImageUploader
                name="imagePath"
                fileContainerStyle={{ backgroundColor: "#F8F9FA" }}
                withPreview={true}
                onChange={(picture) => {
                  formik.setFieldValue("imagePath", picture);
                  console.log(picture);
                }}
                imgExtension={[".jpg", ".jpeg", ".png", ".webp"]}
                buttonText="Select Idea Image"
                maxFileSize={10485760}
                label={"Max file size 10mb, \n jpg, jpeg, png, webp"}
                singleImage={true}
              />
            </Form.Group>
            <Form.Group>
              <h3 className="border-bottom mb-3">Impact Areas</h3>
              <Row className="align-items-end">
                <Col xs={11}>
                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="communityImpact"
                    onChange={formik.handleChange}
                    value={formik.values.communityImpact}
                    placeholder="Community and Place"
                  />
                </Col>
                <Col>
                  <a href="javascript:void(0)">
                    <Toastie
                      header={CONTENT.community.header}
                      subHeader={CONTENT.community.subHeader}
                      body={CONTENT.community.body}
                      img="/categories/MLC-Icons-Green-05.png"
                      sizePercent="90%"
                    />
                  </a>
                </Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={11}>
                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="natureImpact"
                    onChange={formik.handleChange}
                    value={formik.values.natureImpact}
                    placeholder="Nature and Food Security"
                  />
                </Col>
                <Col>
                  <a href="javascript:void(0)">
                    <Toastie
                      header={CONTENT.nature.header}
                      subHeader={CONTENT.nature.subHeader}
                      body={CONTENT.nature.body}
                      img="/categories/MLC-Icons-Green-01.png"
                      sizePercent="90%"
                    />
                  </a>
                </Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={11}>
                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="artsImpact"
                    onChange={formik.handleChange}
                    value={formik.values.artsImpact}
                    placeholder="Arts, Culture, and Education"
                  />
                </Col>
                <Col>
                  <a href="javascript:void(0)">
                    <Toastie
                      header={CONTENT.arts.header}
                      subHeader={CONTENT.arts.subHeader}
                      body={CONTENT.arts.body}
                      img="/categories/MLC-Icons-Green-04.png"
                      sizePercent="90%"
                    />
                  </a>
                </Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={11}>
                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="energyImpact"
                    onChange={formik.handleChange}
                    value={formik.values.energyImpact}
                    placeholder="Water and Energy"
                  />
                </Col>
                <Col>
                  <a href="javascript:void(0)">
                    <Toastie
                      header={CONTENT.water.header}
                      subHeader={CONTENT.water.subHeader}
                      body={CONTENT.water.body}
                      img="/categories/MLC-Icons-Green-02.png"
                      sizePercent="90%"
                    />
                  </a>
                </Col>
              </Row>
              <Row className="align-items-end">
                <Col xs={11}>
                  <Form.Control
                    className="idea-impacts"
                    type="text"
                    name="manufacturingImpact"
                    onChange={formik.handleChange}
                    value={formik.values.manufacturingImpact}
                    placeholder="Manufacturing and Waste"
                  />
                </Col>
                <Col>
                  <a href="javascript:void(0)">
                    <Toastie
                      header={CONTENT.manufacturing.header}
                      subHeader={CONTENT.manufacturing.subHeader}
                      body={CONTENT.manufacturing.body}
                      img="/categories/MLC-Icons-Green-03.png"
                      sizePercent="90%"
                    />
                  </a>
                </Col>
              </Row>
            </Form.Group>
            <Button
              block
              size="lg"
              type="submit"
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Saving..." : "Submit your idea!"}
            </Button>
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

export default SubmitIdeaPageContent;
