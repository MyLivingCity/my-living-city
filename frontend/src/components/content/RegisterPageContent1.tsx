import React, { useContext, useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import {
  Formik,
  FormikConfig,
  FormikValues,
  Field,
} from "formik";
import { UserProfileContext } from "../../contexts/UserProfile.Context";
import { IFetchError } from "../../lib/types/types";
import {
  capitalizeString,
} from "../../lib/utilityFunctions";
import { IUserRole } from "../../lib/types/data/userRole.type";
import SimpleMap from "../map/SimpleMap";
import { ISegment, ISubSegment } from "src/lib/types/data/segment.type";
//import SelectSegmentPage from 'src/pages/SelectSegmentPage';
import { TEXT_INPUT_LIMIT } from "src/lib/constants";

interface SegmentsDropdownProps {
  segments: ISegment | undefined;
  subSegments: ISubSegment | undefined;
  name: string;
}
interface IUserSegment {
  userId: string;
  homeSegmentId?: number;
  workSegmentId?: number;
  schoolSegmentId?: number;
  homeSubSegmentId?: number;
  workSubSegmentId?: number;
  schoolSubSegmentId?: number;
}

interface RegisterPageContentProps {
  userRoles: IUserRole[] | undefined;
}
const RegisterPageContent: React.FC<RegisterPageContentProps> = ({
  userRoles,
}) => {
  const {
    setToken,
    setUser,
    //user
  } = useContext(UserProfileContext);
  // let [show, setShow] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IFetchError | null>(null);
  const [selectedFile, setSelectedFile] = useState(undefined);
  const [markers, sendData]: any = useState({
    home: { lat: null, lon: null },
    work: { lat: null, lon: null },
    school: { lat: null, lon: null },
  });
  // const [nextStates, setNextStates] = useState([false, false, false, false, false, false,false,false]);
  // const [segmentList, setSegmentList] = useState();
  // const [subSegmentList, setSubSegmentList] = useState();
  // let queryResult: any;
  // const nextHandler = async(showVal: number)=>{
  //   // setShowMap(false);
  //   try{
  //     if(showVal===1) console.log(showVal);
  //     if(showVal===3) console.log(showVal);
  //     if(showVal===5) console.log(showVal);
  //     const segments = await findSegmentByName({segName:'victoria', province:'british columbia', country:'canada' });
  //     const subSegs = await findSubsegmentsBySegmentId(segments.segId);
  //     setSegmentList(segments);
  //     setSubSegmentList(subSegs);
  //     setShow(show=show+1);
  //   }catch(err){
  //     console.log(err);
  //   }
  // }

  //Buttons for page navigation
  // const next = <Button className="float-right mt-2" size="lg" onClick={()=>{setShow(show=show+1)}} disabled={nextStates[show-1]}>Next</Button>
  // const prev = <Button className="float-left mt-2" size="lg" variant="outline-primary"onClick={()=>{setShow(show=show-1)}}>Previous</Button>;
  // const register = <Button type="submit" size="lg" onClick={()=>{customFormikSet();
  //     submitHandler(formik.values)}} className="float-right mt-1">Register!</Button>;

  // const SegmentsDropdown: React.FC<SegmentsDropdownProps> = ({segments, name, subSegments}) => {
  //   const [show, setShowModal] = useState(false);
  //   const [homeSeg, setHomeSeg] = useState<number>();
  //   const [workSeg, setWorkSeg] = useState<number>();
  //   const [schoolSeg, setSchoolSeg] = useState<number>();
  //   const [homeSub, setHomeSub] = useState<number>();
  //   const [workSub, setWorkSub] = useState<number>();
  //   const [schoolSub, setSchoolSub] = useState<number>();
  //   // useEffect(() => {
  //   //   if(name==="home") setHomeSeg(segments!.segId);
  //   //   if(name==="work") setWorkSeg(segments!.segId);
  //   //   if(name==="school") setSchoolSeg(segments!.segId);
  //   // });
  //   // console.log(userSegForm.values);
  //     return (
  //       <>
  //     {name==="home" &&
  //     <>
  //     <Form.Group controlId="homeSegment">
  //       <Form.Label>Your home Municipality is</Form.Label>
  //       <Form.Control readOnly name="homeSegmentId" defaultValue={capitalizeString('testReplace')}>
  //       </Form.Control>
  //     </Form.Group>
  //   <Form.Group controlId="homeSubSegment">
  //       <Form.Label>Select your Neighbourhood</Form.Label>
  //       <Form.Control
  //         as="select"
  //         name="sub-segment"
  //         onChange={(e)=>{setHomeSub(parseInt(e.target.value))}}
  //       >
  //       </Form.Control>
  //       <Button onClick={()=>{setShowModal(true)}}variant="link">Don't see your Municipality or Neighbourhood?
  //       Click here to request it in our system!</Button>
  //     </Form.Group>
  //     </>
  //     }

  // {name === "work" &&
  //   <>
  //     <Form.Group controlId="workSegment">
  //       <Form.Label>Your home Municipality is</Form.Label>
  //       <Form.Control readOnly name="workSegmentId" defaultValue={capitalizeString(segments!.name)}>
  //       </Form.Control>
  //     </Form.Group>
  // <Form.Group controlId="workSubSegment">
  //     <Form.Label>Select your Neighbourhood</Form.Label>
  //     <Form.Control
  //       as="select"
  //       name="sub-segment"
  //       onChange={(e)=>{setWorkSub(parseInt(e.target.value))}}
  //     >
  //     </Form.Control>
  //     <Button onClick={()=>{setShow(true)}}variant="link">Don't see your Municipality or Neighbourhood?
  //     Click here to request it in our system!</Button>
  //   </Form.Group>
  //   </>
  // }

  //   {name === "school" &&
  //     <>
  //     <Form.Group controlId="schoolSegment">
  //       <Form.Label>Your school Municipality is</Form.Label>
  //       <Form.Control readOnly name="schoolSegmentId" defaultValue={capitalizeString(segments!.name)}>
  //       </Form.Control>
  //     </Form.Group>
  //   <Form.Group controlId="schoolSubSegment">
  //       <Form.Label>Select your Neighbourhood</Form.Label>
  //       <Form.Control
  //         as="select"
  //         name="sub-segment"
  //         onChange={(e)=>{setSchoolSub(parseInt(e.target.value))}}
  //       >
  //       </Form.Control>
  //       <Button onClick={()=>{setShow(true)}}variant="link">Don't see your Municipality or Neighbourhood?
  //       Click here to request it in our system!</Button>
  //     </Form.Group>
  //     </>
  //   }
  //   <Modal show={show} onHide={()=>{setShow(false)}}>
  //     <Modal.Header closeButton>
  //         <Modal.Title>Request your community!</Modal.Title>
  //     </Modal.Header>
  //     <Modal.Body>
  //     <Form>
  //     <Form.Group controlId="country">
  //         <Form.Label>Country</Form.Label>
  //         <Form.Control required type="text" placeholder="Enter country" />
  //     </Form.Group>
  //     <Form.Group controlId="province">
  //         <Form.Label>Province/State</Form.Label>
  //         <Form.Control required type="text" placeholder="Enter province" />
  //     </Form.Group>
  //     <Form.Group controlId="segment">
  //         <Form.Label>Municipality or place name</Form.Label>
  //         <Form.Control type="text" placeholder="Enter municipality" />
  //     </Form.Group>
  //     <Form.Group controlId="subSegment">
  //         <Form.Label>Neighbourhood</Form.Label>
  //         <Form.Control type="text" placeholder="Enter neighbourhood" />
  //     </Form.Group>
  //     <Button variant="primary" type="submit">Submit</Button>
  //     </Form>
  //     </Modal.Body>
  //   </Modal>
  //   </>
  //   );
  // };
  interface NextMapProps {
    name: string;
    showMap: boolean;
  }
  const NextMap: React.FC<NextMapProps> = ({ name, showMap }) => {
    const [map, setShowMap] = useState(showMap);
    let title: any;
    if (name === "home") {
      title = (
        <>
          <Card.Title>Show us on the map where your {name} is</Card.Title>
          <Card.Subtitle className="text-muted mb-3">
            We use this information to find your community!
          </Card.Subtitle>
        </>
      );
    }
    if (name === "work") {
      title = (
        <>
          {!map ? (
            <Card.Title>
              Do you {name} in a different municipality or neighbourhood?
              <Button
                variant="outline-primary"
                onClick={() => {
                  setShowMap(true);
                }}
              >
                Yes
              </Button>{" "}
              <Button
                onClick={() => {
                  console.log("test button");
                }}
              >
                No
              </Button>
            </Card.Title>
          ) : (
            <>
              <Card.Title>Show us on the map where your {name} is</Card.Title>
              <Card.Subtitle className="text-muted mb-3">
                We use this information to find your community!
              </Card.Subtitle>
            </>
          )}
        </>
      );
    }
    if (name === "school") {
      title = (
        <>
          {!map ? (
            <Card.Title>
              Do you study in a different municipality or neighbourhood?
              <Button
                variant="outline-primary"
                onClick={() => {
                  setShowMap(true);
                }}
              >
                Yes
              </Button>{" "}
              <Button
                onClick={() => {
                  console.log("test button");
                }}
              >
                No
              </Button>
            </Card.Title>
          ) : (
            <>
              <Card.Title>Show us on the map where your {name} is</Card.Title>
              <Card.Subtitle className="text-muted mb-3">
                We use this information to find your community!
              </Card.Subtitle>
            </>
          )}
        </>
      );
    }
    return (
      <>
        {/* <Card>
            <Card.Header>Step {show+1}/8</Card.Header>
              <Card.Body> */}
        {title}
        {map && (
          <SimpleMap
            iconName={name}
            sendData={(markers: any) => sendData(markers)}
          />
        )}
        {/* <div className="text-center">
                    <Button className="float-right mt-2" size="lg" onClick={()=>{nextHandler(show)}} disabled={(!markers.home.lat || !markers.home.lon )}>Next</Button>
                      {prev}
                    </div> */}
        {/* </Card.Body>
          </Card> */}
      </>
    );
  };
  //IMPORTANT
  // function customFormikSet(){
  //   if(markers.home.lat!=null){
  //     formik.setFieldValue("geo.lat",markers["home"].lat);
  //     formik.setFieldValue("geo.lon",markers["home"].lon );
  //     formik.setFieldValue("geo.work_lat",markers["work"].lat );
  //     formik.setFieldValue("geo.work_lon",markers["work"].lon );
  //     formik.setFieldValue("geo.school_lat",markers["school"].lat );
  //     formik.setFieldValue("geo.school_lon",markers["school"].lon );
  //     //formik.setFieldValue("image",selectedFile);
  //   }

  // }
  // const submitSegmentHandler = async(values: IUserSegment) =>{

  // }
  // const submitHandler = async (values: IRegisterInput) => {
  //   try {
  //     // Set loading
  //     setError(null);
  //     setShow(1);
  //     if(markers.home.lat===null){
  //       setError(new Error("Please enter your home location."))
  //       throw error;
  //     }
  //     setIsLoading(true);
  //     const { token, user } = await postRegisterUser(values);
  //     storeUserAndTokenInLocalStorage(token, user);
  //     storeTokenExpiryInLocalStorage();
  //     setToken(token);
  //     setUser(user);
  //     await postAvatarImage(selectedFile, token);

  //     // remove previous errors
  //     setError(null);
  //     // formik.resetForm();
  //   } catch (error) {
  //     const genericMessage = 'An error occured while trying to create a new account.';
  //     const errorObj = handlePotentialAxiosError(genericMessage, error);
  //     setError(errorObj);
  //     wipeLocalStorage();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }
  // const formik = useFormik<IRegisterInput>({
  //   initialValues: {
  //     userRoleId: userRoles ? userRoles[0].id : undefined,
  //     email: '',
  //     password: '',
  //     confirmPassword: '',
  //     fname: '',
  //     lname: '',
  //     address: {
  //       streetAddress: '',
  //       streetAddress2: '',
  //       city: '',
  //       postalCode: '',
  //       country: '',
  //     },
  //     geo: {
  //       lon: undefined,
  //       lat: undefined,
  //       work_lat: undefined,
  //       work_lon: undefined,
  //       school_lat: undefined,
  //       school_lon: undefined,
  //     },
  //     homeSegmentId: undefined,
  //     workSegmentId: undefined,
  //     schoolSegmentId: undefined,
  //     homeSubSegmentId: undefined,
  //     workSubSegmentId: undefined,
  //     schoolSubSegmentId: undefined
  //   },

  //   onSubmit: submitHandler
  // })
  //if(show === 0){
  return (
    <div className="register-page-content">
      <Card>
        <Card.Header>Step 1</Card.Header>
        <Card.Body>
          <FormikStepper
            initialValues={{
              // userRoleId: userRoles ? userRoles[0].id : undefined,
              userRoleId: "",
              email: "",
              password: "",
              confirmPassword: "",
              fname: "",
              lname: "",
              address: {
                streetAddress: "",
                streetAddress2: "",
                city: "",
                postalCode: "",
                country: "",
              },
              geo: {
                lon: null,
                lat: null,
                work_lat: null,
                work_lon: null,
                school_lat: null,
                school_lon: null,
              },
              homeSegmentId: null,
              workSegmentId: null,
              schoolSegmentId: null,
              homeSubSegmentId: null,
              workSubSegmentId: null,
              schoolSubSegmentId: null,
            }}
            onSubmit={async (values) => {
              console.log("values: ", values);
            }}
          >
            {/* <Form onSubmit={formik.handleSubmit}> */}
            {/* <main className='register-page-content'> */}
            <FormikStep>
              <h1>Create An Account</h1>
              <Form.Group>
                <Form.Label>Email address</Form.Label>
                <Field
                  as={Form.Control}
                  // required
                  type="email"
                  name="email"
                  // value={formik.values.email}
                  placeholder="name@example.com"
                />
                <Form.Label>Password</Form.Label>
                <Field
                  as={Form.Control}
                  // required
                  type="password"
                  name="password"
                  // onChange={formik.handleChange}
                  // value={formik.values.password}
                />
                <Form.Label>Confirm Password</Form.Label>
                <Field
                  as={Form.Control}
                  // required
                  type="password"
                  name="confirmPassword"
                  // onChange={formik.handleChange}
                  // value={formik.values.confirmPassword}
                />
                <Form.Label>First Name</Form.Label>
                <Field
                  as={Form.Control}
                  // required
                  type="text"
                  name="fname"
                  maxLength={TEXT_INPUT_LIMIT.NAME}

                  // onChange={formik.handleChange}
                  // value={formik.values.fname}
                />
                <Form.Label>Last Name</Form.Label>
                <Field
                  as={Form.Control}
                  // required
                  type="text"
                  name="lname"
                  maxLength={TEXT_INPUT_LIMIT.NAME}

                  // onChange={formik.handleChange}
                  // value={formik.values.lname}
                />
              </Form.Group>
              <Form.Group controlId="registerZip">
                <Form.Label>Zip / Postal Code</Form.Label>
                <Field
                  as={Form.Control}
                  // required
                  type="text"
                  name="address.postalCode"
                  // onChange={formik.handleChange}
                  // value={formik.values.address?.postalCode}
                />
              </Form.Group>
              <Form.Group controlId="registerAddress">
                <Form.Label>Street Name</Form.Label>
                <Field
                  as={Form.Control}
                  // required
                  type="text"
                  name="address.streetAddress"
                  maxLength={TEXT_INPUT_LIMIT.STREET_NAME}

                  // onChange={formik.handleChange}
                  // value={formik.values.address?.streetAddress}
                />
              </Form.Group>
              {/* <Form.Group controlId="registerUserType">
                  <Form.Label>Choose your desired account type:</Form.Label>
                  <Field
                    as="select"
                    name="userRoleId"
                    // onChange={formik.handleChange}
                    // value={formik.values.userRoleId}
                  >
                    {userRoles && userRoles.map(role => (
                      <option
                        key={String(role.id)}
                        value={Number(role.id)}
                        style={{
                          textTransform: 'capitalize'
                        }}
                      >
                        {capitalizeString(role.name)}
                      </option>
                    ))}
                  </Field>
                </Form.Group> */}
              <Form.Group controlId="avatarImage">
                <Form.Label>Profile Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  onChange={(e: any) => setSelectedFile(e.target.files[0])}
                />
              </Form.Group>
              {/* <Button
                  block
                  type='submit'
                  disabled={(isLoading) ? true : false}
                >
                  Next
                </Button> */}
              {error && (
                <Alert variant="danger" className="error-alert">
                  {error.message}
                </Alert>
              )}
              {/* </Card.Body>
          </Card> */}
            </FormikStep>
            <FormikStep>
              <NextMap name="home" showMap={true} />
            </FormikStep>

            <FormikStep>
              {/* <Card>
            <Card.Header>Step {show+1}/8</Card.Header>
            <Card.Body> */}
              <Form.Group controlId="homeSegment">
                <Form.Label>Your home Municipality is</Form.Label>
                <Form.Control
                  readOnly
                  name="homeSegmentId"
                  defaultValue={capitalizeString("testReplace")}
                ></Form.Control>
              </Form.Group>
              <Form.Group controlId="homeSubSegment">
                <Form.Label>Select your Neighbourhood</Form.Label>
                <Form.Control
                  as="select"
                  name="sub-segment"
                  onChange={(e) => {
                    console.log(e);
                  }}
                ></Form.Control>
                <Button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  variant="link"
                >
                  Don't see your Municipality or Neighbourhood? Click here to
                  request it in our system!
                </Button>
              </Form.Group>
              {/* <div className="text-center">
                {next}
                {prev}
                </div> */}
              {/* </Card.Body>
          </Card> */}
            </FormikStep>

            <FormikStep>
              <NextMap name="work" showMap={false} />
            </FormikStep>

            <FormikStep>
              <Form.Group controlId="workSegment">
                <Form.Label>Your work Municipality is</Form.Label>
                <Form.Control
                  readOnly
                  name="workSegmentId"
                  defaultValue={capitalizeString("testReplace")}
                ></Form.Control>
              </Form.Group>
              <Form.Group controlId="workSubSegment">
                <Form.Label>Select your Neighbourhood</Form.Label>
                <Form.Control
                  as="select"
                  name="sub-segment"
                  onChange={(e) => {
                    console.log(e);
                  }}
                ></Form.Control>
                <Button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  variant="link"
                >
                  Don't see your Municipality or Neighbourhood? Click here to
                  request it in our system!
                </Button>
              </Form.Group>
              {/* <div className="text-center">
                {next}
                {prev}
                </div> */}
              {/* </Card.Body>
          </Card>     */}
            </FormikStep>

            <FormikStep>
              <NextMap name="school" showMap={false} />
            </FormikStep>

            <FormikStep>
              <Form.Group controlId="schoolSegment">
                <Form.Label>Your school Municipality is</Form.Label>
                <Form.Control
                  readOnly
                  name="schoolSegmentId"
                  defaultValue={capitalizeString("testReplace")}
                ></Form.Control>
              </Form.Group>
              <Form.Group controlId="schoolSubSegment">
                <Form.Label>Select your Neighbourhood</Form.Label>
                <Form.Control
                  as="select"
                  name="sub-segment"
                  onChange={(e) => {
                    console.log(e);
                  }}
                ></Form.Control>
                <Button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  variant="link"
                >
                  Don't see your Municipality or Neighbourhood? Click here to
                  request it in our system!
                </Button>
              </Form.Group>
              {/* <div className="text-center">
                {next}
                {prev}
                </div> */}
            </FormikStep>
            {/* </Form> */}
          </FormikStepper>
          {/* <FormikStepper> */}
        </Card.Body>
      </Card>
    </div>
  );
};
export interface FormikStepProps
  extends Pick<FormikConfig<FormikValues>, "children"> {}

export function FormikStep({ children }: FormikStepProps) {
  return <>{children}</>;
}

export function FormikStepper({
  children,
  ...props
}: FormikConfig<FormikValues>) {
  const childrenArray = React.Children.toArray(
    children
  ) as React.ReactElement<FormikStepProps>[];
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
  const [completed, setCompleted] = useState(false);

  function isLastStep() {
    return step === childrenArray.length - 1;
  }

  return (
    <Formik
      {...props}
      onSubmit={() => {
        console.log();
      }}
    >
      <Form>
        {currentChild}
        {step > 0 ? (
          <Button
            onClick={() => {
              setStep((s) => s - 1);
            }}
          >
            Back
          </Button>
        ) : null}
        <Button type="submit">{isLastStep() ? "Submit" : "Next"}</Button>
      </Form>
    </Formik>
  );
}

//   if(show === 4){
//     return(

//     )
//   }
//   if(show === 5){
//     return(
//     //   <main className='register-page-content'>
//     //   <Card>
//     //   <Card.Header>Step {show+1}/8</Card.Header>
//     //   <Card.Body>
//     //   <NextMap name="school" showMap={false}/>
//     //   <div className="text-center">
//     //     {next}
//     //     {prev}
//     //     </div>
//     //     </Card.Body>
//     // </Card>
//     // </main>
//     <NextMap name="school" showMap={false}/>
//     )
//   }
//   if(show === 6){
//     return(
//       <main className='register-page-content'>
//       <Card>
//       <Card.Header>Step {show+1}/8</Card.Header>
//       <Card.Body>
//       <SegmentsDropdown subSegments={subSegmentList} segments={segmentList} name={"school"}/>
//       <div className="text-center">
//         {next}
//         {prev}
//         </div>
//         </Card.Body>
//     </Card>
//     </main>
//     )
//   }
//   if(show === 7){
//     return(
//       <main className='register-page-content'>
//       <Card>
//       <Card.Header>Step {show+1}/8</Card.Header>
//       <Card.Body>
//       <div className="text-center">
//         {prev}
//         {register}
//       </div>
//         </Card.Body>
//     </Card>
//     </main>
//     )

//   }

//   return(<></>);

// }

export default RegisterPageContent;
