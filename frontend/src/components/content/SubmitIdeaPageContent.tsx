import { useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import {
  Col,
  Container,
  Row,
  Form,
  Button,
  Alert,
} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { TEXT_INPUT_LIMIT } from 'src/lib/constants';
import {
  ISegmentData,
} from 'src/lib/types/data/segment.type';
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { postCreateIdea } from '../../lib/api/ideaRoutes';
import { getUserBanWithToken } from '../../lib/api/banRoutes';
import { checkUser } from 'src/lib/api/badPostingBehaviorRoutes';
import { ICategory } from '../../lib/types/data/category.type';
import { ICreateIdeaInput } from '../../lib/types/input/createIdea.input';
import { IFetchError } from '../../lib/types/types';
import {
  capitalizeString,
  handlePotentialAxiosError,
} from '../../lib/utilityFunctions';
import { CONTENT, Toastie } from '../partials/LandingContent/CategoriesSection';
import ImageUploader from 'react-images-upload';

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
    if (updatedSegData[index].segType === 'Segment') {
      formik.setFieldValue('segmentId', updatedSegData[index].id);
      formik.setFieldValue('superSegmentId', undefined);
      formik.setFieldValue('subSegmentId', undefined);
    }
    if (updatedSegData[index].segType === 'Sub-Segment') {
      formik.setFieldValue('subSegmentId', updatedSegData[index].id);
      formik.setFieldValue('superSegmentId', undefined);
      formik.setFieldValue('segmentId', undefined);
    }
    if (updatedSegData[index].segType === 'Super-Segment') {
      formik.setFieldValue('superSegmentId', updatedSegData[index].id);
      formik.setFieldValue('subSegmentId', undefined);
      formik.setFieldValue('segmentId', undefined);
    }
    formik.setFieldValue('userType', updatedSegData[index].userType);
  };
  const submitHandler = async (values: ICreateIdeaInput) => {
    try {
      const metThreshhold = await checkUser(token, user!.id);
      try {
        setError(null);
        setIsLoading(true);
        setTimeout(() => console.log('timeout'), 5000);
        const banDetails = await getUserBanWithToken(token);
        let banned = true;
        if (!user!.banned || !banDetails || banDetails.banType === 'WARNING') {
          banned = false;
        }
        const res = await postCreateIdea(values, banned, token);

        setError(null);
        history.push('/ideas/' + res.id);
        formik.resetForm();
      } catch (error) {
        const genericMessage =
          'An error occured while trying to create an Proposal.';
        const errorObj = handlePotentialAxiosError(genericMessage, error);
        setError(errorObj);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      //print the error message attached to the error object
      const genericMessage =
        'You have too many bad posts / post flagged. Post was NOT submittted.';
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const supportedProposal = urlParams.get('supportedProposal');
  const communityOfInterest = urlParams.get('communityOfInterest');
  const parsedProposalId = parseInt(supportedProposal!);
  let updatedSegData : ISegmentData[] = []
   const destructuredSegData = Object.entries(segData)
  if (destructuredSegData !== null) {

    if (
      destructuredSegData[2] &&
      destructuredSegData[2][1] &&
      destructuredSegData[2][1].toString() !== '' &&
      destructuredSegData[3] &&
      destructuredSegData[3][1] &&
      destructuredSegData[3][1].toString() !== ''
    ) {
      updatedSegData.push({
        id: parseInt(destructuredSegData[2][1].toString()),
        name: destructuredSegData[3][1].toString(),
        segType: 'Super-Segment',
        userType: 'Resident'
      });
    }
    if (
      destructuredSegData[8] &&
      destructuredSegData[8][1] &&
      destructuredSegData[8][1].toString() !== '' &&
      destructuredSegData[9] &&
      destructuredSegData[9][1] &&
      destructuredSegData[9][1].toString() !== ''
    ) {
      updatedSegData.push({
        id: parseInt(destructuredSegData[8][1].toString()),
        name: destructuredSegData[9][1].toString(),
        segType: 'Segment',
        userType: 'Resident'
      });
    }

    if (
      destructuredSegData[9][1].toString() !==  destructuredSegData[13][1].toString() &&
      destructuredSegData[10] &&
      destructuredSegData[10][1] &&
      destructuredSegData[10][1].toString() !== '' &&
      destructuredSegData[11] &&
      destructuredSegData[11][1] &&
      destructuredSegData[11][1].toString() !== ''
    ) {
      updatedSegData.push({
        id: parseInt(destructuredSegData[10][1].toString()),
        name: destructuredSegData[11][1].toString(),
        segType: 'Segment',
        userType: 'Worker'
      });
    }

    if (
      destructuredSegData[11][1].toString() !==  destructuredSegData[13][1].toString() &&
      destructuredSegData[12] &&
      destructuredSegData[12][1] &&
      destructuredSegData[12][1].toString() !== '' &&
      destructuredSegData[13] &&
      destructuredSegData[13][1] &&
      destructuredSegData[13][1].toString() !== ''
    ) {
      updatedSegData.push({
        id: parseInt(destructuredSegData[12][1].toString()),
        name: destructuredSegData[13][1].toString(),
        segType: 'Segment',
        userType: 'Student'
      });
    }

    if (
      destructuredSegData[14] &&
      destructuredSegData[14][1] &&
      destructuredSegData[14][1].toString() !== '' &&
      destructuredSegData[15] &&
      destructuredSegData[15][1] &&
      destructuredSegData[15][1].toString() !== ''
    ) {
      updatedSegData.push({
        id: parseInt(destructuredSegData[14][1].toString()),
        name: destructuredSegData[15][1].toString(),
        segType: 'Sub-Segment',
        userType: 'Resident'
      });
    }

    if (
     
      destructuredSegData[16] &&
      destructuredSegData[16][1] &&
      destructuredSegData[16][1].toString() !== '' &&
      destructuredSegData[17] &&
      destructuredSegData[17][1] &&
      destructuredSegData[17][1].toString() !== ''
    ) {
      updatedSegData.push({
        id: parseInt(destructuredSegData[16][1].toString()),
        name: destructuredSegData[17][1].toString(),
        segType: 'Sub-Segment',
        userType: 'Worker'
      });
    }

    if (
       destructuredSegData[17][1].toString() !==  destructuredSegData[19][1].toString() &&
      destructuredSegData[18] &&
      destructuredSegData[18][1] &&
      destructuredSegData[18][1].toString() !== '' &&
      destructuredSegData[19] &&
      destructuredSegData[19][1] &&
      destructuredSegData[19][1].toString() !== ''
    ) {
      updatedSegData.push({
        id: parseInt(destructuredSegData[18][1].toString()),
        name: destructuredSegData[19][1].toString(),
        segType: 'Sub-Segment',
        userType: 'Student'
      });
    }
  }
  const renderCommunitiesOfInterest = (segData: ISegmentData[], communityOfInterest: string | null) => {
    if (communityOfInterest) {
      return <option key={communityOfInterest} value={communityOfInterest}>
        {communityOfInterest}
      </option>
    }
    
    return segData &&
    segData.map((seg, index) => (
      <option key={String(seg.name)} value={index}>
       {`${capitalizeString(seg.name)} as ${capitalizeString(seg.userType)} `} 
      </option>
    ))
  }

  const formik = useFormik<ICreateIdeaInput>({
    initialValues: {
      // TODO: CatId when chosen is a string value
      categoryId: categories ? categories[0].id : DEFAULT_CAT_ID,
      title: '',
      userType: updatedSegData ? updatedSegData[0].userType : 'Resident',
      description: '',
      proposal_role: '',
      requirements: '',
      proposal_benefits: '',
      artsImpact: '',
      communityImpact: '',
      energyImpact: '',
      manufacturingImpact: '',
      natureImpact: '',
      address: {
        streetAddress: '',
        streetAddress2: '',
        city: '',
        postalCode: '',
        country: '',
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
  console.log('Structured', updatedSegData )
  console.log('DeStructured', destructuredSegData)
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
                        textTransform: 'capitalize',
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
                {renderCommunitiesOfInterest(updatedSegData, communityOfInterest)}
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
                maxLength={TEXT_INPUT_LIMIT.TITLE}
              />
              <p className="text-right">
                {`${formik.values.title.length}/${TEXT_INPUT_LIMIT.TITLE}`}
              </p>
            </Form.Group>
            <Form.Group>
              <Form.Label>Describe your idea</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={formik.handleChange}
                value={formik.values.description}
                maxLength={TEXT_INPUT_LIMIT.DESCRIPTION}
              />
              <p className="text-right">
                {`${formik.values.description.length}/${TEXT_INPUT_LIMIT.DESCRIPTION}`}
              </p>
            </Form.Group>
            <Form.Group>
              <Form.Label>Idea image</Form.Label>
              <ImageUploader
                name="imagePath"
                fileContainerStyle={{ backgroundColor: '#F8F9FA' }}
                withPreview={true}
                onChange={(picture) => {
                  formik.setFieldValue('imagePath', picture);
                }}
                imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
                buttonText="Select Idea Image"
                maxFileSize={10485760}
                label={'Max file size 10mb, \n jpg, jpeg, png, webp'}
                singleImage={true}
              />
            </Form.Group>
            <Form.Group>
              <h3 className="border-bottom mb-3">Impact Areas</h3>
              <Row className="align-items-start idea-impacts">
                <Col xs={11}>
                  <Form.Control
                    type="text"
                    name="communityImpact"
                    onChange={formik.handleChange}
                    value={formik.values.communityImpact}
                    placeholder="Community and Place"
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p className="text-right">
                    {`${formik.values.communityImpact?.length}/${TEXT_INPUT_LIMIT.IMPACT_AREAS}`}
                  </p>
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
              <Row className="align-items-start idea-impacts">
                <Col xs={11}>
                  <Form.Control
                    type="text"
                    name="natureImpact"
                    onChange={formik.handleChange}
                    value={formik.values.natureImpact}
                    placeholder="Nature and Food Security"
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p className="text-right">
                    {`${formik.values.natureImpact?.length}/${TEXT_INPUT_LIMIT.IMPACT_AREAS}`}
                  </p>
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
              <Row className="align-items-start idea-impacts">
                <Col xs={11}>
                  <Form.Control
                    type="text"
                    name="artsImpact"
                    onChange={formik.handleChange}
                    value={formik.values.artsImpact}
                    placeholder="Arts, Culture, and Education"
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p className="text-right">
                    {`${formik.values.artsImpact?.length}/${TEXT_INPUT_LIMIT.IMPACT_AREAS}`}
                  </p>
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
              <Row className="align-items-start idea-impacts">
                <Col xs={11}>
                  <Form.Control
                    type="text"
                    name="energyImpact"
                    onChange={formik.handleChange}
                    value={formik.values.energyImpact}
                    placeholder="Water and Energy"
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p className="text-right">
                    {`${formik.values.energyImpact?.length}/${TEXT_INPUT_LIMIT.IMPACT_AREAS}`}
                  </p>
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
              <Row className="align-items-start idea-impacts">
                <Col xs={11}>
                  <Form.Control
                    type="text"
                    name="manufacturingImpact"
                    onChange={formik.handleChange}
                    value={formik.values.manufacturingImpact}
                    placeholder="Manufacturing and Waste"
                    maxLength={TEXT_INPUT_LIMIT.IMPACT_AREAS}
                  />
                  <p className="text-right">
                    {`${formik.values.manufacturingImpact?.length}/${TEXT_INPUT_LIMIT.IMPACT_AREAS}`}
                  </p>
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
              {isLoading ? 'Saving...' : 'Submit your idea!'}
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