/* eslint-disable */

import { useEffect, useRef, useState } from 'react';
import { ROUTES, USER_TYPES } from 'src/lib/constants';
import PricingPlanSelector from '../../partials/PricingPlanSelector';
import { Form} from 'formik';
import { FormikStep } from '../RegisterPageContent4';
import * as Yup from 'yup';
import { Form as BForm, Card } from 'react-bootstrap';
import { getUserWithEmail, postRegisterUser } from 'src/lib/api/userRoutes';
import Header from './Header';
import {
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
import '../../../../src/scss/ui/_other.scss';
import UserAgreement from './UserAgreement';
import NextAndBackButton from './NextAndBackButton';
import EmailPasswordForm from './EmailPasswordForm';
import SubmitForm from './SubmitForm';
import SetUpAd from './SetUpAd';
import FormikStepper from './FormikStepper';

function StepController() {
  const [error, setError] = useState<IFetchError | null>(null);
  const [subSegments, setSubSegments] = useState<ISubSegment[]>();
  const [subSegments2, setSubSegments2] = useState<ISubSegment[]>();
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

  async function setSubsegData(segmentId: number) {
    try {
      setError(null);
      setIsLoading(true);
      const subsegments = await findSubsegmentsBySegmentId(segmentId);
      console.log('Fetched Subsegments for Segment ID', segmentId, ':', subsegments);
      setSubSegments(subsegments);
      refactorStateArray(subIds, 0, subsegments[0]?.subSegId || null, setSubIds);
    } catch (err) {
      console.error('Error fetching subsegments:', err);
      setError(new Error('An error occurred while fetching the subsegments'));
    } finally {
      setIsLoading(false);
    }
  }

  async function setSegData(index: number) {
    try {
      setError(null);
      setIsLoading(true);
      let fetchedSegments: ISegment[] = [];
      let selectedSegment: ISegment | null = null;
      switch (index) {
        case 0:
        case 1:
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

  const hasFetchedReachData = useRef(false);
  useEffect(() => {
    if (
      step === 4 &&
      (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) &&
      !hasFetchedReachData.current
    ) {
      (async () => {
        await getReachData();
        hasFetchedReachData.current = true;
      })();
    }
  }, [step, userType]);

  const [businessWorkDetails, setBusinessWorkDetails] = useState({
    streetAddress: '',
    postalCode: '',
    organizationName: '',
  });

  return (
    <div className="register-page-content">
      <Card>
        <Card.Header>
          {/* The header now sits in the Card header */}
          <Header step={step} userType={userType} />
        </Card.Header>
        <Card.Body>
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
              communityType: '',
            } as IRegisterInput & { communityType: string }}
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
            subSegments={subSegments}
            subSegments2={subSegments2}
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
                } else if(userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY){
                  setStep(7);
                }
              } catch (error: any) {
                setSubmitError('An error occurred while creating your account.');
                console.error(error);
                wipeLocalStorage();
              } finally {
                setIsLoading(false);
              }
            }}
            validationSchema={
              step === 2
                ? Yup.object().shape({
                    email: Yup.string()
                      .email('Invalid email')
                      .required('Email is required')
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
                    password: Yup.string()
                      .min(8, 'Password is too short, 8 characters minimum')
                      .required('Password is required'),
                    confirmPassword: Yup.string()
                      .oneOf([Yup.ref('password'), null], 'Passwords must match')
                      .required('Confirm Password is required'),
                  })
                : step === 3
                ? Yup.object().shape({
                    homeSegmentId: Yup.number()
                      .typeError('Please select a municipality')
                      .required('Please select a municipality'),
                    communityType: Yup.string().required(
                      'Please select a community relationship'
                    ),
                  })
                : undefined
            }
          >
            <>
              {step === 1 && (
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
              )}
              {step === 2 && (
                <EmailPasswordForm  userType={userType}
                setAvatar={setAvatar}
                setBusinessWorkDetails={setBusinessWorkDetails} 
                businessWorkDetails={businessWorkDetails}/>
              )}
              {step === 3 && (
                <CommunityLocation
                  segments={segments}
                  setSegment={setSegment}
                  refactorStateArray={refactorStateArray}
                  segIds={segIds}
                  setSegIds={setSegIds}
                  communityType={communityType}
                  setCommunityType={setCommunityType}
                  subIds={subIds}
                  setSubIds={setSubIds}
                  setShowModal={setShowModal}
                  showModal={showModal}
                  setSegments={setSegments}
                  segmentRequests={segmentRequests}
                  setSegmentRequests={setSegmentRequests}
                  showNext={userType !== USER_TYPES.BUSINESS && userType !== USER_TYPES.COMMUNITY}
                  userType={userType}
                  businessWorkDetails = {businessWorkDetails}
                />
              )}
              {((step === 4 &&
                userType !== USER_TYPES.BUSINESS &&
                userType !== USER_TYPES.COMMUNITY) ||
                (step === 5 &&
                  (userType === USER_TYPES.BUSINESS ||
                    userType === USER_TYPES.COMMUNITY))) && (
                <UserAgreement submitError={submitError} />
              )}
              {step === 4 &&
                (userType === USER_TYPES.BUSINESS ||
                  userType === USER_TYPES.COMMUNITY) && (
                <RegisterPageContentReach
                  data={reachData}
                  selected={selectedSegId}
                  setSelected={setselectedSegId}
                />
              )}
              {((step === 6 &&
                (userType === USER_TYPES.BUSINESS ||
                  userType === USER_TYPES.COMMUNITY)) ||
                (step === 5 &&
                  userType !== USER_TYPES.BUSINESS &&
                  userType !== USER_TYPES.COMMUNITY)) && (
                <SubmitForm submitError={submitError} />
              )}
              {step === 7 &&
                (userType === USER_TYPES.BUSINESS ||
                  userType === USER_TYPES.COMMUNITY) && <SetUpAd />}
             <Form>
              <NextAndBackButton
                userType={userType}
                setStep={setStep}
                step={step}
              />
            </Form>
            </>
          </FormikStepper>
        </Card.Body>
      </Card>
    </div>
  );
}

export default StepController;