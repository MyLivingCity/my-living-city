import { useContext, useState } from 'react';
import { Modal, Image, Form, Button, Alert, Card } from 'react-bootstrap';
import { useFormik } from 'formik';
import { ILoginWithEmailAndPass } from '../../lib/types/input/loginWithEmailAndPass.input';
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { IFetchError } from '../../lib/types/types';
import { handlePotentialAxiosError, storeTokenExpiryInLocalStorage, storeUserAndTokenInLocalStorage, wipeLocalStorage } from '../../lib/utilityFunctions';
import { getUserWithEmailAndPass } from '../../lib/api/userRoutes';
import { attemptUnbanUser } from '../../lib/api/banRoutes';
import { sendEmail } from '../../lib/api/sendEmailRoutes';
import { ROUTES } from '../../lib/constants';

function ResetPasswordModal(props:any, email:string){
    const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false);};
    const handleShow = () => {setShow(true);};
    const [inputVal, setInputVal] = useState(props.email);
    return (
        <>
            <div className = 'text-center'>
                <Button
                    type={'submit'}
                    variant='link'
                    onClick={()=>{
                        handleShow();
                    }}>
        Forgot your password?
                </Button>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Email Password Reset</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId='emailInput'>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                required
                                type='email'
                                name='email'
                                placeholder={'Enter email'}
                                onChange={e=>setInputVal(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        type={'submit'}
                        variant='primary'
                        onClick={()=>{
                            handleClose();
                            sendEmail({email:inputVal.toLowerCase()});
                        }}>
            Send Reset Link
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}


export default function LoginPageContent() {
    const {
        setToken,
        setUser,
    } = useContext(UserProfileContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<IFetchError | null>(null);
    const [showError, setShowError] = useState(true);


    const submitHandler = async (values: ILoginWithEmailAndPass) => {
        try {
            // Set loading
            setIsLoading(true);

            // Destructure payload and set global and local state
            const { token, user } = await getUserWithEmailAndPass(values);
            await attemptUnbanUser(token);
            storeUserAndTokenInLocalStorage(token, user);
            storeTokenExpiryInLocalStorage();
            setToken(token);
            setUser(user);
            // remove previous errors
            setError(null);
            formik.resetForm();
        } catch (error) {
            const genericMessage = 'Error occured while logging in user.';
            const errorObj = handlePotentialAxiosError(genericMessage, error);
            setError(errorObj);
            wipeLocalStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik<ILoginWithEmailAndPass>({
        initialValues: {
            email: '',
            password: '',
        },
        onSubmit: submitHandler
    });
    return (
        <main className='login-page-content'>
            <Card>
                <Card.Body className='my-5'>
                    <Image
                        className='mb-4'
                        src='/MyLivingCity_Logo_NameOnly.png'
                        fluid
                    />
                    {error && (
                        <Alert
                            show={showError}
                            onClose={() => setShowError(false)}
                            dismissible
                            // variant='danger'
                            variant='danger'
                            className='error-alert'
                        >
                            { error.message}
                        </Alert>
                    )}
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group controlId='loginEmail' className='mt-2'>
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                name='email'
                                type='email'
                                required
                                placeholder='Enter email'
                                onChange={formik.handleChange}
                                value={formik.values.email}
                            />
                            <Form.Text className='text-muted'>
                We'll never share your email with anyone else.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId='loginPassword' className='mb-2'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                name='password'
                                type='password'
                                required
                                placeholder='Password'
                                onChange={formik.handleChange}
                                value={formik.values.password}
                            />
                        </Form.Group>
                        <Button
                            block
                            type='submit'
                            disabled={isLoading ? true : false}
                        >
              Login
                        </Button>
                    </Form>
                    <div className='w-100 text-center mt-2'>
                        <a href={ROUTES.REGISTER}>Don't have an account? Create one.</a>
                    </div>
                    <ResetPasswordModal email={formik.values.email}/>
                    {/* <div className="w-100 text-center mt-2">
            <a href={ROUTES.REGISTER}>Forgot your password?</a>
          </div> */}
                </Card.Body>
            </Card>
        </main >
    );
}
