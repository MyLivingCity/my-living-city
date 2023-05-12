import React, { useState } from 'react'
import { Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateUser, getUserBanHistory } from 'src/lib/api/userRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { IUser } from 'src/lib/types/data/user.type';
import { UserSegmentInfoCard } from '../partials/UserSegmentInfoCard';
import { UserManagementBanModal } from '../modal/UserManagementBanModal';
import { UserManagementUnbanModal } from '../modal/UserManagementUnbanModal';
import { UserManagementBanHistoryModal } from '../modal/UserManagementBanHistoryModal';
import { IBanUser } from 'src/lib/types/data/banUser.type';
import { ISuperSegment } from 'src/lib/types/data/segment.type';
import { ISegment } from 'src/lib/types/data/segment.type';

interface AdminManagementContentProps {
    users: IUser[] | undefined;
    token: string | null;
    user: IUser | null;
    bans: IBanUser[] | undefined;
    segs: ISuperSegment[];
    subSeg: ISegment[];

}

export const AdminManagementContent: React.FC<AdminManagementContentProps> = ({ users, token, user, segs, bans, subSeg }) => {
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
    const [buttonText, setButtonText] = useState("Admin Creation Wizard");
    const [banHistory, setBanHistory] = useState<any>();
    const UserSegmentHandler = (email: string, id: string) => {
        setShowUserSegmentCard(true);
        setEmail(email);
        setId(id);
    }
    const [selectedRegion, setSelectedRegion] = useState("");
    const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRegionName = event.target.value;


        setSelectedRegion(selectedRegionName);
    };
    const toggleCreateAccountForm = () => {
        setShowCreateAccountForm(!showCreateAccountForm);
        setButtonText(showCreateAccountForm ? "Admin Creation Wizard" : "Hide Creation Wizard");
    };



    function formatBanHistory(banhistory: any) {
        // iterate through ban history and format it
        let banHistory = banhistory.map((ban: any) => {
            if (ban.type === 'USER') {
                return (
                    <tr>
                        <td>Ban Type: {ban.userBanType}</td>
                        <td>Ban Reason: {ban.reason}</td>
                        <td>Moderator Message: {ban.message}</td>
                        <td>Moderator ID: {ban.modId}</td>
                        <td>Banned At: {ban.createdAt}</td>
                        <td>Banned Until: {ban.userBannedUntil}</td>
                    </tr>
                )
            } else if (ban.type === 'COMMENT') {
                return (
                    <tr>
                        <td>Ban Reason: {ban.reason}</td>
                        <td>Moderator Message: {ban.message}</td>
                        <td>Moderator ID: {ban.modId}</td>
                        <td>Banned At: {ban.createdAt}</td>
                    </tr>
                )
            } else if (ban.type === 'IDEA') {
                return (
                    <tr>
                        <td>Ban Reason: {ban.reason}</td>
                        <td>Moderator Message: {ban.message}</td>
                        <td>Moderator ID: {ban.modId}</td>
                        <td>Banned At: {ban.createdAt}</td>
                    </tr>
                )
            } else {
                return <tr><td>Invalid</td></tr>;
            }
        });
        return banHistory;
    }

  

    const userTypes = Object.keys(USER_TYPES);
    return (
        <Container style={{ maxWidth: '80%', marginLeft: 50 }}>

            {showUserBanModal ?
                <UserManagementBanModal show={showUserBanModal} setShow={setShowUserBanModal} modalUser={modalUser!} currentUser={user!} token={token} />
                : null
            }
            {showUserUnbanModal ?
                <UserManagementUnbanModal show={showUserUnbanModal} setShow={setShowUserUnbanModal} modalUser={modalUser!} currentUser={user!} token={token} />
                : null
            }
            {showUserBanHistoryModal ?
                <UserManagementBanHistoryModal show={showUserBanHistoryModal} setShow={setShowUserBanHistoryModal} modalUser={modalUser!} currentUser={user!} token={token} data={banHistory!} />
                : null
            }

            <Form>
                <div className="d-flex justify-content-between">
                    <h2 className="mb-4 mt-4">Admin Management</h2>
                    <Button variant="primary" className="mb-4 mt-4" onClick={() => toggleCreateAccountForm()}>{buttonText}</Button>
                </div>
                {showCreateAccountForm && (


                    <form>
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label htmlFor="inputState">User Type</label>
                                <Form.Control as="select" required>
                                    <option value="">Select User Type</option>
                                    {userTypes.filter(item => item === 'ADMIN' || item === 'MUNICIPAL_SEG_ADMIN' || item === 'SEG_ADMIN').map(item => <option key={item}>{item}</option>)}
                                </Form.Control>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label htmlFor="inputFirst">First Name</label>
                                <input type="text" className="form-control" id="inputFirst" placeholder="John" required />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="inputLast">Last Name</label>
                                <input type="text" className="form-control" id="inputLast" placeholder="Doe" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label htmlFor="inputEmail">Email</label>
                                <input type="email" className="form-control" id="inputEmail" placeholder="Email" required />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="inputPassword">Password</label>
                                <input type="password" className="form-control" id="inputPassword" placeholder="Password" required />
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
                                <label htmlFor="inputCommunity">Community</label>
                                <Form.Control as="select" required>
                                    <option value="">Select Community</option>
                                    {subSeg
                                        .filter(seg => seg.superSegName?.toUpperCase() === selectedRegion.toUpperCase())
                                        .map(seg => (
                                            <option key={seg.superSegId} value={seg.name}>
                                                {seg.name}
                                            </option>
                                        ))}
                                </Form.Control>
                            </div>
                        </div>


                        <button type="submit" className="btn btn-primary mr-2 mb-2">Submit</button>
                    </form>
                )}

                <Table bordered hover size="sm">
                    <thead className="table-active" >
                        <tr>
                            <th data-sortable scope="col" className="col-3">Email</th>
                            <th scope="col" className="col-1">First</th>
                            <th scope="col" className="col-1">Last</th>
                            <th scope="col" className="col-2">User Type</th>
                            <th scope="col" className="col-4">Primary</th>
                            <th scope="col" className="col-1">Banned</th>
                            <th scope="col" className="col-1">Reviewed</th>
                            <th scope="col" className="col-1">Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((req: IUser, index: number) => (
                            req.userType === "ADMIN" || req.userType === "MUNICIPAL_SEG_ADMIN" || req.userType === "SEG_ADMIN" ? (
                                <tr key={req.id}>
                                    {req.id !== hideControls ?
                                        <>

                                            <td className="text-left align-middle">{req.email}</td>
                                            <td className="text-left align-middle">{req.fname}</td>
                                            <td className="text-left align-middle">{req.lname}</td>
                                            <td className="text-center align-middle">{req.userType}</td>
                                            <td className="text-center align-middle">NOT FOUND</td>

                                            <td className="text-center align-middle">{req.banned ? "Yes" : "No"}</td>
                                            <td className="text-center align-middle">{req.reviewed ? "Yes" : "No"}</td>
                                        </> :
                                        <>
                                            <td className="text-left align-middle"><Form.Control type="text" defaultValue={req.email} onChange={(e) => req.email = e.target.value} /></td>
                                            <td className="text-left align-middle"><Form.Control type="text" defaultValue={req.fname} onChange={(e) => req.fname = e.target.value} /></td>
                                            <td className="text-left align-middle"><Form.Control type="text" defaultValue={req.lname} onChange={(e) => req.lname = e.target.value} /></td>
                                            <td className="text-left align-middle"><Form.Control as="select" onChange={(e) => { (req.userType as String) = e.target.value }}>
                                                <option>{req.userType}</option>
                                                {userTypes.filter(type => type !== req.userType).map(item =>
                                                    <option key={item}>{item}</option>
                                                )}
                                            </Form.Control>
                                            </td>

                                            <td></td>
                                            <td className="text-center align-middle">{req.banned ? "Yes" : "No"}</td>
                                            <td className="text-center align-middle"><Form.Check type="switch" checked={reviewed} onChange={(e) => {
                                                setReviewed(e.target.checked)
                                                req.reviewed = e.target.checked;
                                            }} id="reviewed-switch" />
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
                                                <Dropdown.Item onClick={() => getUserBanHistory(req.id).then(data => {
                                                    setModalUser(req);
                                                    setBanHistory(formatBanHistory(data));
                                                    setShowUserBanHistoryModal(true);
                                                })} >Ban History</Dropdown.Item>

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
            </Form>
            <br></br>
            {/* <UserSegmentHandler/> */}
            {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token} />}
        </Container>
    );
}