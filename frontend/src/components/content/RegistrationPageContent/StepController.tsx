/* eslint-disable */

import { SetStateAction, useState } from 'react';
import { ROUTES, TEXT_INPUT_LIMIT, USER_TYPES } from 'src/lib/constants';
import PricingPlanSelector from '../../partials/PricingPlanSelector';
import {
  ErrorMessage,
  FieldHookConfig,
  FieldInputProps,
  Form,
  Formik,
  FormikConfig,
  Field,
  FormikHelpers,
  FormikValues,
  useFormikContext,
} from 'formik';
import { FormikStep } from '../RegisterPageContent4';
import * as Yup from 'yup';
import { Alert, Form as BForm, Button, Card } from 'react-bootstrap';
import { getUserWithEmail, postRegisterUser } from 'src/lib/api/userRoutes';
import ImageUploader from 'react-images-upload';
import Header from './Header';
import { RequestSegmentModal } from 'src/components/partials/RequestSegmentModal';
import {
  capitalizeFirstLetterEachWord,
  refactorStateArray,
  wipeLocalStorage,
} from 'src/lib/utilityFunctions';
import { ISegment, ISubSegment } from 'src/lib/types/data/segment.type';
import { IFetchError } from 'src/lib/types/types';
import { CheckBoxItem, RegisterPageContentReach } from '../RegisterPageContentReach';
import {
  findSubsegmentsBySegmentId,
  getAllSegments,
  getAllSegmentsWithSuperSegId,
} from 'src/lib/api/segmentRoutes';
import { IRegisterInput } from 'src/lib/types/input/register.input';
import CommunityLocation from './CommunityLocation';

interface RegisterPageContentProps {}
type Props = FieldHookConfig<string> & {
  field: FieldInputProps<string>;
};

function StepController() {
  const [error, setError] = useState<IFetchError | null>(null);
  async function setSubsegData(segmentId: number) {
    try {
      setError(null);
      setIsLoading(true);

      const subsegments = await findSubsegmentsBySegmentId(segmentId);
      console.log(
        'Fetched Subsegments for Segment ID',
        segmentId,
        ':',
        subsegments
      );
      setSubSegments(subsegments);

      refactorStateArray(
        subIds,
        0,
        subsegments[0]?.subSegId || null,
        setSubIds
      );
    } catch (err) {
      console.error('Error fetching subsegments:', err);
      setError(new Error('An error occurred while fetching the subsegments'));
    } finally {
      setIsLoading(false);
    }
  }

  const [subSegments, setSubSegments] = useState<ISubSegment[]>();
  const [subSegments2, setSubSegments2] = useState<ISubSegment[]>();
  async function setSegData(index: number) {
    try {
      setError(null);
      setIsLoading(true);
      let fetchedSegments: ISegment[] = [];
      let selectedSegment: ISegment | null = null;

      switch (index) {
        case 0:
          fetchedSegments = await getAllSegments();
          setSegments(fetchedSegments);
          if (fetchedSegments.length > 0) {
            selectedSegment = fetchedSegments[0];
          }
          break;
        case 1:
          fetchedSegments = await getAllSegments();
          setSegments(fetchedSegments);
          if (fetchedSegments.length > 0) {
            selectedSegment = fetchedSegments[0];
          }
          break;
        case 2:
          fetchedSegments = await getAllSegments();
          setSegments(fetchedSegments);
          if (fetchedSegments.length > 0) {
            selectedSegment = fetchedSegments[0];
          }
          break;
        default:
          console.error('Unknown index in setSegData');
      }

      if (selectedSegment) {
        setSubsegData(selectedSegment.segId);
        console.log('Selected Segment for index', index, ':', selectedSegment);
      } else {
        console.warn('No segments fetched');
        setSubSegments([]);
      }
    } catch (err) {
      console.error('Error fetching segment:', err);
      setError(new Error('An error occurred while fetching the segment'));
    } finally {
      setIsLoading(false);
    }
  }
  const [markers, sendData]: any = useState({
    home: { lat: null, lon: null },
    work: { lat: null, lon: null },
    school: { lat: null, lon: null },
  });
  const [userType, setUserType] = useState<string>(USER_TYPES.RESIDENTIAL);
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [map, showMap] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [segment, setSegment] = useState<ISegment>();
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [segment2, setSegment2] = useState<ISegment>();

  const [subIds, setSubIds] = useState<any[]>([]);
  const [segIds, setSegIds] = useState<any[]>([]);
  const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
  const [communityType, setCommunityType] = useState<string | null>(null);

  const [avatar, setAvatar] = useState(undefined);

  const [workTransfer, transferHomeToWork] = useState(false);
  const [schoolTransfer, transferWorkToSchool] = useState(false);
  

  const [selectedSegId, setselectedSegId] = useState<any>([]);
  const [reachData, setReachData] = useState<CheckBoxItem[]>([]);

  const getReachData = async () => {
    let data: CheckBoxItem[] = [];
    let region: CheckBoxItem = {
      label: segment?.superSegName,
      value: 'SuperSeg',
      children: [],
    };

    const res = await getAllSegmentsWithSuperSegId(segment?.superSegId);

    res.forEach((segment) => {
      region.children?.push({
        label: segment?.name,
        value: segment?.segId,
      });
    });

    data.push(region);
    setReachData(data);
  };

  return (
    <>
      <FormikStepper
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
          organizationName: '',
          fname: '',
          lname: '',
          address: {
            streetAddress: '',
            streetAddress2: '',
            city: '',
            postalCode: '',
            country: '',
          },
          geo: {
            lon: undefined,
            lat: undefined,
            work_lat: undefined,
            work_lon: undefined,
            school_lat: undefined,
            school_lon: undefined,
          },
          workDetails: {
            streetAddress: '',
            postalCode: '',
            company: '',
          },
          schoolDetails: {
            streetAddress: '',
            postalCode: '',
            faculty: '',
            programCompletionDate: undefined,
          },
          homeSegmentId: undefined,
          workSegmentId: undefined,
          schoolSegmentId: undefined,
          homeSubSegmentId: undefined,
          workSubSegmentId: undefined,
          schoolSubSegmentId: undefined,
          userType: USER_TYPES.RESIDENTIAL,
          reachSegmentIds: [],
        }}
        markers={markers}
        setSegment={setSegment}
        setSegment2={setSegment2}
        setSubSegments={setSubSegments}
        setSubSegments2={setSubSegments2}
        setSubIds={setSubIds}
        setSegIds={setSegIds}
        segIds={segIds}
        showMap={showMap}
        subIds={subIds}
        setAvatar={setAvatar}
        workTransfer={workTransfer}
        schoolTransfer={schoolTransfer}
        avatar={avatar}
        userType={userType}
        setselectedSegId={setselectedSegId}
        selectedSegId={selectedSegId}
        reachData={reachData}
        subSegments = {subSegments}
        subSegments2 = {subSegments2}
        setUserType={setUserType}
        reachSegmentIds={selectedSegId}
        segments={segments}
        refactorStateArray={refactorStateArray}
        setSubsegData={setSubsegData}
        communityType={communityType}
        setCommunityType={setCommunityType}
        setShowModal={setShowModal}
        showModal={showModal}
        segmentRequests={segmentRequests}
        setSegmentRequests={setSegmentRequests}
        setSegments={setSegments}
        setSegData={setSegData}
        step={step}
        setStep={setStep}
        submitError={submitError}
        onSubmit={async (values, helpers) => {
          try {
            setIsLoading(true);
            setSubmitError('');
            await postRegisterUser(values, segmentRequests, true, avatar);
            if (userType === USER_TYPES.RESIDENTIAL) {
              wipeLocalStorage();
              window.location.href = ROUTES.CHECKEMAIL;
            }
          } catch (error: any) {
            setSubmitError('An error occurred while creating your account.');
            console.error(error);
            wipeLocalStorage();
          } finally {
            setIsLoading(false);
          }
        }}
      >
      </FormikStepper>
    </>
  );
}
export default StepController;

function buisnessCommunityRegistration(): JSX.Element {
  return (
    <>
      <BForm.Group>
        <BForm.Label>Organization Name</BForm.Label>
        <Field
          required
          name="organizationName"
          type="text"
          as={BForm.Control}
        />
      </BForm.Group>
      <BForm.Group>
        <BForm.Label>Contact First Name</BForm.Label>
        <Field required name="fname ">
          {({ field }: Props) => (
            <BForm.Control
              {...field}
              type="text"
              maxLength={TEXT_INPUT_LIMIT.NAME}
            />
          )}
        </Field>
      </BForm.Group>
      <BForm.Group>
        <BForm.Label>Contact Last Name</BForm.Label>
        <Field required name="lname">
          {({ field }: Props) => (
            <BForm.Control
              {...field}
              type="text"
              maxLength={TEXT_INPUT_LIMIT.NAME}
            />
          )}
        </Field>
      </BForm.Group>
    </>
  );
}

function notBuisnessNorCommunity(): JSX.Element {
  return (
    <>
      <BForm.Group>
        <BForm.Label>First Name</BForm.Label>
        <Field required name="fname">
          {({ field }: Props) => (
            <BForm.Control
              {...field}
              type="text"
              maxLength={TEXT_INPUT_LIMIT.NAME}
            />
          )}
        </Field>
      </BForm.Group>
      <BForm.Group>
        <BForm.Label>Last Name</BForm.Label>
        <Field required name="lname">
          {({ field }: Props) => (
            <BForm.Control
              {...field}
              type="text"
              maxLength={TEXT_INPUT_LIMIT.NAME}
            />
          )}
        </Field>
      </BForm.Group>
    </>
  );
}

export interface FormikStepperProps extends FormikConfig<IRegisterInput> {
  initialValues: IRegisterInput;
  markers: any;
  setSegment: any;
  setSegments: any;
  setSegment2: any;
  setSubSegments: any;
  setSubSegments2: any;
  showMap: any;
  setSubIds: any;
  setSegIds: any;
  segIds: any;
  subIds: any;
  segments: any;
  refactorStateArray: any;
  setShowModal: any;
  showModal: any;
  segmentRequests: any;
  setSegmentRequests: any;
  workTransfer: boolean;
  schoolTransfer: boolean;
  avatar: any;
  userType: any;
  setUserType: any;
  reachSegmentIds: any;
  communityType: string | null;
  step: any;
  setStep: any;
  setAvatar: any;
  reachData: any;
  subSegments:any;
    subSegments2:any;
  selectedSegId: any;
  setselectedSegId:any;
  setCommunityType: React.Dispatch<React.SetStateAction<string | null>>;
  setSegData: (index: number) => Promise<void>;
  setSubsegData: (segmentId: number) => Promise<void>;
  submitError: any;
}

export function FormikStepper({
  children,
  markers,
  showMap,
  subIds,
  segIds,
  schoolTransfer,
  workTransfer,
  setSubIds,
  setSegIds,
  avatar,
  userType,
  setUserType,
  reachSegmentIds,
  setAvatar,
  step,
  subSegments,
    subSegments2,
  segments,
  setSegment,
  refactorStateArray,
  communityType,
  setShowModal,
  showModal,
  segmentRequests,
  setStep,
  setSegmentRequests,
  reachData,
  selectedSegId,
  setselectedSegId,
  setCommunityType,
  setSegData,
  setSubsegData,
  submitError,
  ...props
}: FormikStepperProps) {
  return (
    <>
      <Formik
        {...props}
        validationSchema={
          step === 2
            ? Yup.object().shape({
                password: Yup.string().min(
                  8,
                  'Password is too short, 8 characters minimum'
                ),
                confirmPassword: Yup.string().oneOf(
                  [Yup.ref('password'), null],
                  'Passwords must match'
                ),
                email: Yup.string()
                  .email('Invalid email')
                  .test(
                    'Unique Email',
                    'Email already in use',
                    function (value) {
                      return new Promise((resolve) => {
                        getUserWithEmail(value).then((res) => {
                          res === 200 ? resolve(false) : resolve(true);
                        });
                      });
                    }
                  ),
              })
            : undefined
        }
      >
        <>
          <Header step={step} userType={userType} />
          {step == 1 && (
            <>
              <FormikStep>
                <h3>Please select your account type:</h3>
                <BForm.Group className="m-4">
                  <PricingPlanSelector
                    onClickParam={(type: any) => {
                      setUserType(type);
                    }}
                  />
                </BForm.Group>
              </FormikStep>
            </>
          )}
          {step == 2 && (
            <>
              <EmailPasswordForm userType={userType} setAvatar={setAvatar} />
            </>
          )}
          {step == 3 && (
            
            <>
              <CommunityLocation
                segments={segments}
                setSegment={setSegment}
                refactorStateArray={refactorStateArray}
                segIds={segIds}
                setSegIds={setSegIds}
                setSubsegData={setSubsegData}
                communityType={communityType}
                setCommunityType={setCommunityType}
                subIds={subIds}
                setSubIds={setSubIds}
                setShowModal={setShowModal}
                showModal={showModal}
                segmentRequests={segmentRequests}
                setSegmentRequests={setSegmentRequests}
              />
            </>
          )}
            {(
            (step === 4 && userType !== USER_TYPES.BUSINESS && userType !== USER_TYPES.COMMUNITY) ||
            (step === 5 && (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY))
            ) && (
                <>
                    <UserAgreement submitError={submitError} />
                </>
            )}
            {( step === 4 && (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY)) && (
                <>
                    <RegisterPageContentReach
                    data={reachData}
                    selected={selectedSegId}
                    setSelected={setselectedSegId}
                    />
                </>
            )}
            
            {((step == 6 && (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY)) || 
            (step == 5 && userType !== USER_TYPES.BUSINESS && userType !== USER_TYPES.COMMUNITY)) && (
                <>
                    <SubmitForm submitError={submitError}/>
                </>
            )}
            {(step == 7 && (userType === USER_TYPES.BUSINESS ||
            userType === USER_TYPES.COMMUNITY)) && (
                <SettupAnAd/>
            )}
            <Form>
                <NextAndBackButton userType={userType} setStep={setStep} step={step} />
            </Form>
        </>
      </Formik>
    </>
  );
}

export function EmailPasswordForm({
  userType,
  setAvatar,
}: {
  userType: any;
  setAvatar: any;
}) {
  return (
    <>
      <FormikStep
        validationSchema={Yup.object().shape({
          password: Yup.string().min(
            8,
            'Password is too short, 8 characters minimum'
          ),
          confirmPassword: Yup.string().oneOf(
            [Yup.ref('password'), null],
            'Passwords must match'
          ),
          email: Yup.string()
            .email('Invalid email')
            .test(
              'Unique Email',
              'Email already in use',
              function (value) {
                return new Promise((resolve) => {
                  getUserWithEmail(value).then((res) => {
                    res === 200 ? resolve(false) : resolve(true);
                  });
                });
              }
            ),
        })}
      >
        <BForm.Group>
          <BForm.Label>Email address</BForm.Label>
          <Field required name="email" type="email" as={BForm.Control} />
          <ErrorMessage name="email">
            {(msg) => (
              <p className="text-danger">
                {msg}
                <br />
              </p>
            )}
          </ErrorMessage>
        </BForm.Group>
        <BForm.Group>
          <BForm.Label>Password</BForm.Label>
          <Field
            required
            name="password"
            type="password"
            as={BForm.Control}
          />
          <ErrorMessage name="password">
            {(msg) => (
              <p className="text-danger">
                {msg}
                <br />
              </p>
            )}
          </ErrorMessage>
        </BForm.Group>
        <BForm.Group>
          <BForm.Label>Confirm Password</BForm.Label>
          <Field
            required
            name="confirmPassword"
            type="password"
            as={BForm.Control}
          />
          <ErrorMessage name="confirmPassword">
            {(msg) => (
              <p className="text-danger">
                {msg}
                <br />
              </p>
            )}
          </ErrorMessage>
        </BForm.Group>

        {userType == USER_TYPES.BUSINESS ||
        userType == USER_TYPES.COMMUNITY
          ? buisnessCommunityRegistration()
          : notBuisnessNorCommunity()}

        <BForm.Group>
          <Field
            name="imagePath"
            type="file"
            fileContainerStyle={{ backgroundColor: '#F8F9FA' }}
            withPreview={true}
            onChange={(pic: any) => setAvatar(pic[0])}
            imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
            buttonText="Select Profile Picture"
            maxFileSize={2097152}
            label={'Max file size 2mb, \n jpg, jpeg, png, webp'}
            singleImage={true}
            as={ImageUploader}
          />
        </BForm.Group>
        <BForm.Group>
          <BForm.Label>Street Name</BForm.Label>
          <Field
            required
            name="address.streetAddress"
            type="text"
            as={BForm.Control}
          />
        </BForm.Group>
        <BForm.Group>
          <BForm.Label>ZIP / Postal Code</BForm.Label>
          <Field
            name="address.postalCode"
            type="text"
            as={BForm.Control}
          />
        </BForm.Group>
      </FormikStep>
    </>
  );
}


interface NextAndBackButtonProps {
    userType: string;
    setStep: (step: number) => void;
    step: number;
    isLoading?: boolean;
  }
  
export function NextAndBackButton({
    userType,
    setStep,
    step,
    isLoading = false,
}: NextAndBackButtonProps) {
    const { validateForm, setTouched } = useFormikContext<any>();
    const lastStep = userType === USER_TYPES.RESIDENTIAL ? 5 : 6;
    const isLastStep = step >= lastStep;

    const nextLabel = isLoading ? 'Loading...' : 'Next';
    const submitLabel = isLoading ? 'Submitting...' : 'Submit';

    const handleNext = async () => {
        const errors = await validateForm();
        if (Object.keys(errors).length === 0) {
        setStep(step + 1);
        } else {
        const touchedFields = Object.keys(errors).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(touchedFields, true);
        }
    };

    return (
        <BForm.Group className="d-flex justify-content-between">
        {step > 1 && (
            <Button
            type="button"
            variant="outline-primary"
            onClick={() => setStep(step - 1)}
            >
            Back
            </Button>
        )}
        {!isLastStep ? (
            <Button
            type="button"
            variant="primary"
            disabled={isLoading}
            onClick={handleNext}
            >
            {nextLabel}
            </Button>
        ) : (
            <Button type="submit" variant="success" disabled={isLoading}>
            {submitLabel}
            </Button>
        )}
        </BForm.Group>
    );
}


export function UserAgreement({submitError}: {submitError:any}){
    return(
        <>
            <FormikStep>
                <>
                <p>
            It takes a lot to bring an idea to form, and as a user on the MLC
            Community Discussion Platform the following agreements will enable
            the interactions that turn ideas into reality:
                </p>
                <p>
                    <strong>
                        {' '}
            1. Ideas, comments and people are treated with respect;
                    </strong>
                </p>
                <p>
                    <strong>
                        {' '}
            2. Commenting on an idea is designed to flesh it out in more
            detail to get as much constructive feedback and viewpoints from
            the community.
                    </strong>
                </p>
                <p> The following works when commenting:</p>
                <p className='ml-4'>
                    {' '}
            a. Emphasize what you see that works about the idea and what is the
            value that it brings;
                </p>
                <p className='ml-4'>
                    {' '}
            b. Identify areas that don’t work and suggest how they can be
            improved;
                </p>
                <p className='ml-4'>
                    {' '}
            c. Opinions and judgments don’t add value to the conversation; and
                </p>
                <p className='ml-4'>
                    {' '}
            d. Share about where else this idea can go or what new angle can be
            added to make it even better for the whole community.
                </p>
                <p>
                    <strong>
                        {' '}
            3. Your ideas and experience is valuable and we want to hear from
            everyone how to make this an actual project that works in the
            community.
                    </strong>
                </p>
                <p>
            By clicking next you confirm:</p>
                <p className='ml-4'>
                    {' '}
            a. Your acceptance to follow these community guidelines; and
                </p>
                <p className='ml-4'>
                    {' '}
            b. That MyLivingCity has the right to store and process 
            your personal information shared with the platform.
                </p>
                </>
            </FormikStep>
        </>
    );
}

export function SettupAnAd(){
    return(
        <FormikStep>
            <BForm.Group>
                <h4>Would you like to setup Complementary Ad now?</h4>
                <p>You would be able to create ad later at the ad manager</p>
                <BForm.Check
                    inline
                    name='createAdRadio'
                    label='Yes'
                    type='radio'
                    id='inline-checkbox'
                    onClick={() => {
                        window.location.href = ROUTES.SUBMIT_ADVERTISEMENT;
                    }}
                />
                <BForm.Check
                    inline
                    name='createAdRadio'
                    label='No'
                    type='radio'
                    id='inline-checkbox'
                    onClick={() => {
                        window.location.href = ROUTES.LOGIN;
                    }}
                />
            </BForm.Group>
        </FormikStep>
    )
}


export function SubmitForm({submitError}: {submitError:any;}){
    return(
        <FormikStep>
                {submitError && <Alert variant='danger'>{submitError}</Alert>}
                <h3>
            To complete registration press submit! Make sure to check your email
            for a verification code!{' '}
                </h3>
        </FormikStep>
    )
}