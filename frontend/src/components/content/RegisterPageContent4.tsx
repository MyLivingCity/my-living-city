import { Alert, Button, Card } from 'react-bootstrap';
import { Form as BForm } from 'react-bootstrap';
import {
    ErrorMessage,
    Field,
    FieldHookConfig,
    FieldInputProps,
    Form,
    Formik,
    FormikConfig,
    FormikProps,
} from 'formik';
import React, { useContext, useEffect, useState, useRef } from 'react';
import SimpleMap from '../map/SimpleMap';
import {
    capitalizeFirstLetterEachWord,
    refactorStateArray,
    wipeLocalStorage,
} from 'src/lib/utilityFunctions';
import {
    findSegmentByName,
    findSubsegmentsBySegmentId,
    getAllSegmentsWithSuperSegId,
    getAllSegments,
} from 'src/lib/api/segmentRoutes';
import { ISegment, ISubSegment } from 'src/lib/types/data/segment.type';
import * as Yup from 'yup';
import Stepper from 'react-stepper-horizontal';
import '../../../src/scss/ui/_other.scss';
import { IFetchError } from '../../lib/types/types';
import { searchForLocation } from 'src/lib/api/googleMapQuery';
import { getUserWithEmail, postRegisterUser } from 'src/lib/api/userRoutes';
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { IRegisterInput } from '../../lib/types/input/register.input';
import { RequestSegmentModal } from '../partials/RequestSegmentModal';
import ImageUploader from 'react-images-upload';
import { ROUTES, TEXT_INPUT_LIMIT, USER_TYPES } from 'src/lib/constants';
import {
    RegisterPageContentReach,
    CheckBoxItem,
} from './RegisterPageContentReach';
import CSS from 'csstype';
import PricingPlanSelector from '../partials/PricingPlanSelector';



interface RegisterPageContentProps {}
type Props = FieldHookConfig<string> & {
  field: FieldInputProps<string>;
};

export const RegisterPageContent: React.FC<RegisterPageContentProps> = ({}) => {
    const { setToken, setUser } = useContext(UserProfileContext);
    const [markers, sendData]: any = useState({
        home: { lat: null, lon: null },
        work: { lat: null, lon: null },
        school: { lat: null, lon: null },
    });
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [map, showMap] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [segment, setSegment] = useState<ISegment>();
    const [segments, setSegments] = useState<ISegment[]>([]);
    const [segment2, setSegment2] = useState<ISegment>();
    const [subSegments, setSubSegments] = useState<ISubSegment[]>();
    const [subSegments2, setSubSegments2] = useState<ISubSegment[]>();
    const [subIds, setSubIds] = useState<any[]>([]);
    const [segIds, setSegIds] = useState<any[]>([]);
    const [superIds, setSuperIds] = useState<any[]>([]);
    const [avatar, setAvatar] = useState(undefined);
    const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
    const [userType, setUserType] = useState<string>(USER_TYPES.RESIDENTIAL);
    const [communityType, setCommunityType] = useState<string | null>(null);
    const [error, setError] = useState<IFetchError | null>(null);
 
    //These two useState vars set if the values should be transferred from the one to the other before the form submits.
    //Used with the radio buttons.
    const [workTransfer, transferHomeToWork] = useState(false);
    const [schoolTransfer, transferWorkToSchool] = useState(false);
    const displaySubSegList = (id: number) => {
        console.log('subSegments: ', subSegments);
        console.log('ID: ', id);
        if (subSegments && subSegments[0].parentId === id) {
            return subSegments?.map((subSeg) => (
                <option key={subSeg.segId} value={subSeg.segId}>
                    {capitalizeFirstLetterEachWord(subSeg.name)}
                </option>
            ));
        }
        if (subSegments2 && subSegments2[0].parentId === id) {
            return subSegments2?.map((subSeg) => (
                <option key={subSeg.id} value={subSeg.id}>
                    {capitalizeFirstLetterEachWord(subSeg.name)}
                </option>
            ));
        }
    };

    const [selectedSegId, setselectedSegId] = useState<any>([]);
    const [reachData, setReachData] = useState<CheckBoxItem[]>([]);

    const getReachData = async () => {
        let data: CheckBoxItem[] = [];
        let region: CheckBoxItem = {
            label: segment?.parentSegment?.name,
            value: 'SuperSeg',
            children: [],
        };

        const res = await getAllSegmentsWithSuperSegId(segment?.parentSegment?.segId);

        res.forEach((segment) => {
            region.children?.push({
                label: segment?.name,
                value: segment?.segId,
            });
        });

        data.push(region);
        setReachData(data);
    };

    useEffect(() => {
        if (
            segment !== null &&
      (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY)
        ) {
            getReachData();
        }
    }, [segment]);

    const userTypeInfoContainerStyles: CSS.Properties = {
        marginTop: '40px',
    };

    const inline: CSS.Properties = {
        display: 'inline',
        marginLeft: '10px',
    };

    const marginBot: CSS.Properties = {
        marginBottom: '20px',
    };

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
                console.log('Found segments: ', fetchedSegments);
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

    async function setSubsegData(segmentId: number) {
        /* Fetch subsegments and use them to populate the "neighborhood" dropdown*/
        try {
            setError(null);
            setIsLoading(true); 
    
            const subsegments = await findSubsegmentsBySegmentId(segmentId);
            console.log('Fetched Subsegments for Segment ID', segmentId, ':', subsegments);
            setSubSegments(subsegments);
    
            refactorStateArray(subIds, 0, subsegments[0]?.id || null, setSubIds);
        } catch (err) {
            console.error('Error fetching subsegments:', err);
            setError(new Error('An error occurred while fetching the subsegments'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='register-page-content'>
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
                    homeSuperSegmentId: undefined,
                    workSuperSegmentId: undefined,
                    schoolSuperSegmentId: undefined,
                    userType: USER_TYPES.RESIDENTIAL,
                    reachSegmentIds: [],
                }}
                markers={markers}
                setSegment={setSegment}
                setSegments={setSegments}
                setSegment2={setSegment2}
                setSubSegments={setSubSegments}
                setSubSegments2={setSubSegments2}
                setSubIds={setSubIds}
                setSegIds={setSegIds}
                segIds={segIds}
                showMap={showMap}
                subIds={subIds}
                superIds={superIds}
                workTransfer={workTransfer}
                schoolTransfer={schoolTransfer}
                avatar={avatar}
                userType={userType}
                reachSegmentIds={selectedSegId}
                communityType={communityType}         
                setCommunityType={setCommunityType}
                setSegData={setSegData}
                setSubsegData={setSubsegData}
                onSubmit={async (values, helpers) => {
                    console.log('Formik Values:', values);
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
                        console.log(error);
                        wipeLocalStorage();
                    } finally {
                        setIsLoading(false);
                    }
                }}
            >
                <FormikStep>
                    <h3>Please select your account type:</h3>
                    <BForm.Group className='m-4'>
                        <PricingPlanSelector
                            onClickParam={(type: any) => setUserType(type)}
                        />
                    </BForm.Group>
                </FormikStep>
                {(userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) && (
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
                                .test('Unique Email', 'Email already in use', function (value) {
                                    return new Promise((resolve, reject) => {
                                        getUserWithEmail(value).then((res) => {
                                            res === 200 ? resolve(false) : resolve(true);
                                        });
                                    });
                                }),
                        })}
                    >
                        <BForm.Group>
                            <BForm.Label>Email address</BForm.Label>
                            <Field required name='email' type='email' as={BForm.Control} />
                            <ErrorMessage name='email'>
                                {(msg) => (
                                    <p className='text-danger'>
                                        {msg}
                                        <br></br>
                                    </p>
                                )}
                            </ErrorMessage>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Password</BForm.Label>
                            <Field
                                required
                                name='password'
                                type='password'
                                as={BForm.Control}
                            />
                            <ErrorMessage name='password'>
                                {(msg) => (
                                    <p className='text-danger'>
                                        {msg}
                                        <br></br>
                                    </p>
                                )}
                            </ErrorMessage>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Confirm Password</BForm.Label>
                            <Field
                                required
                                name='confirmPassword'
                                type='password'
                                as={BForm.Control}
                            />
                            <ErrorMessage name='confirmPassword'>
                                {(msg) => (
                                    <p className='text-danger'>
                                        {msg}
                                        <br></br>
                                    </p>
                                )}
                            </ErrorMessage>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Organization Name</BForm.Label>
                            <Field
                                required
                                name='organizationName'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Contact First Name</BForm.Label>
                            <Field required name='fname '>
                                {({ field }: Props) => (
                                    <BForm.Control
                                        {...field}
                                        type='text'
                                        maxLength={TEXT_INPUT_LIMIT.NAME}
                                    />
                                )}
                            </Field>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Contact Last Name</BForm.Label>
                            <Field required name='lname'>
                                {({ field }: Props) => (
                                    <BForm.Control
                                        {...field}
                                        type='text'
                                        maxLength={TEXT_INPUT_LIMIT.NAME}
                                    />
                                )}
                            </Field>
                        </BForm.Group>
                        <BForm.Group>
                            <Field
                                name='imagePath'
                                type='file'
                                fileContainerStyle={{ backgroundColor: '#F8F9FA' }}
                                withPreview={true}
                                onChange={(pic: any) => setAvatar(pic[0])}
                                imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
                                buttonText='Select Profile Picture'
                                maxFileSize={2097152}
                                label={'Max file size 2mb, \n jpg, jpeg, png, webp'}
                                singleImage={true}
                                as={ImageUploader}
                            />
                            {/* <ImageUploader name="imagePath" fileContainerStyle={{backgroundColor: "#F8F9FA"}}withPreview={true} onChange={pic=>console.log(pic)} imgExtension={['.jpg','.jpeg','.png','.webp']} buttonText="Select Idea Image" maxFileSize={10485760} label={"Max file size 10mb, \n jpg, jpeg, png, webp"} singleImage={true}/> */}
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Street Name</BForm.Label>
                            <Field
                                required
                                name='address.streetAddress'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>ZIP / Postal Code</BForm.Label>
                            <Field name='address.postalCode' type='text' as={BForm.Control} />
                        </BForm.Group>
                    </FormikStep>
                )}

                {userType != USER_TYPES.BUSINESS && userType != USER_TYPES.COMMUNITY && (
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
                                        return new Promise((resolve, reject) => {
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
                            <Field required name='email' type='email' as={BForm.Control} />
                            <ErrorMessage name='email'>
                                {(msg) => (
                                    <p className='text-danger'>
                                        {msg}
                                        <br></br>
                                    </p>
                                )}
                            </ErrorMessage>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Password</BForm.Label>
                            <Field
                                required
                                name='password'
                                type='password'
                                as={BForm.Control}
                            />
                            <ErrorMessage name='password'>
                                {(msg) => (
                                    <p className='text-danger'>
                                        {msg}
                                        <br></br>
                                    </p>
                                )}
                            </ErrorMessage>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Confirm Password</BForm.Label>
                            <Field
                                required
                                name='confirmPassword'
                                type='password'
                                as={BForm.Control}
                            />
                            <ErrorMessage name='confirmPassword'>
                                {(msg) => (
                                    <p className='text-danger'>
                                        {msg}
                                        <br></br>
                                    </p>
                                )}
                            </ErrorMessage>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>First Name</BForm.Label>
                            <Field required name='fname'>
                                {({ field }: Props) => (
                                    <BForm.Control
                                        {...field}
                                        type='text'
                                        maxLength={TEXT_INPUT_LIMIT.NAME}
                                    />
                                )}
                            </Field>
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Last Name</BForm.Label>
                            <Field required name='lname'>
                                {({ field }: Props) => (
                                    <BForm.Control
                                        {...field}
                                        type='text'
                                        maxLength={TEXT_INPUT_LIMIT.NAME}
                                    />
                                )}
                            </Field>
                        </BForm.Group>
                        <BForm.Group>
                            <Field
                                name='imagePath'
                                type='file'
                                fileContainerStyle={{ backgroundColor: '#F8F9FA' }}
                                withPreview={true}
                                onChange={(pic: any) => setAvatar(pic[0])}
                                imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
                                buttonText='Select Profile Picture'
                                maxFileSize={2097152}
                                label={'Max file size 2mb, \n jpg, jpeg, png, webp'}
                                singleImage={true}
                                as={ImageUploader}
                            />
                            {/* <ImageUploader name="imagePath" fileContainerStyle={{backgroundColor: "#F8F9FA"}}withPreview={true} onChange={pic=>console.log(pic)} imgExtension={['.jpg','.jpeg','.png','.webp']} buttonText="Select Idea Image" maxFileSize={10485760} label={"Max file size 10mb, \n jpg, jpeg, png, webp"} singleImage={true}/> */}
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Street Name</BForm.Label>
                            <Field
                                required
                                name='address.streetAddress'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>ZIP / Postal Code</BForm.Label>
                            <Field
                                name='address.postalCode'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                    </FormikStep>
                )}
                
                {/* For non residential users */}
                {userType !== USER_TYPES.RESIDENTIAL && (
                    <>
                        <FormikStep>
                            <Card.Title>Show us on the map where your home is</Card.Title>
                            <Card.Subtitle className='text-muted mb-3'>
                                We use this information to find your community!
                            </Card.Subtitle>
                            <SimpleMap
                                iconName={'home'}
                                sendData={(markers: any) => sendData(markers)}
                            />
                        </FormikStep>

                        <FormikStep>
                            <BForm.Group>
                                {segment || segment2 ? null : (
                                    <p>Your home municipality is not registered in our system.</p>
                                )}
                                <BForm.Label>Select your home municipality</BForm.Label>
                                <BForm.Control
                                    name='homeSegmentId'
                                    as='select'
                                    onChange={(e) => {
                                        refactorStateArray(
                                            segIds,
                                            0,
                                            parseInt(e.target.value),
                                            setSegIds
                                        );
                                        refactorStateArray(subIds, 0, null, setSubIds);
                                    }}
                                >
                                    {segment && (
                                        <option value={segment?.segId}>
                                            {capitalizeFirstLetterEachWord(segment?.name)}
                                        </option>
                                    )}
                                    {segment2 && (
                                        <option value={segment2?.segId}>
                                            {capitalizeFirstLetterEachWord(segment2?.name)}
                                        </option>
                                    )}
                                </BForm.Control>
                            </BForm.Group>
                            <BForm.Group>
                                <BForm.Label>Select your Neighbourhood (optional)</BForm.Label>
                                <BForm.Control
                                    name='homeSubName'
                                    as='select'
                                    onChange={(e) => {
                                        refactorStateArray(
                                            subIds,
                                            0,
                                            parseInt(e.target.value),
                                            setSubIds
                                        );
                                    }}
                                >
                                    <option hidden></option>
                                    {displaySubSegList(segIds[0])}
                                </BForm.Control>
                                <p>
                                    Don't see your Municipality?
                                    <Button
                                        onClick={() => {
                                            setShowModal(true);
                                        }}
                                        variant='link text-primary'
                                    >
                                        Click here
                                    </Button>
                                </p>
                            </BForm.Group>
                            <RequestSegmentModal
                                showModal={showModal}
                                setShowModal={setShowModal}
                                index={0}
                                setSegmentRequests={setSegmentRequests}
                                segmentRequests={segmentRequests}
                            />
                        </FormikStep>
                    </>
                )}

                <FormikStep>
                    <BForm.Control
                        name='homeSegmentId'
                        as='select'
                        className='mb-3'
                        onChange={(e) => {
                            const selectedSegment = segments.find(
                                (seg) => seg.segId === parseInt(e.target.value)
                            );
                            if (selectedSegment) {
                                setSegment(selectedSegment);
                                refactorStateArray(segIds, 0, selectedSegment.segId, setSegIds);
                                refactorStateArray(subIds, 0, null, setSubIds);
                                refactorStateArray(superIds, 0, selectedSegment.parentId ?? null, setSuperIds);
                                setSubsegData(selectedSegment.segId);
                            }
                        }}
                    >
                        <option hidden>Select a municipality</option>
                        {segments.map((seg: ISegment) => (
                            <option key={seg.segId} value={seg.segId}>
                                {capitalizeFirstLetterEachWord(seg.name)}
                            </option>
                        ))}
                    </BForm.Control>

                    <BForm.Group>
                        <BForm.Label>Select your Neighbourhood (optional)</BForm.Label>
                        <BForm.Control
                            name='homeSubName'
                            as='select'
                            onChange={(e) => {  
                                console.log('Subseg prefactor subIds:', subIds);
                                console.log('E:', e);
                                refactorStateArray(
                                    subIds,
                                    0,
                                    parseInt(e.target.value),
                                    setSubIds
                                );
                                console.log('Subseg postfactor subIds:', subIds);

                            }}
                        >
                            <option hidden></option>
                            {displaySubSegList(segIds[0])}
                        </BForm.Control>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Select your community relationship</BForm.Label>
                        <BForm.Control
                            as='select'
                            value={communityType || ''}
                            onChange={(e) => {
                                const type = e.target.value;    
                                setCommunityType(type);
                            }}
                        >
                            <option hidden>Select a type</option>
                            <option value='home'>Home</option>
                            <option value='work'>Work</option>
                            <option value='school'>School</option>
                        </BForm.Control>
                        <p>
              Don't see your Municipality?
                            <Button
                                onClick={() => {
                                    setShowModal(true);
                                }}
                                variant='link text-primary'
                            >
                Click here
                            </Button>
                        </p>
                    </BForm.Group>

                    {/* Conditionally render Work Details */}
                    {communityType === 'work' && (
                        <FormikStep
                            validationSchema={Yup.object().shape({
                                workDetails: Yup.object().shape({
                                    streetAddress: Yup.string().required('Work Street Name is required'),
                                    postalCode: Yup.string().required('Work ZIP / Postal Code is required'),
                                    company: Yup.string().required('Company is required'),
                                }),
                            })}
                        >
                            <BForm.Group>
                                <BForm.Label>Work Street Name</BForm.Label>
                                <Field
                                    required={communityType === 'work'} 
                                    name='workDetails.streetAddress'
                                    type='text'
                                    as={BForm.Control}
                                />
                            </BForm.Group>
                            <BForm.Group>
                                <BForm.Label>Work ZIP / Postal Code</BForm.Label>
                                <Field
                                    required={communityType === 'work'} 
                                    name='workDetails.postalCode'
                                    type='text'
                                    as={BForm.Control}
                                />
                            </BForm.Group>
                            <BForm.Group>
                                <BForm.Label>Company</BForm.Label>
                                <Field
                                    required={communityType === 'work'} 
                                    name='workDetails.company'
                                    type='text'
                                    as={BForm.Control}
                                />
                            </BForm.Group>
                        </FormikStep>
                    )}
                    {/* Conditionally render School Details */}
                    {communityType === 'school' && (
                        <FormikStep
                            validationSchema={Yup.object().shape({
                                schoolDetails: Yup.object().shape({
                                    streetAddress: Yup.string()
                                        .required('School Street Name is required'),
                                    postalCode: Yup.string()
                                        .required('School ZIP / Postal Code is required'),
                                    faculty: Yup.string()
                                        .required('Faculty / Department of Study is required'),
                                    programCompletionDate: Yup.date()
                                        .required('Program Completion Date is required')
                                        .typeError('Invalid date format'),
                                }),
                            })}
                        >
                            <BForm.Group>
                                <BForm.Label>School Street Name</BForm.Label>
                                <Field
                                    required={communityType === 'school'} 
                                    name='schoolDetails.streetAddress'
                                    type='text'
                                    as={BForm.Control}
                                />
                            </BForm.Group>
                            <BForm.Group>
                                <BForm.Label>School ZIP / Postal Code</BForm.Label>
                                <Field
                                    required={communityType === 'school'} 
                                    name='schoolDetails.postalCode'
                                    type='text'
                                    as={BForm.Control}
                                />
                            </BForm.Group>
                            <BForm.Group>
                                <BForm.Label>Faculty / Department of Study</BForm.Label>
                                <Field
                                    required={communityType === 'school'} 
                                    name='schoolDetails.faculty'
                                    type='text'
                                    as={BForm.Control}
                                />
                            </BForm.Group>
                            <BForm.Group>
                                <BForm.Label>Program Completion Date</BForm.Label>
                                <Field
                                    required={communityType === 'school'} 
                                    name='schoolDetails.programCompletionDate'
                                    type='date'
                                    as={BForm.Control}
                                />
                            </BForm.Group>
                        </FormikStep>
                    )}

                    <RequestSegmentModal
                        showModal={showModal}
                        setShowModal={setShowModal}
                        index={0}
                        setSegmentRequests={setSegmentRequests}
                        segmentRequests={segmentRequests}
                    />
                </FormikStep>

                {(userType === USER_TYPES.BUSINESS ||
          userType === USER_TYPES.COMMUNITY) && (
                    <FormikStep>
                        <RegisterPageContentReach
                            data={reachData}
                            selected={selectedSegId}
                            setSelected={setselectedSegId}
                        />
                    </FormikStep>
                )}

                <FormikStep>
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
                </FormikStep>

                <FormikStep>
                    {submitError && <Alert variant='danger'>{submitError}</Alert>}
                    <h3>
            To complete registration press submit! Make sure to check your email
            for a verification code!{' '}
                    </h3>
                    {/* Stripe Payment Implementation Goes Here */}
                    {/* <BForm.Group> */}
                    {/* </BForm.Group> */}
                </FormikStep>

                {/* <FormikStep>
                    <h3>To complete your account registration click submit</h3>
                </FormikStep> */}

                {(userType === USER_TYPES.BUSINESS ||
          userType === USER_TYPES.COMMUNITY) && (
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
                )}
            </FormikStepper>
        </div>
    );
};

export interface FormikStepProps
  extends Pick<FormikConfig<IRegisterInput>, 'children' | 'validationSchema'> {
  // setSegmentId?: any;
}

export function FormikStep({ children }: FormikStepProps) {
    return <>{children}</>;
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
  superIds: any,
  workTransfer: boolean;
  schoolTransfer: boolean;
  avatar: any;
  userType: any;
  reachSegmentIds: any;
  communityType: string| null;
  setCommunityType: React.Dispatch<React.SetStateAction<string | null>>;
  setSegData: (index: number) => Promise<void>;
  setSubsegData: (segmentId: number) => Promise<void>;
}
export function FormikStepper({
    children,
    markers,
    showMap,
    subIds,
    segIds,
    superIds,
    schoolTransfer,
    workTransfer,
    setSubIds,
    setSegIds,
    avatar,
    userType,
    reachSegmentIds,
    communityType,
    setCommunityType,
    setSegData,   
    setSubsegData,
    ...props
}: FormikStepperProps) {
    const childrenArray = React.Children.toArray(
        children
    ) as React.ReactElement<FormikStepProps>[];
    const [step, setStep] = useState(0);
    const [inferStep, setInferStep] = useState(0);
    const currentChild = childrenArray[
        step
    ] as React.ReactElement<FormikStepProps>;

    //DEBUGGING useEffect to see the current step
    // useEffect(() => {
    //     console.log('Step changed to:', step);
    // }, [step]);

    // useEffect(() => {
    //     console.log('InferStep changed to:', inferStep);
    // }, [inferStep]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<IFetchError | null>(null);
    const isLastStep = () => {
        return step === childrenArray.length - 1;
    };
    const nextOrLoading = () => {
        return isLoading ? 'Loading...' : 'Next';
    };
    const submitOrSubmitting = () => {
        return isLoading ? 'Submitting...' : 'Submit';
    };
    const isCommunitySelected = () => {
        if (userType === USER_TYPES.RESIDENTIAL){
            return (
                step === 2 && 
                (!segIds[0] || segIds[0] === null || !communityType)
            );
        } else {
            return step === 2 && markers.home.lat === null;
        }
    };
    
    const getStepHeader = (step: number) => {
        switch (step) {
            case 0:
                return 'Create Account';
            case 1:
                return 'Community Location';
            case 2:
                return userType === USER_TYPES.RESIDENTIAL
                    ? 'User Agreement and Community Guidelines'
                    : 'Reach';
            case 3:
                return userType === USER_TYPES.RESIDENTIAL ? 'Submit' : 'User Agreement and Community Guidelines'; 
            case 4:
                return userType === USER_TYPES.RESIDENTIAL
                    ? ''
                    : 'Submit';
            case 5:
                return userType === USER_TYPES.RESIDENTIAL ? '' : 'Create Ad';
            default:
                return '';
      // }
        }
    };

    //This handles the step and inferStep state variables.
    //Step keeps track of the current child to display.
    //InferStep keeps track of the step icons.
    //Since some steps will have multiple "steps" the infer step decreases dependant on if map selections have occured.
    const handleBackButton = () => {
        if (userType === USER_TYPES.RESIDENTIAL) {

            if (step === 2 || step === 3 ){
                setCommunityType(null);
            }

            if (step > 1){
                setInferStep((s) => s - 1);
                setStep((s) => s - 1);
            } else {
                setStep((s) => s - 1);
            }

        } else {
            if (step === 3 || step === 1) {
                setStep((s) => s - 1);
            } else {
                setStep((s) => s - 1);
                setInferStep((s) => s - 1);
            }
        }
    };
    //This function calls the google api to receive data on the map location
    //The data is then searched in the back end for a matching segment
    //Then the back end is searched for all the sub-segments of that matching segment.
    async function setMapSegData(index: number) {
        let googleQuery: any;
        let testMode = true;
        try {
            //PLACEHOLDER for GOOGLE API query
            setError(null);
            setIsLoading(true);
            switch (index) {
                case 0:
                    googleQuery = await searchForLocation(markers.home);
                    console.log('google home query');
                    break;
                case 1:
                    googleQuery = await searchForLocation(markers.work);
                    console.log('google work query');
                    break;
                case 2:
                    googleQuery = await searchForLocation(markers.school);
                    console.log('google school query');
                    break;
                default:
            }
            if (googleQuery.city2) {
                const seg2 = await findSegmentByName({
                    segName: googleQuery.city2,
                    province: googleQuery.province,
                    country: googleQuery.country,
                });
                if (seg2) {
                    props.setSegment2(seg2);
                    refactorStateArray(segIds, index, seg2.segId, setSegIds);

                    const sub2 = await findSubsegmentsBySegmentId(seg2.segId);
                    props.setSubSegments2(sub2);
                    
                } else {
                    props.setSegment2(null);
                    props.setSubSegments2(null);
                }
            }
            if (googleQuery.city) {
                const seg = await findSegmentByName({
                    segName: googleQuery.city,
                    province: googleQuery.province,
                    country: googleQuery.country,
                });
                if (seg) {
                    props.setSegment(seg);
                    refactorStateArray(segIds, index, seg.segId, setSegIds);
                    const sub = await findSubsegmentsBySegmentId(seg.segId);
                    props.setSubSegments(sub);
                } else {
                    props.setSegment(null);
                    props.setSubSegments(null);
                }
            }
            setStep((s) => s + 1);
        } catch (err) {
            console.log(err);
            //placeHolder
            //Need to do better error handling here.
            //setError(new Error(err.response.data));
        }
    }
    
    if (userType === USER_TYPES.RESIDENTIAL) {
        return (
            <Formik
                {...props}
                validationSchema={currentChild?.props.validationSchema}
                onSubmit={async (values, helpers) => {
                    if (
                        step === 4 &&
            (userType === USER_TYPES.BUSINESS ||
              userType === USER_TYPES.COMMUNITY)
                    ) {
                        values.reachSegmentIds = reachSegmentIds;
                    }

                    if (step === 0) {
                        values.userType = userType;
                        setStep((s) => s + 1);
                    } else if (
                        (isLastStep() && userType === USER_TYPES.RESIDENTIAL) ||
            ((userType === USER_TYPES.BUSINESS ||
              userType === USER_TYPES.COMMUNITY) &&
              step === 6)
                    ) {
                        setIsLoading(true);
                        await new Promise((r) => setTimeout(r, 2000));
                        await props.onSubmit(values, helpers);
                        if (userType !== USER_TYPES.RESIDENTIAL) {
                            setStep((s) => s + 1);
                            setInferStep((s) => s + 1);
                        }
                    } else if (step === 1 && userType === USER_TYPES.RESIDENTIAL) {
                        const seg = await setSegData(0);

                        setStep((s) => s + 1);

                        showMap(false);
                        setInferStep((s) => s + 1);
                    } else if(step === 2 && userType !== USER_TYPES.RESIDENTIAL){
                        const seg = await setMapSegData(0);
                        showMap(false);
                    }
                    
                    else if (
                        (step === 3 && userType === USER_TYPES.RESIDENTIAL)
                    ) {
                        setIsLoading(true);
                        helpers.setFieldValue('geo.lat', markers.home.lat);
                        helpers.setFieldValue('geo.lon', markers.home.lon);
                        helpers.setFieldValue('geo.work_lat', markers.work.lat);
                        helpers.setFieldValue('geo.work_lon', markers.work.lon);
                        helpers.setFieldValue('geo.school_lat', markers.school.lat);
                        helpers.setFieldValue('geo.school_lon', markers.school.lon);

                        if (communityType === 'home') {
                            helpers.setFieldValue('homeSegmentId', segIds[0] || null);
                            helpers.setFieldValue('homeSubSegmentId', subIds[0] || null);
                            helpers.setFieldValue('homeSuperSegmentId', superIds[0] || null);

                            //clear other fields
                            helpers.setFieldValue('workDetails', { streetAddress: '', postalCode: '', company: '' });
                            helpers.setFieldValue('schoolDetails', {
                                streetAddress: '',
                                postalCode: '',
                                faculty: '',
                                programCompletionDate: '',
                            });

                        } else if (communityType === 'work') {

                            helpers.setFieldValue('workSegmentId', segIds[0] || null);
                            helpers.setFieldValue('workSubSegmentId', subIds[0] || null);

                            //clear school fields
                            helpers.setFieldValue('schoolDetails', {
                                streetAddress: '',
                                postalCode: '',
                                faculty: '',
                                programCompletionDate: '',
                            });
                        } else if (communityType === 'school') {
                            helpers.setFieldValue('schoolSegmentId', segIds[0] || null);
                            helpers.setFieldValue('schoolSubSegmentId', subIds[0] || null);

                            //clear work fields
                            helpers.setFieldValue('workDetails', { streetAddress: '', postalCode: '', company: '' });
                        }


                        helpers.setFieldValue('imagePath', avatar);
                        setStep((s) => s + 1);
                        setInferStep((s) => s + 1);
                    } else if((step === 5 && userType === USER_TYPES.COMMUNITY) ||
                        (step === 5 && userType === USER_TYPES.BUSINESS)){
                        setIsLoading(true);
                        //Field setters for the external inputs. Formik can only handle native form elements.
                        //These fields must be added manually.
                        helpers.setFieldValue('geo.lat', markers.home.lat);
                        helpers.setFieldValue('geo.lon', markers.home.lon);
                        helpers.setFieldValue('geo.work_lat', markers.work.lat);
                        helpers.setFieldValue('geo.work_lon', markers.work.lon);
                        helpers.setFieldValue('geo.school_lat', markers.school.lat);
                        helpers.setFieldValue('geo.school_lon', markers.school.lon);

                        helpers.setFieldValue('homeSegmentId', segIds[0] || null);
                        helpers.setFieldValue('homeSubSegmentId', subIds[0] || null);

                        helpers.setFieldValue('workSubSegmentId', subIds[1] || null);
                        helpers.setFieldValue('workSegmentId', segIds[1] || null);
                        helpers.setFieldValue('schoolSubSegmentId', subIds[2] || null);
                        helpers.setFieldValue('schoolSegmentId', segIds[2] || null);
                        helpers.setFieldValue('imagePath', avatar);
                        setStep((s) => s + 1);
                        setInferStep((s) => s + 1);

                    } else {
                        setStep((s) => s + 1);
                        setInferStep((s) => s + 1);
                    }

                    setIsLoading(false);
                }}
            >
                <div>
                    <div className='stepper mb-4'>
                        {userType === USER_TYPES.RESIDENTIAL ? (
                            <Stepper
                                steps={[
                                    { title: `${getStepHeader(0)}` },
                                    { title: `${getStepHeader(1)}` },
                                    { title: `${getStepHeader(2)}` },
                                    { title: `${getStepHeader(3)}` },
                                ]}
                                activeStep={inferStep}
                                circleTop={0}
                                lineMarginOffset={8}
                                activeColor={'#98cc74'}
                                completeColor={'#98cc74'}
                                completeBarColor={'#98cc74'}
                                titleFontSize={19}
                            />
                        ) : (
                            <Stepper
                                steps={[
                                    { title: `${getStepHeader(0)}` },
                                    { title: `${getStepHeader(1)}` },
                                    { title: `${getStepHeader(2)}` },
                                    { title: `${getStepHeader(3)}` },
                                    { title: `${getStepHeader(4)}` },
                                    { title: `${getStepHeader(5)}` },
                                ]}
                                activeStep={inferStep}
                                circleTop={0}
                                lineMarginOffset={8}
                                activeColor={'#98cc74'}
                                completeColor={'#98cc74'}
                                completeBarColor={'#98cc74'}
                                titleFontSize={19}
                            />
                        )}
                    </div>
                    <Card>
                        <Card.Header>
                            <h3>{getStepHeader(inferStep)}</h3>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                {currentChild}
                                {error && (
                                    <Alert variant='danger' className='error-alert'>
                                        {error.message}
                                    </Alert>
                                )}
                                <div className='text-center'>
                                    {(step > 0 && userType === USER_TYPES.RESIDENTIAL) ||
                                    (!isLastStep() &&
                                        step > 0 &&
                                        userType !== USER_TYPES.RESIDENTIAL) ? (
                                            <Button
                                                className='float-left mt-3'
                                                size='lg'
                                                variant='outline-primary'
                                                onClick={() => {
                                                    handleBackButton();
                                                }}
                                            >
                                                Back
                                            </Button>
                                        ) : null}

                                    {isLastStep() && userType !== USER_TYPES.RESIDENTIAL ? null : (
                                        <Button
                                            className='float-right mt-3 d-flex align-items-center'
                                            size='lg'
                                            type='submit'
                                            disabled={isLoading || isCommunitySelected()}
                                        >
                                            {isLoading && (
                                                <span
                                                    className='spinner-border spinner-border-sm'
                                                    role='status'
                                                    aria-hidden='true'
                                                ></span>
                                            )}
                                            {(isLastStep() && userType === USER_TYPES.RESIDENTIAL) ||
                                            (userType !== USER_TYPES.RESIDENTIAL && step === 6)
                                                ? submitOrSubmitting()
                                                : nextOrLoading()}
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Formik>
        );
    } else {
        return (
            <Formik
                {...props}
                validationSchema={currentChild?.props.validationSchema}
                onSubmit={async (values, helpers) => {
                    if (
                        step === 4 &&
            (userType === USER_TYPES.BUSINESS ||
              userType === USER_TYPES.COMMUNITY)
                    ) {
                        values.reachSegmentIds = reachSegmentIds;
                    }

                    if (step === 0) {
                        // values.userType = (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) ?  USER_TYPES.IN_PROGRESS : USER_TYPES.RESIDENTIAL;
                        values.userType = userType;
                        setStep((s) => s + 1);
                    } else if (
                        (isLastStep() && userType === USER_TYPES.RESIDENTIAL) ||
            ((userType === USER_TYPES.BUSINESS ||
              userType === USER_TYPES.COMMUNITY) &&
              step === 6)
                    ) {
                        setIsLoading(true);
                        await new Promise((r) => setTimeout(r, 2000));
                        await props.onSubmit(values, helpers);
                        if (userType !== USER_TYPES.RESIDENTIAL) {
                            setStep((s) => s + 1);
                            setInferStep((s) => s + 1);
                        }
                    } else if (step === 2) {
                        const seg = await setSegData(0);
                        setStep((s) => s + 1);
                        showMap(false);
                    } else if (step === 4 && userType === USER_TYPES.RESIDENTIAL) {
                        if (markers.work.lat === null) {
                            setStep((s) => s + 2);
                            setInferStep((s) => s + 1);
                            if (workTransfer) {
                                refactorStateArray(segIds, 1, segIds[0], setSegIds);
                                refactorStateArray(subIds, 1, subIds[0], setSubIds);
                            }
                        } else {
                            const seg = await setSegData(1);
                            setStep((s) => s + 1);
                        }
                        showMap(false);
                    } else if (step === 6 && userType === USER_TYPES.RESIDENTIAL) {
                        console.log(segIds);
                        if (markers.school.lat === null) {
                            setStep((s) => s + 2);
                            setInferStep((s) => s + 1);
                            if (schoolTransfer) {
                                refactorStateArray(
                                    segIds,
                                    2,
                                    segIds[1] || segIds[0],
                                    setSegIds
                                );
                                refactorStateArray(
                                    subIds,
                                    2,
                                    subIds[1] || subIds[0],
                                    setSubIds
                                );
                            }
                        } else {
                            const seg = await setSegData(2);
                            setStep((s) => s + 1);
                        }
                        setIsLoading(false);
                    } else if (
                        (step === 8 && userType !== USER_TYPES.RESIDENTIAL) ||
            (step === 5 && userType === USER_TYPES.COMMUNITY) ||
            (step === 5 && userType === USER_TYPES.BUSINESS)
                    ) {
                        setIsLoading(true);
                        //Field setters for the external inputs. Formik can only handle native form elements.
                        //These fields must be added manually.
                        helpers.setFieldValue('geo.lat', markers.home.lat);
                        helpers.setFieldValue('geo.lon', markers.home.lon);
                        helpers.setFieldValue('geo.work_lat', markers.work.lat);
                        helpers.setFieldValue('geo.work_lon', markers.work.lon);
                        helpers.setFieldValue('geo.school_lat', markers.school.lat);
                        helpers.setFieldValue('geo.school_lon', markers.school.lon);
                        helpers.setFieldValue('homeSegmentId', segIds[0] || null);
                        helpers.setFieldValue('homeSubSegmentId', subIds[0] || null);

                        helpers.setFieldValue('workSubSegmentId', subIds[1] || null);
                        helpers.setFieldValue('workSegmentId', segIds[1] || null);
                        helpers.setFieldValue('schoolSubSegmentId', subIds[2] || null);
                        helpers.setFieldValue('schoolSegmentId', segIds[2] || null);
                        helpers.setFieldValue('imagePath', avatar);
                        
                        setStep((s) => s + 1);
                        setInferStep((s) => s + 1);
                    } else {
                        setStep((s) => s + 1);
                        setInferStep((s) => s + 1);
                        //helpers.setTouched({});
                    }
                    //These fields added here due to update reasons. If these fields are in the above section the state is not updated. Due to setFieldValue being async.

                    setIsLoading(false);
                }}
            >
                <div>
                    <div className='stepper mb-4'>
                        <Stepper
                            steps={[
                                { title: `${getStepHeader(0)}` },
                                { title: `${getStepHeader(1)}` },
                                { title: `${getStepHeader(2)}` },
                                { title: `${getStepHeader(3)}` },
                                { title: `${getStepHeader(4)}` },
                                { title: `${getStepHeader(5)}` },
                            ]}
                            activeStep={inferStep}
                            circleTop={0}
                            lineMarginOffset={8}
                            activeColor={'#98cc74'}
                            completeColor={'#98cc74'}
                            completeBarColor={'#98cc74'}
                            titleFontSize={19}
                        />
                    </div>
                    <Card>
                        <Card.Header>
                            <h3>{getStepHeader(inferStep)}</h3>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                {currentChild}
                                {error && (
                                    <Alert variant='danger' className='error-alert'>
                                        {error.message}
                                    </Alert>
                                )}
                                <div className='text-center'>
                                    {(step > 0 && userType === USER_TYPES.RESIDENTIAL) ||
                  (!isLastStep() &&
                    step > 0 &&
                    userType !== USER_TYPES.RESIDENTIAL) ? (
                                            <Button
                                                className='float-left mt-3'
                                                size='lg'
                                                variant='outline-primary'
                                                onClick={() => {
                                                    handleBackButton();
                                                }}
                                            >
                      Back
                                            </Button>
                                        ) : null}

                                    {isLastStep() &&
                  userType !== USER_TYPES.RESIDENTIAL ? null : (
                                            <Button
                                                className='float-right mt-3 d-flex align-items-center'
                                                size='lg'
                                                type='submit'
                                                disabled={isLoading || isCommunitySelected()}
                                            >
                                                {isLoading && (
                                                    <span
                                                        className='spinner-border spinner-border-sm'
                                                        role='status'
                                                        aria-hidden='true'
                                                    ></span>
                                                )}
                                                {(isLastStep() && userType === USER_TYPES.RESIDENTIAL) ||
                      (userType !== USER_TYPES.RESIDENTIAL && step === 6)
                                                    ? submitOrSubmitting()
                                                    : nextOrLoading()}
                                            </Button>
                                        )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Formik>
        );
    }
}
export default RegisterPageContent;
