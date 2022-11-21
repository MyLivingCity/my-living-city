import React, { useState } from 'react'
import { Card, Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateUser } from 'src/lib/api/userRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { IComment } from 'src/lib/types/data/comment.type';
import { ICommentFlag, IFlag } from 'src/lib/types/data/flag.type';
import { IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { IProposalWithAggregations } from 'src/lib/types/data/proposal.type';
import { IUser } from 'src/lib/types/data/user.type';
import UserFlagsModal from '../partials/SingleIdeaContent/UserFlagsModal';
import { UserSegmentInfoCard } from '../partials/UserSegmentInfoCard';
import { UserManagementBanModal } from '../partials/UserManagementBanModal';
import { UserManagementUnbanModal } from '../partials/UserManagementUnbanModal';
import { UserManagementModifyWarningModal } from '../partials/UserManagementModifyWarningModal';
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
    const [hideControls, setHideControls] = useState('');
    const [showUserSegmentCard, setShowUserSegmentCard] = useState(false);
    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    // const [ban ,setBan] = useState<boolean>(false);
    const [reviewed, setReviewed] = useState<boolean>(false);
    const [showUserFlagsModal, setShowUserFlagsModal] = useState<boolean>(false);
    const [showUserBanModal, setShowUserBanModal] = useState<boolean>(false);
    const [showUserUnbanModal, setShowUserUnbanModal] = useState<boolean>(false);
    const [modalUser, setModalUser] = useState<IUser>();
    const UserSegmentHandler = (email: string, id: string) => {
        setShowUserSegmentCard(true);
        setEmail(email);
        setId(id);
    }
    // function userModalInfo(users: IUser[], user: IUser, flags: IFlag[], commentFlags: ICommentFlag[] ){
    //     setShowUserFlagsModal(true);
    // }

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
        return (
            <Container style={{maxWidth: '80%', marginLeft: 50}}>
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

            <Form>
            <h2 className="mb-4 mt-4">User Management</h2>
            <Table bordered hover size="sm">
            <thead className="table-active">
            <tr>
                <th scope="col">Email</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">User Type</th>
                <th scope="col">Total Flags</th>
                <th scope="col">False Flags</th>
                <th scope="col">Banned</th>
                <th scope="col">Reviewed</th>
                <th scope="col">Controls</th>
                </tr>
            </thead>
            <tbody>
            {users?.map((req: IUser, index: number) => (
                
                <tr key={req.id}>
                    {req.id !== hideControls ? 
                    <>
                    <td>{req.email}</td>
                    <td>{req.fname}</td>
                    <td>{req.lname}</td>
                    <td>{req.userType}</td>
                    <td>{userFlags![index].toString()}</td>
                    <td>{userFalseFlags![index].toString()}</td>
                    <td>{req.banned ? "Yes" : "No" }</td> 
                    <td>{req.reviewed ? "Yes" : "No"}</td>
                    </> :
                    <>
                    <td><Form.Control type="text" defaultValue={req.email} onChange={(e)=>req.email = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.fname} onChange={(e)=>req.fname = e.target.value}/></td>
                    <td><Form.Control type="text" defaultValue={req.lname} onChange={(e)=>req.lname = e.target.value}/></td>
                    <td><Form.Control as="select" onChange={(e)=>{(req.userType as String) = e.target.value}}>
                        <option>{req.userType}</option>
                        {userTypes.filter(type => type !== req.userType).map(item =>
                            <option key={item}>{item}</option>
                        )}
                        </Form.Control>
                    </td>
                    <td><Button onClick={()=> setShowUserFlagsModal(true)}>More Details</Button></td>
                    <td></td>
                    <td>{req.banned ? "Yes" : "No" }</td>
                    <td><Form.Check type="switch" checked={reviewed} onChange={(e)=>{
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
                        </NavDropdown>
                        : <>
                        <Button size="sm" variant="outline-danger" className="mr-2 mb-2" onClick={()=>setHideControls('')}>Cancel</Button>
                        <Button size="sm" onClick={()=>{
                            setHideControls('');
                            
                            updateUser(req, token, user);
                            }}>Save</Button>
                        </>
                    }

                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        </Form>
        <br></br>
        {/* <UserSegmentHandler/> */}
        {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token}/>}
        </Container>
        );
}