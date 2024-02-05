import React, { useState, useEffect } from 'react'
import { Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateUser, getUserBanHistory, postRegisterUser, deleteUser } from 'src/lib/api/userRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { IUser } from 'src/lib/types/data/user.type';
import { UserSegmentInfoCard } from '../partials/UserSegmentInfoCard';
import { UserSegPlainText } from '../partials/UserSegPlainText';
import { UserManagementBanModal } from '../modal/UserManagementBanModal';
import { UserManagementUnbanModal } from '../modal/UserManagementUnbanModal';
import { UserManagementBanHistoryModal } from '../modal/UserManagementBanHistoryModal';
import { IBanUser } from 'src/lib/types/data/banUser.type';
import { ISuperSegment } from 'src/lib/types/data/segment.type';
import { ISegment } from 'src/lib/types/data/segment.type';
import { IRegisterInput } from './../../lib/types/input/register.input';


interface AdminManagementContentProps {
    users: IUser[] | undefined;
    token: string | null;
    user: IUser | null;
    bans: IBanUser[] | undefined;
    segs: ISuperSegment[];
    subSeg: ISegment[];


}

export const AdminManagementContent: React.FC<AdminManagementContentProps> = ({  users: initialUsers, token, user, segs, bans, subSeg }) => {
    const [users, setUsers] = useState<IUser[] | undefined>(initialUsers);
    const [hideControls, setHideControls] = useState('');
    const [showUserSegmentCard, setShowUserSegmentCard] = useState(false);
    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    const [reviewed, setReviewed] = useState<boolean>(false);
    const [showUserBanModal, setShowUserBanModal] = useState<boolean>(false);
    const [showUserUnbanModal, setShowUserUnbanModal] = useState<boolean>(false);
    const [showUserBanHistoryModal, setShowUserBanHistoryModal] = useState<boolean>(false);
    const [modalUser, setModalUser] = useState<IUser>();
    const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
    const [buttonText, setButtonText] = useState('Admin Creation Wizard');
    const [banHistory, setBanHistory] = useState<any>();
    const UserSegmentHandler = (email: string, id: string) => {
        setShowUserSegmentCard((prevState) => !prevState);
        setEmail(email);
        setId(id);
    }

    let newHomeID = 1;
    const [selectedUserType, setSelectedUserType] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRegionName = event.target.value;


        setSelectedRegion(selectedRegionName);
    };


  


    const toggleCreateAccountForm = () => {
        setShowCreateAccountForm(!showCreateAccountForm);
        setButtonText(showCreateAccountForm ? 'Admin Creation Wizard' : 'Hide Creation Wizard');
    };


    const capitalizeString = (s: string) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    const handleDeleteUser = async (userId: string) => {
        try {
          await deleteUser(userId, token);
          console.log('User deleted successfully!');
    
          // Remove the deleted user from the users state
          setUsers((prevUsers) => prevUsers?.filter((user) => user.id !== userId));
        } catch (error) {
          console.error('Error deleting user:', error);
          // Handle error state or show error message to the user
        }
      };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        console.log('Made it Submit')
 

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const selectedCommunity = formData.get('inputCommunity') as string;
        console.log(selectedCommunity)
        const homeSegmentId = subSeg.find(seg => selectedCommunity === seg.name)?.segId;
        console.log(homeSegmentId)
        const registerData: IRegisterInput = {
            userRoleId: undefined,
            email: formData.get('inputEmail') as string,
            password: formData.get('inputPassword') as string,
            confirmPassword: formData.get('inputPassword') as string,
            organizationName: undefined,
            fname: formData.get('inputFirst') as string,
            lname: formData.get('inputLast') as string,
            displayFName: formData.get('inputFirst') as string,
            displayLName: formData.get('inputLast') as string,
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
                programCompletionDate: new Date(),
            },

            homeSegmentId: parseInt(formData.get('inputCommunity') as string),
            workSegmentId: undefined,
            schoolSegmentId: undefined,
            homeSubSegmentId: undefined,
            workSubSegmentId: undefined,
            schoolSubSegmentId: undefined,
            userType: formData.get('inputType') as string,
            reachSegmentIds: [],
            verified: true,

        };


        try {
            await postRegisterUser(registerData, null, false, null);
            console.log('User registered successfully!');
            form.reset();
            


        } catch (error) {
            console.error('Error registering user:', error);
            
        }
    };








    const userTypes = Object.keys(USER_TYPES);
    return (
        <Container style={{ maxWidth: '100%', marginLeft: 50 }}>




            <div className="d-flex justify-content-between">
                <h2 className="mb-4 mt-4">Admin Management</h2>
                <Button variant="primary" className="mb-4 mt-4" onClick={() => toggleCreateAccountForm()}>{buttonText}</Button>
            </div>
            {showCreateAccountForm && (


                <Form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group col-md-12">
                            <label htmlFor="inputData">User Type</label>
                            <Form.Control as="select" required name="inputType">
                                <option value="">Select User Type</option>
                                {userTypes.filter(item => item === 'ADMIN' || item === 'MUNICIPAL_SEG_ADMIN' || item === 'SEG_ADMIN').map(item => <option key={item}>{item}</option>)}
                            </Form.Control>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputFirst">First Name</label>
                            <input type="text" className="form-control" id="inputFirst" name="inputFirst" placeholder="John" required />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputLast">Last Name</label>
                            <input type="text" className="form-control" id="inputLast" name="inputLast" placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputEmail">Email</label>
                            <input type="email" className="form-control" id="inputEmail" name="inputEmail" placeholder="Email" required />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputPassword">Password</label>
                            <input type="password" className="form-control" id="inputPassword" name="inputPassword" placeholder="Password" required />
                        </div>
                    </div>

                    <div className="form-row">

                        <div className="form-group col-md-6">
                            <label htmlFor="inputRegion">Region</label>

                            <Form.Control as="select" required value={selectedRegion} onChange={handleRegionChange}>
                                <option value="">Select Region</option>
                                {segs.map(seg => (
                                    <option key={seg.superSegId} value={seg.name}>
                                        {seg.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputCom">Community</label>
                            <Form.Control as="select" name="inputCommunity" onChange={(event) => { newHomeID = parseInt(event.target.value) }}>
                                <option value="">Select Community</option>
                                {subSeg
                                    .filter(seg => seg.superSegName?.toUpperCase() === selectedRegion.toUpperCase())
                                    .map(seg => (
                                        <option key={seg.superSegId} value={seg.segId}>
                                            {capitalizeString(seg.name)}
                                        </option>
                                    ))}
                            </Form.Control>
                        </div>
                    </div>


                    <button type="submit" className="btn btn-primary mr-2 mb-2">Submit</button>
                </Form >
            )}

            <Table bordered hover size="sm">
                <thead className="table-active" >
                    <tr>
                        <th data-sortable scope="col" className="col-3 text-center align-middle">Email</th>
                        <th scope="col" className="col-2 text-center align-middle">First</th>
                        <th scope="col" className="col-2 text-center align-middle">Last</th>
                        <th scope="col" className="col-2 text-center align-middle ">User Type</th>
                        <th scope="col" className="col-3 text-center align-middle">Area of Access</th>
                        <th scope="col" className="col-1 text-center align-middle">Controls</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((req: IUser, index: number) => (
                        req.userType === 'ADMIN' || req.userType === 'MUNICIPAL_SEG_ADMIN' || req.userType === 'MOD' || req.userType === 'SEG_MOD' || req.userType === 'SEG_ADMIN' ? (
                            <tr key={req.id}>
                                {req.id !== hideControls ?
                                    <>

                                        <td className="text-left align-middle">{req.email}</td>
                                        <td className="text-left align-middle ">{req.fname}</td>
                                        <td className="text-left align-middle">{req.lname}</td>
                                        <td className="text-center align-middle">{req.userType}</td>
                                        <td className="text-center align-middle">
                                            {req.userType === 'ADMIN' ? (
                                                'Full access'
                                            ) : (
                                                <UserSegPlainText email={req.email} id={req.id} token={token} />
                                            )}
                                        </td>


                                    </> :
                                    <>
                                        <td className="text-left align-middle"><Form.Control type="text" defaultValue={req.email} onChange={(e) => req.email = e.target.value} /></td>
                                        <td className="text-left align-middle"><Form.Control type="text" defaultValue={req.fname} onChange={(e) => req.fname = e.target.value} /></td>
                                        <td className="text-left align-middle"><Form.Control type="text" defaultValue={req.lname} onChange={(e) => req.lname = e.target.value} /></td>
                                        <td className="text-left align-middle"><Form.Control as="select" onChange={(e) => { (req.userType as String) = e.target.value }}>
                                            <option className="text-center align-middle" >{req.userType}</option>
                                            {userTypes.filter(type => type !== req.userType)
                                             .filter((type => type !== 'DEVELOPER'))
                                             .filter((type => type !== 'IN_PROGRESS'))
                                             .filter((type => type !== 'ASSOCIATE'))
                                             .filter((type => type !== 'RESIDENTIAL'))
                                             .filter((type => type !== 'COMMUNITY'))
                                             .filter((type => type !== 'BUSINESS'))
                                            .map(item =>
                                                <option key={item}>{item}</option>
                                            )}

                                        </Form.Control>
                                        </td>

                                        <td className="text-center align-middle">
                                            {req.userType === 'ADMIN' ? (
                                                'Full access'
                                            ) : (
                                                <UserSegPlainText email={req.email} id={req.id} token={token} />
                                            )}
                                        </td>

                                    </>
                                }

                                <td>
                                    {req.id !== hideControls ?
                                        <NavDropdown title="Controls" id="nav-dropdown">
                                            <Dropdown.Item onClick={() => {
                                                setHideControls(req.id);
                                                setReviewed(req.reviewed);
                                                setModalUser(req);
                                            }}>Edit</Dropdown.Item>
                                            <Dropdown.Item onClick={() =>
                                                UserSegmentHandler(req.email, req.id)
                                            }>View Segments</Dropdown.Item>
                                            {req.banned ?
                                                <Dropdown.Item onClick={() => {
                                                    setModalUser(req);
                                                    setShowUserUnbanModal(true);
                                                }}>Modify Ban</Dropdown.Item>
                                                :
                                                <Dropdown.Item onClick={() => {
                                                    setModalUser(req);
                                                    setShowUserBanModal(true);
                                                }}>Ban User</Dropdown.Item>
                                            }

                                            <Dropdown.Item onClick={() => {
                                                const confirmed = window.confirm('Are you sure you want to delete this user?');
                                                if (confirmed) {
                                                    handleDeleteUser(req.id);
                                                }
                                            }} className="text-danger">
                                                Delete
                                            </Dropdown.Item>
                                        </NavDropdown>
                                        : <>
                                            <div className="d-flex justify-content-between">
                                                <Button size="sm" variant="outline-danger" className="mr-2 mb-2 " onClick={() => setHideControls('')}>
                                                    Cancel
                                                </Button>
                                                <Button size="sm" className="mr-2 mb-2" onClick={() => {
                                                    setHideControls('');
                                                    updateUser(req, token, user);
                                                }}>
                                                    Save
                                                </Button>
                                            </div>
                                        </>
                                    }

                                </td>
                            </tr>) : null
                    ))}
                </tbody>
            </Table>

            <br></br>
            {/* <UserSegmentHandler/> */}
            {showUserSegmentCard && (<UserSegmentInfoCard email={email} id={id} token={token} />)}
        </Container>
    );
}