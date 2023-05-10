import {Alert, Button, Card} from 'react-bootstrap';
import {Form as BForm} from 'react-bootstrap';
import { ErrorMessage, Field, Form, Formik, FormikConfig, FormikValues } from 'formik';
import React, { useContext, useState } from 'react';
import SimpleMap from '../map/SimpleMap';
import { capitalizeFirstLetterEachWord, capitalizeString, refactorStateArray, storeTokenExpiryInLocalStorage, storeUserAndTokenInLocalStorage, wipeLocalStorage } from 'src/lib/utilityFunctions';
import { findSegmentByName, findSubsegmentsBySegmentId } from 'src/lib/api/segmentRoutes';
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
interface RegisterPageContentProps {
}

export const RegisterPageContent: React.FC<RegisterPageContentProps> = ({}) => {
    const {
        setToken,
        setUser,
    } = useContext(UserProfileContext);
    const [markers, sendData]:any = useState({home: {lat: null, lon: null},work: {lat: null, lon: null},school: {lat: null, lon: null}});
    const [isLoading, setIsLoading] = useState(false);
    const [map, showMap] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [segment, setSegment] = useState<ISegment>();
    const [subSegments, setSubSegments] = useState<ISubSegment[]>();
    const [segment2, setSegment2] = useState<ISegment>();
    const [subSegments2, setSubSegments2] = useState<ISubSegment[]>();
    const [subIds, setSubIds] = useState<any[]>([]);
    const [segIds, setSegIds] = useState<any[]>([]);
    const [avatar, setAvatar] = useState(undefined);
    const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
    //These two useState vars set if the values should be transferred from the one to the other before the form submits.
    //Used with the radio buttons.
    const [workTransfer, transferHomeToWork] = useState(false);
    const [schoolTransfer, transferWorkToSchool] = useState(false);
    const displaySubSegList = (id: number) => {
            if(subSegments && subSegments[0].segId === id){
                return (subSegments?.map(subSeg=>(<option key={subSeg.id} value={subSeg.id}>{capitalizeFirstLetterEachWord(subSeg.name)}</option>)));
            }
            if(subSegments2 && subSegments2[0].segId === id){
                return (subSegments2?.map(subSeg=>(<option key={subSeg.id} value={subSeg.id}>{capitalizeFirstLetterEachWord(subSeg.name)}</option>)));
            }  
    }
return (
    <div className='register-page-content'>
            <FormikStepper initialValues={{
                email: '',
                password: '',
                confirmPassword: '',
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
                homeSegmentId: undefined,
                workSegmentId: undefined,
                schoolSegmentId: undefined,
                homeSubSegmentId: undefined,
                workSubSegmentId: undefined,
                schoolSubSegmentId: undefined,
                
            }}  markers={markers}
                setSegment={setSegment}
                setSegment2={setSegment2}
                setSubSegments={setSubSegments}
                setSubSegments2={setSubSegments2}
                setSubIds={setSubIds}
                setSegIds={setSegIds}
                segIds={segIds}
                showMap={showMap}
                subIds={subIds}
                workTransfer={workTransfer}
                schoolTransfer={schoolTransfer}
                avatar={avatar}
                onSubmit={async(values,helpers)=>{
                    // const {email, password, confirmPassword} = values;
                    try {
                        console.log(values);
                        setIsLoading(true);
                        const { token, user } = await postRegisterUser(values, segmentRequests, avatar);
                        storeUserAndTokenInLocalStorage(token, user);
                        storeTokenExpiryInLocalStorage();
                        setToken(token);
                        setUser(user);
                        // await postAvatarImage(selectedFile, token);
                        } catch (error) {
                            console.log(error);
                            wipeLocalStorage();
                        }finally{
                            setIsLoading(false);
                        }
                }
            }
            >
                <FormikStep validationSchema={Yup.object().shape({
                    password: Yup.string().min(8, 'Password is too short, 8 characters minimum'),
                    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
                    email: Yup.string().email('Invalid email')
                    .test('Unique Email','Email already in use', 
                        function(value){return new Promise((resolve, reject) => {
                            getUserWithEmail(value)
                            .then(res => {res === 200 ? resolve(false) : resolve(true)})
                        })})
                    })}>
                    <BForm.Group>
                        <BForm.Label>Email address</BForm.Label> 
                        <Field required name="email" type="email" as={BForm.Control}/>
                        <ErrorMessage name="email">{msg => <p className="text-danger">{msg}<br></br></p>}</ErrorMessage>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Password</BForm.Label>
                        <Field required name="password" type="password" as={BForm.Control}/>
                        <ErrorMessage name="password">{msg => <p className="text-danger">{msg}<br></br></p>}</ErrorMessage>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Confirm Password</BForm.Label>
                        <Field required name="confirmPassword" type="password" as={BForm.Control}/>
                        <ErrorMessage name="confirmPassword">{msg => <p className="text-danger">{msg}<br></br></p>}</ErrorMessage>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>First Name</BForm.Label>
                        <Field required name="fname" type="text" as={BForm.Control}/>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Last Name</BForm.Label>
                        <Field required name="lname" type="text" as={BForm.Control}/>
                    </BForm.Group>
                    <BForm.Group>
                        <Field name="imagePath" type="file" fileContainerStyle={{backgroundColor: "#F8F9FA"}}
                        withPreview={true} onChange={(pic:any)=>setAvatar(pic[0])} imgExtension={['.jpg','.jpeg','.png','.webp']} 
                        buttonText="Select Profile Picture" maxFileSize={2097152} label={"Max file size 2mb, \n jpg, jpeg, png, webp"} 
                        singleImage={true} as={ImageUploader}/>
                        {/* <ImageUploader name="imagePath" fileContainerStyle={{backgroundColor: "#F8F9FA"}}withPreview={true} onChange={pic=>console.log(pic)} imgExtension={['.jpg','.jpeg','.png','.webp']} buttonText="Select Idea Image" maxFileSize={10485760} label={"Max file size 10mb, \n jpg, jpeg, png, webp"} singleImage={true}/> */}
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Street Name</BForm.Label>
                        <Field required name="address.streetAddress" type="text" as={BForm.Control}/>
                    </BForm.Group>
                    {/* <BForm.Group>
                        <BForm.Label>Profile Image Upload</BForm.Label>
                        <BForm.Control type="file" name="image" onChange={(e:any)=> setSelectedFile(e.target.files[0])}/>
                    </BForm.Group> */}
                    <BForm.Group>
                        <BForm.Label>ZIP / Postal Code</BForm.Label>
                        <Field name="address.postalCode" type="text" as={BForm.Control}/>
                    </BForm.Group>             
                    
                </FormikStep>

                <FormikStep>
                    <Card.Title>Show us on the map where your home is</Card.Title>
                    <Card.Subtitle className="text-muted mb-3">We use this information to find your community!</Card.Subtitle>
                    <SimpleMap iconName={'home'} sendData={(markers:any)=>sendData(markers) } />
                </FormikStep>

                <FormikStep >
                    <BForm.Group>
                        <BForm.Label>Select your home municipality</BForm.Label>
                        <BForm.Control name="homeSegmentId" as="select" onChange={(e)=>{
                            refactorStateArray(segIds, 0, parseInt(e.target.value), setSegIds);
                            refactorStateArray(subIds, 0, null, setSubIds);
                            // refactorSegIds(0,parseInt(e.target.value));
                            // refactorSubIds(0, null);
                            }}>
                            {segment && <option value={segment?.segId}>{capitalizeFirstLetterEachWord(segment?.name)}</option>}
                            {segment2 && <option value={segment2?.segId}>{capitalizeFirstLetterEachWord(segment2?.name)}</option>}
                        </BForm.Control>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Select your Neighbourhood (optional)</BForm.Label>
                        <BForm.Control name="homeSubName" as="select" onChange={(e)=>{refactorStateArray(subIds, 0,parseInt(e.target.value), setSubIds)}}>
                            <option hidden></option>
                            {displaySubSegList(segIds[0])}
                        </BForm.Control>
                        <p>Don't see your Municipality?<Button onClick={()=>{setShowModal(true)}}variant="link text-primary">Click here</Button></p>
                    </BForm.Group>
                    <RequestSegmentModal showModal={showModal} setShowModal={setShowModal} index={0} setSegmentRequests={setSegmentRequests} segmentRequests={segmentRequests} />
                </FormikStep>

                <FormikStep >
                    {!map 
                    ?   <div>
                        <Card.Title>Do you work in a different municipality or neighbourhood? 
                        <div className="float-right">
                        <BForm.Check inline label="yes" name="group1" type="radio" id="inline-checkbox" onClick={()=>{showMap(true); transferHomeToWork(false)}}/>
                        <BForm.Check inline label="no" name="group1" type="radio" id="inline-checkbox" onClick={()=>{transferHomeToWork(true)}}/>
                        </div>
                        </Card.Title>
                        </div>
                    :
                    <><Card.Title>Show us on the map where your work is (optional)</Card.Title>
                    <SimpleMap iconName={'work'} sendData={(markers:any)=>sendData(markers) } /></>}
                </FormikStep>

                <FormikStep>
                    <BForm.Group>
                        <BForm.Label>Your Work Municipality is</BForm.Label>
                        <BForm.Control name="workSegmentId" as="select" onChange={(e)=>{
                            refactorStateArray(segIds, 1, parseInt(e.target.value), setSegIds);
                            refactorStateArray(subIds, 1, null, setSubIds);
                            }}>
                            {segment && <option value={segment?.segId}>{capitalizeFirstLetterEachWord(segment?.name)}</option>}
                            {segment2 && <option value={segment2?.segId}>{capitalizeFirstLetterEachWord(segment2?.name)}</option>}
                        </BForm.Control>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Select your Neighbourhood</BForm.Label>
                        <BForm.Control name="workSubName" as="select" onChange={(e)=>{refactorStateArray(subIds, 1,parseInt(e.target.value), setSubIds)}}>
                            <option hidden></option>
                            {displaySubSegList(segIds[1])}
                        </BForm.Control>
                        <p>Don't see your Municipality?<Button onClick={()=>{setShowModal(true)}}variant="link text-primary">Click here</Button></p>
                    </BForm.Group>
                    <RequestSegmentModal showModal={showModal} setShowModal={setShowModal} index={1} setSegmentRequests={setSegmentRequests} segmentRequests={segmentRequests}/>
                </FormikStep>

                <FormikStep >
                    {!map 
                    ?   <div>
                        <Card.Title className="mb-4">Do you study in a different municipality or neighbourhood? 
                        <div className="float-right">
                        <BForm.Check inline label="yes" name="group1" type="radio" id="inline-checkbox" onClick={()=>{showMap(true); transferWorkToSchool(false)}}/>
                        <BForm.Check inline label="no" name="group1" type="radio" id="inline-checkbox" onClick={()=>{transferWorkToSchool(true)}}/>
                        </div>
                        </Card.Title>
                        </div>
                    :
                    <><Card.Title>Show us on the map where your school is (optional)</Card.Title>
                    <SimpleMap iconName={'school'} sendData={(markers:any)=>sendData(markers) } /></>}
                </FormikStep>

                <FormikStep>
                    <BForm.Group>   
                        <BForm.Label>Your School Municipality is</BForm.Label>
                        <BForm.Control name="schoolSegmentId" as="select" onChange={(e)=>{
                            refactorStateArray(segIds, 2, parseInt(e.target.value), setSegIds);
                            refactorStateArray(subIds, 2, null, setSubIds);
                            }}>
                            {segment && <option value={segment?.segId}>{segment?.name}</option>}
                            {segment2 && <option value={segment2?.segId}>{segment2?.name}</option>}
                        </BForm.Control>
                    </BForm.Group>
                    <BForm.Group>
                        <BForm.Label>Select your Neighbourhood</BForm.Label>
                        <BForm.Control name="schoolSubName" as="select" onChange={(e)=>{refactorStateArray(subIds, 2,parseInt(e.target.value), setSubIds)}}>
                            <option hidden></option>
                            {displaySubSegList(segIds[2])}
                        </BForm.Control>
                        <p>Don't see your Municipality?<Button onClick={()=>{setShowModal(true)}}variant="link text-primary">Click here</Button></p>
                    </BForm.Group>
                    <RequestSegmentModal showModal={showModal} setShowModal={setShowModal} index={2} setSegmentRequests={setSegmentRequests} segmentRequests={segmentRequests}/>                   
                </FormikStep>

                <FormikStep>
                        <p>It takes a lot to bring an idea to form, and as a user on the MLC Community Discussion Platform the following agreements will enable the interactions that turn ideas into reality:</p>
                        <p><strong> 1. Ideas, comments and people are treated with respect;</strong></p>
                        <p><strong> 2. Commenting on an idea is designed to flesh it out in more detail to get as much constructive feedback and viewpoints from the community.</strong></p>
                        <p>  The following works when commenting:</p>
                        <p className="ml-4"> a. Emphasizes what you see works about the idea and what is the value that it brings;</p>
                        <p className="ml-4"> b. Identify areas that don’t work and suggest how they can be improved;</p>
                        <p className="ml-4"> c. Opinions and judgments don’t add value to the conversation; and</p>
                        <p className="ml-4"> d. Share about where else can this idea go or what new angle can be added to make even better for the whole community.</p>
                        <p><strong> 3. Your ideas and experience is valuable and we want to hear from everyone how to make this an actual project that works in the community.</strong></p>
                        <p>By clicking next you verify that MyLivingCity has the right to store your personal information.</p>
                </FormikStep>

                <FormikStep>
                        <h3>To complete your registration click submit</h3>
                </FormikStep>

            </FormikStepper>

    </div>
    
);
}



export interface FormikStepProps extends Pick<FormikConfig<IRegisterInput>, 'children' | 'validationSchema' > {
    // setSegmentId?: any;
}

export function FormikStep({ children }: FormikStepProps) {
    return <>{children}</>;
}
export interface FormikStepperProps extends FormikConfig<IRegisterInput> {
    initialValues: IRegisterInput;
    markers: any;
    setSegment: any;
    setSegment2: any;
    setSubSegments: any;
    setSubSegments2: any;
    showMap: any;
    setSubIds: any;
    setSegIds: any;
    segIds: any;
    subIds: any;
    workTransfer: boolean;
    schoolTransfer: boolean;
    avatar: any;
}
export function FormikStepper({ children, markers, showMap, subIds, segIds, schoolTransfer, workTransfer,setSubIds, setSegIds, avatar, ...props }: FormikStepperProps) {
    const childrenArray = React.Children.toArray(children) as React.ReactElement<FormikStepProps>[];
    const [step, setStep] = useState(0);
    const [inferStep, setInferStep]=useState(0);
    const currentChild = childrenArray[step] as React.ReactElement<FormikStepProps>;
    const [isLoading, setIsLoading] = useState(false);
    // const [segIds, setSegIds] = useState<number[]>([]);
    const [error, setError] = useState<IFetchError | null>(null);
    //Functions for handling button states.
    const isLastStep = () => { return step === childrenArray.length - 1 };
    const nextOrLoading = () => { return isLoading ? 'Loading...' : 'Next' };
    const submitOrSubmitting = () => { return isLoading ? 'Submitting...':'Submit' };
    const isHomeMarkerSet = () => { return (step===1 && markers.home.lat === null) };
    const getStepHeader = (step: number) => {
        switch(step) {
            case 0:
                return "Create Account"
            case 1:
                return "Home Location"
            case 2:
                return "Work Location"
            case 3:
                return "School Location"
            case 4:
                return "Privacy Policy"
            case 5:
                return "Submit"
            default:
                return ""
        }
    }

    const isWorkSubIdSet = () => { 
        if(subIds[1]) return subIds[1] 
        else return subIds[0];
    }
    //This handles the step and inferStep state variables.
    //Step keeps track of the current child to display.
    //InferStep keeps track of the step icons.
    //Since some steps will have multiple "steps" the infer step decreases dependant on if map selections have occured.
    const handleBackButton = () => {
        if(step % 2 !== 0){
            setInferStep(s=>s-1);
        }
        if(isLastStep()) setInferStep(s=>s-1);
        if(step===7 && markers.school.lat === null){
            setStep(s=>s-2);
        }else if(step === 5 && markers.work.lat === null){
            setStep(s=>s-2);
        }else{
            setStep(s=>s-1);
        }
    }
    //This function calls the google api to receive data on the map location
    //The data is then searched in the back end for a matching segment
    //Then the back end is searched for all the sub-segments of that matching segment.
    async function setSegData(index: number){
        let googleQuery:any;
        let testMode = true;
        try{
            //PLACEHOLDER for GOOGLE API query
            setError(null);
            setIsLoading(true);
            switch(index){
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
            if(googleQuery.city2){
                const seg2 = await findSegmentByName({segName:googleQuery.city2, province:googleQuery.province, country:googleQuery.country });
                if(seg2){
                    console.log('here');
                    props.setSegment2(seg2);
                    refactorStateArray(segIds, index, seg2.segId, setSegIds);
                    
                    //refactorSegIds(index,seg2.segId);
                    const sub2 = await findSubsegmentsBySegmentId(seg2.segId);
                    props.setSubSegments2(sub2);
                }else{
                    props.setSegment2(null);
                    props.setSubSegments2(null);
                }
            }
            if(googleQuery.city){
                const seg = await findSegmentByName({segName:googleQuery.city, province:googleQuery.province, country:googleQuery.country });
                if(seg){
                    props.setSegment(seg);
                    refactorStateArray(segIds, index, seg.segId, setSegIds);
                    //refactorSegIds(index,seg.segId);
                    const sub = await findSubsegmentsBySegmentId(seg.segId);
                    props.setSubSegments(sub);
                }else{
                    props.setSegment(null);
                    props.setSubSegments(null);
                }
            }
            setStep(s=>s+1);
        }catch(err){
            console.log(err);
            //placeHolder
            //Need to do better error handling here.
            //setError(new Error(err.response.data));
        }
        
    }
return(
    <Formik
    {...props}
    validationSchema={currentChild?.props.validationSchema}
    onSubmit={async(values, helpers)=>{

        if(isLastStep()){
            setIsLoading(true);
            await new Promise(r => setTimeout(r, 2000));
            await props.onSubmit(values, helpers);
            
        }else if(step=== 1){
            const seg = await setSegData(0);
            showMap(false);
        }else if(step=== 3){
            
            if(markers.work.lat === null){
                setStep(s=>s+2);
                setInferStep(s=>s+1);
                if(workTransfer){
                    refactorStateArray(segIds, 1, segIds[0], setSegIds);
                    refactorStateArray(subIds, 1, subIds[0], setSubIds);
                    //refactorSegIds(1, segIds[0]);
                    //refactorSubIds(1, subIds[0]);
                }
            }else{
                const seg = await setSegData(1);
                //setStep(s=>s+1);
            }
            showMap(false);
        }else if(step=== 5){
            console.log(segIds);
            if(markers.school.lat === null){
                setStep(s=>s+2);
                setInferStep(s=>s+1);
                if(schoolTransfer){
                    refactorStateArray(segIds, 2, segIds[1] || segIds[0], setSegIds);
                    refactorStateArray(subIds, 2, subIds[1] || subIds[0], setSubIds);
                    //refactorSegIds(2, segIds[1] || segIds[0]);
                    //refactorSubIds(2, subIds[1] || subIds[0])
                }
            }else{
                const seg = await setSegData(2);
                //setStep(s=>s+1);
            }
            setIsLoading(false);
        }else if(step===7){
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
            setStep(s=>s+1);
            setInferStep(s=>s+1);
        }else{
            setStep(s=>s+1);
            setInferStep(s=>s+1);
            //helpers.setTouched({});
        }
        //These fields added here due to update reasons. If these fields are in the above section the state is not updated. Due to setFieldValue being async.

        setIsLoading(false);
    }}
    >
    <div>
    <div className="stepper mb-4">
    <Stepper steps={ [
        {title: 'Create Account'}, 
        {title: 'Home Location'}, 
        {title: 'Work Location'},
        {title: 'School Location'},
        {title: 'Privacy Policy'},
        {title: 'Submit'}] } 
        activeStep={ inferStep }
        circleTop={0}
        lineMarginOffset={8}
        activeColor={'#98cc74'}
        completeColor={"#98cc74"}
        completeBarColor={"#98cc74"}
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
        {error && (<Alert variant='danger' className="error-alert">{ error.message }</Alert>)}
        <div className="text-center">
        {step > 0 ? <Button className="float-left mt-3" size="lg" variant="outline-primary" onClick={()=>{handleBackButton()}}>Back</Button> : null}
        <Button className="float-right mt-3 d-flex align-items-center" size="lg" type="submit" disabled={isLoading||isHomeMarkerSet()}>
        {isLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
        {isLastStep() ? submitOrSubmitting() : nextOrLoading()}
        </Button>
        </div>

    </Form>
    </Card.Body>
    </Card>
    </div>
    </Formik>
)
}
export default RegisterPageContent