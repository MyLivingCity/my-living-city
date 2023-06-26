import React, { useState, useEffect } from 'react'
import { Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateUser, getUserBanHistory, removeFlagQuarantine, removePostCommentQuarantine, deleteUser } from 'src/lib/api/userRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { IComment } from 'src/lib/types/data/comment.type';
import { ICommentFlag, IFlag } from 'src/lib/types/data/flag.type';
import { IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { IProposalWithAggregations } from 'src/lib/types/data/proposal.type';
import { IUser } from 'src/lib/types/data/user.type';
import UserFlagsModal from '../partials/SingleIdeaContent/UserFlagsModal';
import { UserSegmentInfoCard } from '../partials/UserSegmentInfoCard';
import { UserManagementBanModal } from '../modal/UserManagementBanModal';
import { UserManagementUnbanModal } from '../modal/UserManagementUnbanModal';
import { UserManagementBanHistoryModal } from '../modal/UserManagementBanHistoryModal';
import { IBanUser } from 'src/lib/types/data/banUser.type';


interface UserManagementContentProps {
    users: IUser[] | undefined;
    token: string | null;
    user: IUser | null;
    flags: IFlag[] | undefined;
    commentFlags: ICommentFlag[] | undefined; 
    ideas: IIdeaWithAggregations[] | undefined;
    proposals: IProposalWithAggregations[] | undefined;
    comments: IComment[] | undefined;
    bans: IBanUser[] | undefined;
}

export const UserManagementContent: React.FC<UserManagementContentProps> = ({users, token, user, flags, commentFlags, ideas, proposals, comments, bans}) => {
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
    const [municipalFilteredUsers, setMunicipalFilteredUsers] = useState<IUser[]>([]);
    const [hideControls, setHideControls] = useState('');
    const [showUserSegmentCard, setShowUserSegmentCard] = useState(false);
    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    // const [ban ,setBan] = useState<boolean>(false);
    const [reviewed, setReviewed] = useState<boolean>(false);
    const [showUserFlagsModal, setShowUserFlagsModal] = useState<boolean>(false);
    const [showUserBanModal, setShowUserBanModal] = useState<boolean>(false);
    const [showUserUnbanModal, setShowUserUnbanModal] = useState<boolean>(false);
    const [showUserBanHistoryModal, setShowUserBanHistoryModal] = useState<boolean>(false);
    const [modalUser, setModalUser] = useState<IUser>();
    const [banHistory, setBanHistory] = useState<any>();
    const UserSegmentHandler = (email: string, id: string) => {
        setShowUserSegmentCard(true);
        setEmail(email);
        setId(id);
    }
    // function userModalInfo(users: IUser[], user: IUser, flags: IFlag[], commentFlags: ICommentFlag[] ){
    //     setShowUserFlagsModal(true);
    // }

    function formatBanHistory(banhistory: any){

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
            } else if (ban.type === 'COMMENT'){
                return (
                    <tr>
                        <td>Ban Reason: {ban.reason}</td>
                        <td>Moderator Message: {ban.message}</td>
                        <td>Moderator ID: {ban.modId}</td>
                        <td>Banned At: {ban.createdAt}</td>
                    </tr>
                )
            } else if (ban.type === 'IDEA'){
                return (
                    <tr>
                        <td>Ban Reason: {ban.reason}</td>
                        <td>Moderator Message: {ban.message}</td>
                        <td>Moderator ID: {ban.modId}</td>
                        <td>Banned At: {ban.createdAt}</td>
                    </tr>
                )
            } else {
                return<tr><td>Invalid</td></tr>;
            }
        });
        return banHistory;
    }

    let userFalseFlags: number[] = []
    let userFlags: number[] = []
    if(users && flags){
        for(let i = 0; i < users.length; i++){
            let counter = 0;
            let flagCounter = 0;
            for(let z = 0; z < flags.length; z++){
                if(users[i].id === flags[z].flaggerId && flags[z].falseFlag === true){
                    counter++
                    flagCounter++
                }else if(users[i].id === flags[z].flaggerId){
                    flagCounter++
                }
            }
            userFalseFlags.push(counter);
            userFlags.push(flagCounter);
        }
    }
    if(users && commentFlags){
        for(let i = 0; i < users.length; i++){
            let counter = 0;
            let flagCounter = 0;
            for(let z = 0; z < commentFlags.length; z++){
                if(users[i].id === commentFlags[z].flaggerId && commentFlags[z].falseFlag === true){
                    counter++
                    flagCounter++
                } else if(users[i].id === commentFlags[z].flaggerId){
                    flagCounter++
                }
            }
            userFalseFlags[i] = userFalseFlags[i] + counter;
            userFlags[i] = userFlags[i] + flagCounter;
        }
    }
    const userTypes = Object.keys(USER_TYPES);

    const userHomeSegment = user?.userSegments?.homeSegmentName;

    const handleDeleteUser = async (userId: string) => {
        try {
          await deleteUser(userId, token);
          console.log('User deleted successfully!');
          // Remove the deleted user from the filteredUsers state
          setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
        } catch (error) {
          console.error('Error deleting user:', error);
          // Handle error state or show error message to the user
        }
      };

      useEffect(() => {
        if (users) {
          // Filter out specific user types or conditions if needed
          const filteredUsers = users.filter(
            (user) =>
              user.userType !== 'ADMIN' &&
              user.userType !== 'MOD' &&
              user.userType !== 'SEG_MOD' &&
              user.userType !== 'MUNICIPAL_SEG_ADMIN' &&
              user.userType !== 'SEG_ADMIN'
          );
          setFilteredUsers(filteredUsers);
        }
      }, [users]);

      useEffect(() => {
        if (users) {
          // Filter out specific user types or conditions if needed
          const municipalFilteredUsers = users.filter(
            (user) =>
              user.userType === 'MUNICIPAL' &&
              user.userSegments?.homeSegmentName === userHomeSegment
          );
          setMunicipalFilteredUsers(municipalFilteredUsers);
        }
      }, [users]);

      if (user?.userType === USER_TYPES.MUNICIPAL_SEG_ADMIN) {
        return (
            <Container style={{maxWidth: '100%', marginLeft: 50}}>
            {showUserFlagsModal ?
            <UserFlagsModal show={showUserFlagsModal} setShow={setShowUserFlagsModal} user={modalUser!} flags={flags} commentFlags={commentFlags} ideas={ideas} proposals={proposals} comments={comments}/>
            : null
             }
            {showUserBanModal ?
            <UserManagementBanModal show={showUserBanModal} setShow={setShowUserBanModal} modalUser={modalUser!} currentUser={user!} token={token}/>
            : null
            }
            {showUserUnbanModal ?
            <UserManagementUnbanModal show={showUserUnbanModal} setShow={setShowUserUnbanModal} modalUser={modalUser!} currentUser={user!} token={token} />
            : null
            }
            {showUserBanHistoryModal ?
            <UserManagementBanHistoryModal show={showUserBanHistoryModal} setShow={setShowUserBanHistoryModal} modalUser={modalUser!} currentUser={user!} token={token} data={banHistory!}/>
            : null
            }

            <Form>
            <h2 className="mb-4 mt-4">User Management</h2>
            <Table bordered hover size="sm">
            <thead className="table-active">
            <tr>
                <th scope="col" className="text-center align-middle">Email</th>
                <th scope="col" className="text-center align-middle">Department</th>
                <th scope="col" className="text-center align-middle">First</th>
                <th scope="col" className="text-center align-middle">Last</th>
                <th scope="col" className="text-center align-middle">User Type</th>
                <th scope="col" className="text-center align-middle">Controls</th>
                </tr>
            </thead>
            <tbody>
            {municipalFilteredUsers?.map((req: IUser, index: number) => (
                  req.userType === 'MUNICIPAL' && req.userSegments?.homeSegmentName === userHomeSegment ? (
                <tr key={req.id}>
                    {req.id !== hideControls ? 
                    <>
                    <td className="align-middle">{req.email}</td>
                    <td className="text-center align-middle">{req.organizationName ? req.organizationName : "N/A"}</td>
                    <td className="text-center align-middle">{req.fname}</td>
                    <td className="text-center align-middle">{req.lname}</td>
                    <td className="text-center align-middle">{req.userType}</td>
                    </> :
                    <>
                    <td><Form.Control type="text" defaultValue={req.email} onChange={(e)=>req.email = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.organizationName} onChange={(e)=>req.organizationName = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.fname} onChange={(e)=>req.fname = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.lname} onChange={(e)=>req.lname = e.target.value}/></td>
                    <td><Form.Control as="select" onChange={(e)=>{(req.userType as string) = e.target.value}}>
                        {userTypes
                        .filter(type => type !== req.userType)
                        .filter((type => type === "MUNICIPAL"))
                        .map(item =>
                            <option key={item}>{item}</option>
                        )}
                        </Form.Control>
                    </td>
                    <td className="text-center align-middle "><Button onClick={()=> setShowUserFlagsModal(true)}>Info</Button></td>
                    <td></td>
                    </>
                    }

                    <td>
                    {req.id !== hideControls ? 
                        <NavDropdown title="Controls" id="nav-dropdown">
                            <Dropdown.Item onClick={()=>{
                                setHideControls(req.id);
                                setReviewed(req.reviewed);
                                setModalUser(req);
                                }}>Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                                                const confirmed = window.confirm("Are you sure you want to delete this user?");
                                                if (confirmed) {
                                                    handleDeleteUser(req.id);
                                                }
                                            }} className="text-danger">
                                                Delete
                                            </Dropdown.Item>
                        </NavDropdown>
                        : <>
                        <div className="d-flex justify-content-between">
                        <Button size="sm" variant="outline-danger" className="mr-2 mb-2 text-center align-middle" onClick={()=>setHideControls('')}>Cancel</Button>
                        <Button size="sm"  className="mr-2 mb-2 text-center align-middle" onClick={()=>{
                            setHideControls('');
                            
                            updateUser(req, token, user);
                            }}>Save</Button>
                            </div>
                        </>
                    }

                    </td>
                </tr>
                ): null))}
            </tbody>
            </Table>
        </Form>
        <br></br>
        {/* <UserSegmentHandler/> */}
        {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token}/>}
        </Container>
        );
    } else { 
        return (
            <Container style={{maxWidth: '100%', marginLeft: 50}}>
            {showUserFlagsModal ?
            <UserFlagsModal show={showUserFlagsModal} setShow={setShowUserFlagsModal} user={modalUser!} flags={flags} commentFlags={commentFlags} ideas={ideas} proposals={proposals} comments={comments}/>
            : null
             }
            {showUserBanModal ?
            <UserManagementBanModal show={showUserBanModal} setShow={setShowUserBanModal} modalUser={modalUser!} currentUser={user!} token={token}/>
            : null
            }
            {showUserUnbanModal ?
            <UserManagementUnbanModal show={showUserUnbanModal} setShow={setShowUserUnbanModal} modalUser={modalUser!} currentUser={user!} token={token} />
            : null
            }
            {showUserBanHistoryModal ?
            <UserManagementBanHistoryModal show={showUserBanHistoryModal} setShow={setShowUserBanHistoryModal} modalUser={modalUser!} currentUser={user!} token={token} data={banHistory!}/>
            : null
            }

            <Form>
            <h2 className="mb-4 mt-4">User Management</h2>
            <Table bordered hover size="sm">
            <thead className="table-active">
            <tr>
                <th scope="col" className="text-center align-middle">Email</th>
                <th scope="col" className="text-center align-middle">Organization</th>
                <th scope="col" className="text-center align-middle">First</th>
                <th scope="col" className="text-center align-middle">Last</th>
                <th scope="col" className="text-center align-middle">User Type</th>
                <th scope="col" className="text-center align-middle">Total Flags</th>
                <th scope="col" className="text-center align-middle">False Flags</th>
                <th scope="col" className="text-center align-middle">Banned</th>
                <th scope="col" className="text-center align-middle">Reviewed</th>
                <th scope="col" className="text-center align-middle">Controls</th>
                </tr>
            </thead>
            <tbody>
            {filteredUsers?.map((req: IUser, index: number) => (
                  req.userType !== "ADMIN" && req.userType !== "MOD" && req.userType !== "SEG_MOD" && req.userType !== "MUNICIPAL_SEG_ADMIN" && req.userType !== "SEG_ADMIN" ? (
                <tr key={req.id}>
                    {req.id !== hideControls ? 
                    <>
                    <td className="align-middle">{req.email}</td>
                    <td className="text-center align-middle">{req.organizationName ? req.organizationName : "N/A"}</td>
                    <td className="text-center align-middle">{req.fname}</td>
                    <td className="text-center align-middle">{req.lname}</td>
                    <td className="text-center align-middle">{req.userType}</td>
                    <td className="text-center align-middle">{userFlags![index].toString()}</td>
                    <td className="text-center align-middle">{userFalseFlags![index].toString()}</td>
                    <td className="text-center align-middle">{req.banned ? "Yes" : "No" }</td> 
                    <td className="text-center align-middle">{req.reviewed ? "Yes" : "No"}</td>
                    </> :
                    <>
                    <td><Form.Control type="text" defaultValue={req.email} onChange={(e)=>req.email = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.organizationName} onChange={(e)=>req.organizationName = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.fname} onChange={(e)=>req.fname = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.lname} onChange={(e)=>req.lname = e.target.value}/></td>
                    <td><Form.Control as="select" onChange={(e)=>{(req.userType as string) = e.target.value}}>
                        {userTypes
                        .filter(type => type !== req.userType)
                        .filter((type => type !== "ADMIN"))
                        .filter((type => type !== "SEG_ADMIN"))
                        .filter((type => type !== "MUNICIPAL_SEG_ADMIN"))
                        .filter((type => type !== "DEVELOPER"))
                        .filter((type => type !== "IN_PROGRESS"))
                        .filter((type => type !== "ASSOCIATE"))
                        .map(item =>
                            <option key={item}>{item}</option>
                        )}
                        </Form.Control>
                    </td>
                    <td className="text-center align-middle "><Button onClick={()=> setShowUserFlagsModal(true)}>Info</Button></td>
                    <td></td>
                    <td className="text-center align-middle">{req.banned ? "Yes" : "No" }</td>
                    <td className="text-center align-middle" ><Form.Check type="switch" checked={reviewed} onChange={(e)=>{
                        setReviewed(e.target.checked)
                        req.reviewed = e.target.checked;
                        }} id="reviewed-switch"/>
                    </td>    
                    </>
                    }

                    <td>
                    {req.id !== hideControls ? 
                        <NavDropdown title="Controls" id="nav-dropdown">
                            <Dropdown.Item onClick={()=>{
                                setHideControls(req.id);
                                setReviewed(req.reviewed);
                                setModalUser(req);
                                }}>Edit</Dropdown.Item>
                            <Dropdown.Item onClick={()=>
                                UserSegmentHandler(req.email, req.id)
                                }>View Segments</Dropdown.Item>
                            {req.banned ? 
                                <Dropdown.Item onClick={()=> {
                                    setModalUser(req);
                                    setShowUserUnbanModal(true);
                                }}>Modify Ban</Dropdown.Item>
                                :
                                <Dropdown.Item onClick={()=> {
                                    setModalUser(req);
                                    setShowUserBanModal(true);
                                }}>Ban User</Dropdown.Item>
                            }
                            <Dropdown.Item onClick={() => getUserBanHistory(req.id).then(data => {
                                setModalUser(req);
                                setBanHistory(formatBanHistory(data));
                                setShowUserBanHistoryModal(true);
                            })} >Ban History</Dropdown.Item>
                            <Dropdown.Item onClick={() => removeFlagQuarantine(req.id)}>Remove Flag Quarantine</Dropdown.Item>
                            <Dropdown.Item onClick={() => removePostCommentQuarantine(req.id)}>Remove Post Comment Quarantine</Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                                                const confirmed = window.confirm("Are you sure you want to delete this user?");
                                                if (confirmed) {
                                                    handleDeleteUser(req.id);
                                                }
                                            }} className="text-danger">
                                                Delete
                                            </Dropdown.Item>
                        </NavDropdown>
                        : <>
                        <div className="d-flex justify-content-between">
                        <Button size="sm" variant="outline-danger" className="mr-2 mb-2 text-center align-middle" onClick={()=>setHideControls('')}>Cancel</Button>
                        <Button size="sm"  className="mr-2 mb-2 text-center align-middle" onClick={()=>{
                            setHideControls('');
                            
                            updateUser(req, token, user);
                            }}>Save</Button>
                            </div>
                        </>
                    }

                    </td>
                </tr>
                ): null))}
            </tbody>
            </Table>
        </Form>
        <br></br>
        {/* <UserSegmentHandler/> */}
        {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token}/>}
        </Container>
        );
    }
}