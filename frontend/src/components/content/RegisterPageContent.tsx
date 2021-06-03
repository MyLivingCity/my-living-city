import { useContext, useState } from 'react'
import { ProgressBar, Form, Button, Alert, Card } from 'react-bootstrap'
import { useFormik } from 'formik'
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { IFetchError } from '../../lib/types/types';
import { capitalizeString, handlePotentialAxiosError, storeTokenExpiryInLocalStorage, storeUserAndTokenInLocalStorage, wipeLocalStorage } from '../../lib/utilityFunctions';
import { IRegisterInput } from '../../lib/types/input/register.input';
import { IUserRole } from '../../lib/types/data/userRole.type';
import { postRegisterUser } from '../../lib/api/userRoutes';
import SimpleMap from '../map/SimpleMap';
import { postAvatarImage } from '../../lib/api/avatarRoutes';
import React from 'react'
import { FromTo } from 'moment';
import {searchForLoaction} from '../../lib/api/googleMapQuery';
import {findSegmentByName} from '../../lib/api/segmentRoutes';

interface RegisterPageContentProps {
  userRoles: IUserRole[] | undefined;
}


const RegisterPageContent: React.FC<RegisterPageContentProps> = ({ userRoles }) => {
  const {
    setToken,
    setUser,
    //user
  } = useContext(UserProfileContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IFetchError | null>(null);
  //const [iconName, setIcon] = useState("home");
  const [selectedFile, setSelectedFile] = useState(undefined);
  let [show, setShow] = useState(0);

  const [markers, sendData]:any = useState({
    home: {lat: null, lon: null},
    work: {lat: null, lon: null},
    school: {lat: null, lon: null}
  });
  
  const [homeSubsegments,setHomeSubsegments] = useState([]);
  const [workSubsegments,setWorkSubsegments] = useState([]);
  const [schoolSubsegments,setSchooSubsegments] = useState([]);

  const getSubsegments = async (name:string,lat:number,lon:number) => {
    try{
      const queryResult = await searchForLoaction(lat,lon);
      const address = queryResult?.results[0]?.formatted_address;
      if(address){
        let addressComponents = address.split(',');
        let city = addressComponents[1].trim();


      }else{
        console.log("address not found!");
        return null;
      }
    }catch(error){
      console.log(error);
    }
  }

  interface NextMapProps {
    name: string;
  }
  const NextMap: React.FC<NextMapProps> = ({name}) => {
    let title: any;
    if(name==="home") title = <Card.Title>Where is your {name} community?</Card.Title>
    if(name==="work") title = <Card.Title>Do you {name} in a different municipality?</Card.Title>
    if(name==="school") title = <Card.Title>Do you study in a different municipality?</Card.Title>

    let searchButton: any;
    if(name==='home') searchButton = <Button type='button' disabled={(markers.home.lat && markers.home.lon) ? false : true} onClick={}>search segment</Button>;
    if(name==='work') searchButton = <Button type='button' disabled={(markers.work.lat && markers.work.lon) ? false : true} onClick={}>search segment</Button>;
    if(name==='school') searchButton = <Button type='button' disabled={(markers.school.lat && markers.school.lon) ? false : true} onClick={}>search segment</Button>;

    return(
      <main className='register-page-content'>
      <Card>
      {/* <Card.Header>Show us where your {name} community is</Card.Header> */}
      <Card.Header>Step 2</Card.Header>
      
      <Card.Body>
        {title}
      {/* <Card.Title>Where is your {name} community?</Card.Title> */}
      <SimpleMap iconName={name} sendData={(markers:any)=>sendData(markers) } />
        <Form.Group controlId="registerUserType">
                  <Form.Label>Select your neighbourhood</Form.Label>
                  {searchButton}
                  <Form.Control
                    as="select"
                    name="sub-segment"
                  >
                    {/* {userRoles && userRoles.map(role => (
                      <option
                        key={String(role.id)}
                        value={Number(role.id)}
                        style={{
                          textTransform: 'capitalize'
                        }}
                      >
                        {capitalizeString(role.name)}
                      </option>
                    ))} */}
                  </Form.Control>
                </Form.Group>
      
        
        <div className="text-center">
        {show !== 1 ? <Button className="float-left m-1" size="lg" variant="outline-primary"onClick={()=>{setShow(show=show-1)}}>Previous</Button>:<div/>}{' '}
        {show !== 3 ?<Button className="float-right m-1" size="lg" onClick={()=>{setShow(show=show+1)}}>Next</Button>:<div/>}{' '}
        {show === 3 ? <Button type="submit" size="lg" onClick={()=>{customFormikSet(); 
          submitHandler(formik.values)}} className="float-right mt-1">Register!</Button>:<div/>}
        </div>
        </Card.Body>
    </Card>
    </main>
    )
  }

  //function handleChange(e:any){setIcon(e.target.value);}

  

  function customFormikSet(){
    if(markers.home.lat!=null){
      formik.setFieldValue("geo.lat",markers["home"].lat);
      formik.setFieldValue("geo.lon",markers["home"].lon );
      formik.setFieldValue("geo.work_lat",markers["work"].lat );
      formik.setFieldValue("geo.work_lon",markers["work"].lon );
      formik.setFieldValue("geo.school_lat",markers["school"].lat );
      formik.setFieldValue("geo.school_lon",markers["school"].lon );
      //formik.setFieldValue("image",selectedFile);
    }

  }
  
  const submitHandler = async (values: IRegisterInput) => {
    try {
      // Set loading 
      setError(null);
      setShow(1);
      if(markers.home.lat===null){
        setError(new Error("Please enter your home location."))
        throw error;
      }
      setIsLoading(true);
      const { token, user } = await postRegisterUser(values);
      storeUserAndTokenInLocalStorage(token, user);
      storeTokenExpiryInLocalStorage();
      setToken(token);
      setUser(user);
      await postAvatarImage(selectedFile, token);
      

      // remove previous errors
      setError(null);
      formik.resetForm();
    } catch (error) {
      const genericMessage = 'An error occured while trying to create a new account.';
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
      wipeLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }
  
  const formik = useFormik<IRegisterInput>({
    initialValues: {
      userRoleId: userRoles ? userRoles[0].id : undefined,
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
      }
    },
    
    onSubmit: submitHandler
  })
  if(show === 0){
    return (
      
      <main className='register-page-content'>
          <Card>
            <Card.Header>Step 1</Card.Header>
            <Card.Body>
              <h1>Create An Account</h1>
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group>
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    name="email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    placeholder="name@example.com"
                  />
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    name="password"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                  />
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    name="confirmPassword"
                    onChange={formik.handleChange}
                    value={formik.values.confirmPassword}
                  />
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="fname"
                    onChange={formik.handleChange}
                    value={formik.values.fname}
                  />
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="lname"
                    onChange={formik.handleChange}
                    value={formik.values.lname}
                  />
                </Form.Group>
                <Form.Group controlId="registerAddress">
                  <Form.Label>Zip / Postal Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="address.postalCode"
                    onChange={formik.handleChange}
                    value={formik.values.address?.postalCode}
                  />
                </Form.Group>
                <Form.Group controlId="registerAddress">
                  <Form.Label>Street Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="address.streetAddress"
                    onChange={formik.handleChange}
                    value={formik.values.address?.streetAddress}
                  />
                </Form.Group>
                
                  {/* <Form.Group controlId="registerUserLocation">
                  <Form.Label>Enter your where you are located</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={handleChange}>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="school">School</option>
                  </Form.Control>
                  </Form.Group>
                  <Form.Group>
                      <SimpleMap iconName={iconName} sendData={(markers:any)=>sendData(markers) } />
                  </Form.Group> */}
                  <Form.Group controlId="registerUserType">
                  <Form.Label>Choose your desired account type:</Form.Label>
                  <Form.Control
                    as="select"
                    name="userRoleId"
                    onChange={formik.handleChange}
                    value={formik.values.userRoleId}
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
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="avatarImage">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    //onChange={(e:any)=> formik.setFieldValue("image", e.target.files[0])}
                    onChange={(e:any)=> setSelectedFile(e.target.files[0])}
  
                    //onChange={(picture) => {formik.setFieldValue('image',picture)}}
                  />
                </Form.Group>
                <Button
                  block
                  //onClick={()=>{customFormikSet()}}
                  //onClick={()=>{setShow(1)}}
                  type='submit'
                  disabled={(isLoading) ? true : false}
                >
                  Next
                </Button>
              </Form>
              {error && (
                <Alert variant='danger' className="error-alert">
                  { error.message}
                </Alert>
              )}
            </Card.Body>
          </Card>
      </main>
    )
  }
  if(show === 1){
    return(
      <NextMap name="home"/>
    )
  }
  if(show === 2){
    return(
      <NextMap name="work"/>
    )
  }
  if(show === 3){
    return(
      <NextMap name="school"/>
    )
  }

  
  
  return(<></>);
  
}

export default RegisterPageContent