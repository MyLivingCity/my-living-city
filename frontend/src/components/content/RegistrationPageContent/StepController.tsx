import { SetStateAction, useState } from 'react';
import { ROUTES, TEXT_INPUT_LIMIT, USER_TYPES } from 'src/lib/constants';
import PricingPlanSelector from '../../partials/PricingPlanSelector';
import { ErrorMessage,
    FieldHookConfig,
    FieldInputProps,
    Form,
    Formik,
    FormikConfig,
    Field,
    FormikHelpers,
    FormikValues} from 'formik';
import { FormikStep} from '../RegisterPageContent4';
import * as Yup from 'yup';
import { Form as BForm, Button, Card } from 'react-bootstrap';
import { getUserWithEmail, postRegisterUser } from 'src/lib/api/userRoutes';
import ImageUploader from 'react-images-upload';
import Header from './Header';
import { RequestSegmentModal } from 'src/components/partials/RequestSegmentModal';
import { capitalizeFirstLetterEachWord, refactorStateArray, wipeLocalStorage } from 'src/lib/utilityFunctions';
import { ISegment, ISubSegment } from 'src/lib/types/data/segment.type';
import { IFetchError } from 'src/lib/types/types';
import { CheckBoxItem } from '../RegisterPageContentReach';
import { findSubsegmentsBySegmentId, getAllSegments, getAllSegmentsWithSuperSegId } from 'src/lib/api/segmentRoutes';
import { IRegisterInput } from 'src/lib/types/input/register.input';

interface RegisterPageContentProps {}
type Props = FieldHookConfig<string> & {
  field: FieldInputProps<string>;
};

function StepController(){
    const [error, setError] = useState<IFetchError | null>(null);
    async function setSubsegData(segmentId: number) {
        /* Fetch subsegments and use them to populate the "neighborhood" dropdown*/
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
    const [step, setStep] = useState<Number>(1);
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
    const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
    const [communityType, setCommunityType] = useState<string | null>(null);
    
    const [avatar, setAvatar] = useState(undefined);

    const [workTransfer, transferHomeToWork] = useState(false);
    const [schoolTransfer, transferWorkToSchool] = useState(false);
    const displaySubSegList = (id: number) => {
        if (subSegments && subSegments[0].segId === id) {
            return subSegments?.map((subSeg) => (
                <option key={subSeg.id} value={subSeg.id}>
                    {capitalizeFirstLetterEachWord(subSeg.name)}
                </option>
            ));
        }
        if (subSegments2 && subSegments2[0].segId === id) {
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

    return(
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
                step ={step}
                setStep = {setStep}
                userType={userType}
                setUserType={setUserType}
                reachSegmentIds={selectedSegId}
                segments =  {segments}
                refactorStateArray = {refactorStateArray}
                setSubsegData = {setSubsegData}
                displaySubSegList = {displaySubSegList}
                communityType = {communityType}
                setCommunityType = {setCommunityType}
                setShowModal = {setShowModal}
                showModal = {showModal}
                segmentRequests = {segmentRequests}
                setSegmentRequests = {setSegmentRequests}
                setSegments={setSegments}
                setSegData={setSegData}
                onSubmit={async (values, helpers) => {
                    const lastStep = userType === USER_TYPES.RESIDENTIAL ? 4 : 6;
                    if (Number(step) < lastStep) {
                        setStep(Number(step) + 1);
                        helpers.setSubmitting(false);
                    } else {
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
                    }
                }}
            >
            </FormikStepper>
        </>
    );
}

export default StepController;



function buisnessCommunityRegistration(): JSX.Element {
    return(
        <>
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
        </>
    );
};

function notBuisnessNorCommunity(): JSX.Element{
    return(
        <>
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
        </>
    );
};

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
    displaySubSegList: any; 
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
    communityType: string| null;
    step: any;
    setStep: any;
    setAvatar: any;
    setCommunityType: React.Dispatch<React.SetStateAction<string | null>>;
    setSegData: (index: number) => Promise<void>;
    setSubsegData: (segmentId: number) => Promise<void>;
  }

export function FormikStepper({children,
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
    segments, 
    setSegment, 
    refactorStateArray, 
    displaySubSegList, 
    communityType,
    setShowModal,
    showModal,
    segmentRequests,
    setStep,
    setSegmentRequests,
    setCommunityType,
    setSegData,   
    setSubsegData,
    ...props
}: FormikStepperProps){
    
    return(
        <>  
            <Formik {...props}>
                <>
                    <Header step={step} userType={userType}/>
                    {step == 1 && (
                        <>
                            <FormikStep>
                                <h3>Please select your account type:</h3>
                                <BForm.Group className='m-4'>
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
                        <EmailPasswordForm userType={userType} setAvatar={setAvatar}/>
                    )}

                    {step == 3 && (
                        <CommunityLocation
                            segments =  {segments}
                            setSegment = {setSegment}
                            refactorStateArray = {refactorStateArray}
                            segIds = {segIds}
                            setSegIds = {setSegIds}
                            setSubsegData = {setSubsegData}
                            displaySubSegList = {displaySubSegList}
                            communityType = {communityType}
                            setCommunityType = {setCommunityType}
                            subIds = {subIds}
                            setSubIds = {setSubIds}
                            setShowModal = {setShowModal}
                            showModal = {showModal}
                            segmentRequests = {segmentRequests}
                            setSegmentRequests = {setSegmentRequests}
                        />
                    )}
                    <NextAndBackButton userType = {userType} setStep = {setStep} step = {step} onSubmit={props.onSubmit}/>
                </>
            </Formik>
        </>
    );
};


export function EmailPasswordForm({ userType, setAvatar }: { userType: any; setAvatar: any; }){
    return(
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
                                return new Promise((resolve, reject) => {
                                    getUserWithEmail(value).then((res) => {
                                        res === 200 ? resolve(false) : resolve(true);
                                    });
                                });
                            }
                        ),
                })}>
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

                {userType == USER_TYPES.BUSINESS || userType == USER_TYPES.COMMUNITY && (
                    buisnessCommunityRegistration()
                )}

                {userType != USER_TYPES.BUSINESS && userType != USER_TYPES.COMMUNITY && (
                    notBuisnessNorCommunity()
                )}


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
                    {}
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
        </>
    );
};


export function NextAndBackButton({ setStep, step, userType, onSubmit }: { setStep: any; step: any; userType: any; onSubmit: any;}){
    const lastStep = userType === USER_TYPES.RESIDENTIAL ? 4 : 6;

    return(      
        <BForm.Group className='d-flex justify-content-between'>
            {step > 1 && (
                <Button
                    type='button'
                    variant='secondary'
                    onClick={() => setStep(step - 1)}>
                    Back
                </Button>
            )}
            {step < lastStep ? (
                <Button
                    type='button'
                    variant='primary'
                    onClick={() => {onSubmit();}}>
                    Next
                </Button>
            ) : (
                <Button type='submit' variant='success' onClick={onSubmit}>
                    Submit
                </Button>
            )}
        </BForm.Group>
    );
};


type CommunityLocationInter = {
    segments: any;
    setSegment: any; 
    refactorStateArray: any;
    segIds: any;
    setSegIds: any;
    setSubsegData: any;
    displaySubSegList: any; 
    communityType: any;
    setCommunityType: any;
    subIds: any;
    setSubIds: any;
    setShowModal: any;
    showModal: any;
    segmentRequests: any;
    setSegmentRequests: any;
}

export function CommunityLocation({
    segments, 
    setSegment, 
    refactorStateArray, 
    segIds, 
    setSegIds, 
    setSubsegData, 
    displaySubSegList, 
    communityType,
    setCommunityType,
    subIds,
    setSubIds,
    setShowModal,
    showModal,
    segmentRequests,
    setSegmentRequests
}: CommunityLocationInter){
    return(
        <>
            <FormikStep>
                <BForm.Control
                    name='homeSegmentId'
                    as='select'
                    className='mb-3'
                    onChange={(e) => {
                        const selectedSegment = segments.find(
                            (seg: { segId: number; }) => seg.segId === parseInt(e.target.value)
                        );
                        if (selectedSegment) {
                            setSegment(selectedSegment);
                            refactorStateArray(segIds, 0, selectedSegment.segId, setSegIds);
                            refactorStateArray(subIds, 0, null, setSubIds);
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
        </>
    );
};