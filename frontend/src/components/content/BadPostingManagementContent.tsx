import React, { useContext, useState } from 'react'
import { Card, Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateUser, getUserBanHistory, removeFlagQuarantine, removePostCommentQuarantine } from 'src/lib/api/userRoutes';
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
import { UserManagementModifyWarningModal } from '../modal/UserManagementModifyWarningModal';
import { UserManagementBanHistoryModal } from '../modal/UserManagementBanHistoryModal';
import { IBanUser } from 'src/lib/types/data/banUser.type';
import { format } from 'path';
import { IBadPostingBehavior } from 'src/lib/types/data/badPostingBehavior.type';
import {useBadPostingThreshhold } from 'src/hooks/threshholdHooks';


interface BadPostingManagementContentProps {
    users: IUser[] | undefined;
    token: string | null;
    user: IUser | null;
    flags: IFlag[] | undefined;
    commentFlags: ICommentFlag[] | undefined; 
    badPostingUsers: IBadPostingBehavior[] | undefined;
    ideas: IIdeaWithAggregations[] | undefined;
    proposals: IProposalWithAggregations[] | undefined;
    comments: IComment[] | undefined;
    bans: IBanUser[] | undefined;
}

export const BadPostingManagementContent: React.FC<BadPostingManagementContentProps> = ({users, token, user, flags, commentFlags, ideas, proposals, comments, bans, badPostingUsers}) => {
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
    const {data: badPostingThreshholdData, isLoading: badPostingThreshholdLoading} = useBadPostingThreshhold(token);
    // function userModalInfo(users: IUser[], user: IUser, flags: IFlag[], commentFlags: ICommentFlag[] ){
    //     setShowUserFlagsModal(true);
    // }

    
    console.log("users: ", users)
    console.log("flags: ", flags)
    console.log("Bad Posting Users:  ", badPostingUsers)

    let userBadPostingData: any = [];
    if(users && badPostingUsers){
        userBadPostingData = users.map((user) => {
            const badPostingUser = badPostingUsers.find((badPostingUser) => badPostingUser.userId === user.id);
            console.log("badPostingUser: ", badPostingUser)
            if(badPostingUser){
                return {
                    id: user.id,
                    email: user.email,
                    organization: user.organizationName,
                    firstName: user.fname,
                    lastName: user.lname,
                    userType: user.userType,
                    badPostCount: badPostingUser?.bad_post_count,
                    postFlagCount: badPostingUser?.post_flag_count,
                    banned: badPostingUser?.post_comment_ban,
                    bannedUntil: badPostingUser?.bannedUntil,
                }
            } else {
                return null
            }
        })
        // Remove null values from the array
        userBadPostingData = userBadPostingData.filter((user: any) => user !== null);
    }
    console.log("badPostingData: ", userBadPostingData);


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
            {showUserBanHistoryModal ?
            <UserManagementBanHistoryModal show={showUserBanHistoryModal} setShow={setShowUserBanHistoryModal} modalUser={modalUser!} currentUser={user!} token={token} data={banHistory!}/>
            : null
            }

            <Form>
            <h2 className="mb-4 mt-4">Bad Posting Management</h2>
            <Table bordered hover size="sm">
            <thead className="table-active">
            <tr>
                <th scope="col">Email</th>
                <th scope="col">Organization</th>
                <th scope="col">F Name</th>
                <th scope="col">L Name</th>
                <th scope="col">User Type</th>
                <th scope="col">Bad Posts</th>
                <th scope="col">Posts Flagged</th>
                <th scope="col">Banned</th>
                <th scope="col">Banned Until</th>
                <th scope="col">Controls</th>
                </tr>
            </thead>
            <tbody>
                {/* only show the user if they are banned */}
                {userBadPostingData?.map((req: any, index: number) => {
                    if(badPostingThreshholdData) {
                        if((req.badPostCount + req.postFlagCount) >= badPostingThreshholdData.number || req.banned){
                                return (
                                    <tr key={req.id}>
                            {req.id !== hideControls ? 
                            <>
                            <td>{req.email}</td>
                            <td>{req.organization ? req.organization : "N/A"}</td>
                            <td>{req.firstName}</td>
                            <td>{req.lastName}</td>
                            <td>{req.userType}</td>
                            <td>{req.badPostCount} </td> 
                            <td>{req.postFlagCount} </td>
                            <td>{req.banned ? "Yes" : "No" }</td>
                            <td>{req.bannedUntil ? req.bannedUntil : "N/A"}</td>
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
                                    <Dropdown.Item onClick={() => getUserBanHistory(req.id).then(data => {
                                        setModalUser(req);
                                        setBanHistory(formatBanHistory(data));
                                        setShowUserBanHistoryModal(true);
                                    })} >Ban History</Dropdown.Item>
                                    <Dropdown.Item onClick={() => removeFlagQuarantine(req.id)}>Remove Flag Quarantine</Dropdown.Item>
                                    <Dropdown.Item onClick={() => removePostCommentQuarantine(req.id)}>Remove Post Comment Quarantine</Dropdown.Item>
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
                                )
                            }
                    }
                    
                })}
            </tbody>
            </Table>
        </Form>
        <br></br>
        {/* <UserSegmentHandler/> */}
        {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token}/>}
        </Container>
        );
}