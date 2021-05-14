import { useContext, useState } from 'react'
import { Form, Button, Alert, Card } from 'react-bootstrap'
import { useFormik } from 'formik'
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { IFetchError } from '../../lib/types/types';
import { capitalizeString, handlePotentialAxiosError, storeTokenExpiryInLocalStorage, storeUserAndTokenInLocalStorage, wipeLocalStorage } from '../../lib/utilityFunctions';
import { IRegisterInput } from '../../lib/types/input/register.input';
import { IUserRole } from '../../lib/types/data/userRole.type';
import { postRegisterUser } from '../../lib/api/userRoutes';
import SimpleMap from '../map/SimpleMap';
interface RegisterPageContentProps {
  userRoles: IUserRole[] | undefined;
}

const RegisterPageContent: React.FC<RegisterPageContentProps> = ({ userRoles }) => {
  const {
    setToken,
    setUser,
    user
  } = useContext(UserProfileContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IFetchError | null>(null);
  const [iconName, setIcon] = useState("home");
  const [markers, sendData]:any = useState({lat:0,lon:0});
  
  function handleChange(e:any){setIcon(e.target.value);}

  function customFormikSet(){
    formik.setFieldValue("geo.lat",markers["home"].lat);
    formik.setFieldValue("geo.lon",markers["home"].lon );
    formik.setFieldValue("geo.work_lat",markers["work"].lat );
    formik.setFieldValue("geo.work_lon",markers["work"].lon );
    formik.setFieldValue("geo.school_lat",markers["school"].lat );
    formik.setFieldValue("geo.school_lon",markers["school"].lon );
  }
  

  const submitHandler = async (values: IRegisterInput) => {
    try {
      // Set loading 
      setError(null);
      setIsLoading(true);

      const { token, user } = await postRegisterUser(values);
      storeUserAndTokenInLocalStorage(token, user);
      storeTokenExpiryInLocalStorage();
      setToken(token);
      setUser(user);


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
      },
    },
    
    onSubmit: submitHandler
  })
  // customFormikSet("geo.lon",markers.lon);
  // customFormikSet("geo.lat",markers.lat);
  return (
    <main className='register-page-content'>
        <Card>
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
              {/* <Form.Label>Upload a profile image</Form.Label><br></br>
              <Form.Control
                type="file"
                id="formFileMultiple"
                name="profImage"
                /> */}
                <Form.Group controlId="registerUserLocation">
                <Form.Label>Enter your where you are located</Form.Label>
                <Form.Control
                  as="select"
                  onChange={handleChange}>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="school">School</option>
                </Form.Control>
                <SimpleMap iconName={iconName} sendData={(markers:any)=>sendData(markers)} />
                </Form.Group>
              <Button
                block
                onClick={()=>{customFormikSet()}}
                type='submit'
                disabled={isLoading ? true : false}
              >
                
                Register!
              </Button>
              {/* {customFormikSet("geo.lon",markers.lon)} */}
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

export default RegisterPageContent