import React, { useState } from 'react';
import { Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateCommentStatus } from 'src/lib/api/commentRoutes';
import { updateFalseFlagComment } from 'src/lib/api/flagRoutes';
import { incrementBadPostCount } from 'src/lib/api/badPostingBehaviorRoutes';
import { IComment } from 'src/lib/types/data/comment.type';
import { ICommentFlag } from 'src/lib/types/data/flag.type';
import { IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { IUser } from 'src/lib/types/data/user.type';
import { CommentBanModal } from '../modal/CommentBanModal';
import { CommentUnbanModal } from '../modal/CommentUnbanModal';
import { UserSegmentInfoCard } from '../partials/UserSegmentInfoCard';

// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO 
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO 
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO 
interface CommentManagementContentProps {
    users: IUser[] | undefined;
    token: string | null;
    user: IUser | null;
    comments: IComment[] | undefined; 
    ideas: IIdeaWithAggregations[] | undefined;
    commentFlags: ICommentFlag[] | undefined; 
}

export const CommentManagementContent: React.FC<CommentManagementContentProps> = ({users, token, user, comments, ideas, commentFlags}) => {
    const [hideControls, setHideControls] = useState('');
    const [showUserSegmentCard, setShowUserSegmentCard] = useState(false);
    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    const [banModalCommentData, setBanModalCommentData] = useState<IComment>();
    const [banModalAuthorName, setBanModalAuthorName] = useState('');
    const [banModalPostLink, setBanModalPostLink] = useState('');
    const [showCommentBanModal, setShowCommentBanModal] = useState<boolean>(false);
    const [showCommentUnbanModal, setShowCommentUnbanModal] = useState<boolean>(false);
    const [ban ,setBan] = useState<boolean>(false);
    const [active, setActive] = useState<boolean>(false);
    const [reviewed, setReviewed] = useState<boolean>(false);
    const UserSegmentHandler = (email: string, id: string) => {
        setShowUserSegmentCard(true);
        setEmail(email);
        setId(id);
    };
    let userEmail: String[] = [];
    let userName: String[] = [];
    let commentType: String[] = [];
    let commentNumFlags: number[] = [];
    if(comments && users){
        for(let i = 0; i < comments!.length; i++){
            for(let z = 0; z < users!.length; z++){
                if(comments[i].authorId!.toString() === users[z].id.toString()){
                    userEmail.push(users[z].email);
                    userName.push(users[z].fname!);
                }
            }
        }
    }
    if(comments && ideas){
        for(let i = 0; i < comments!.length; i++){
            for(let z = 0; z < ideas!.length; z++){
                if(comments[i].ideaId.toString() === ideas[z].id.toString()){
                    commentType.push(ideas[z].state);
                }
            }
        }
    }
    if(comments && commentFlags){
        for(let i = 0; i < comments!.length; i++){
            let counter = 0;
            for(let z = 0; z < commentFlags!.length; z++){
                if(comments[i].id === commentFlags[z].commentId){
                    counter++;
                }
            }
            commentNumFlags.push(counter);
        }
    }
    const ideaURL = '/ideas/';
    return (
        <Container style={{maxWidth: '80%', marginLeft: 50}}>
            {showCommentBanModal ?
                <CommentBanModal show={showCommentBanModal} setShow={setShowCommentBanModal} comment={banModalCommentData!} authorName={banModalAuthorName} postLink={banModalPostLink} token={token}/>
                :
                null
            }
            {showCommentUnbanModal ?
                <CommentUnbanModal show={showCommentUnbanModal} setShow={setShowCommentUnbanModal} comment={banModalCommentData!} token={token}/>
                :
                null
            }
            <Form>
                <h2 className='mb-4 mt-4'>Comment Management</h2>
                <Table bordered hover size='sm'>
                    <thead className='table-active'>
                        <tr>
                            <th scope='col'>User Email</th>
                            <th scope='col'>User Name</th>
                            <th scope='col'>Post Type</th>
                            <th scope='col'>Post Link</th>
                            <th scope='col'>Comment Contents</th>
                            <th scope='col'>Number of Flags</th>
                            <th scope='col'>Region</th>
                            <th scope='col'>Active</th>
                            <th scope='col'>Reviewed</th>
                            <th scope='col'>Quarantined Date</th>
                            <th scope='col'>Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments?.map((req: IComment, index: number) => (
                            <tr key={req.id}>
                                {req.id.toString() !== hideControls ? 
                                    <>
                                        <td>{userEmail[index]}</td>
                    
                                        <td>{userName[index]}</td>
                                        <td>{commentType[index]}</td>
                                        <td>{<a href= {ideaURL + req.ideaId}>Link</a>}</td>
                                        <td>{req.content}</td> 
                                        <td>{commentNumFlags[index].toString()}</td>
                                        <td>{'CRD'}</td>
                                        <td>{req.active ? 'Yes' : 'No'}</td>
                                        <td>{req.reviewed ? 'Yes' : 'No'}</td>
                                        <td>{(new Date(req.quarantined_at)).toLocaleDateString()}</td>
                                    </> :<>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td><Form.Check
                                            type='switch'
                                            checked={req.active}
                                            onChange={(e)=>{
                                                req.active = e.target.checked;
                                                setBan(e.target.checked);
                                            }}
                                            id='ban-switch'/></td>
                                        <td><Form.Check
                                            type='switch'
                                            checked={req.reviewed}
                                            onChange={(e)=>{
                                                req.reviewed = e.target.checked;
                                                setReviewed(e.target.checked);
                                            }}
                                            id='reviewed-switch'/></td>    
                                    </>
                                }

                                <td>
                                    {req.id.toString() !== hideControls ?
                                        <NavDropdown title='Controls' id='nav-dropdown'>
                                            {/* <Dropdown.Item onClick={()=>{
                                setHideControls(req.id.toString());
                                setBan(req.active);
                                setReviewed(req.reviewed);
                                }}>Edit</Dropdown.Item> */}
                                            {req.bannedComment ?    
                                                <Dropdown.Item
                                                    onClick={()=>{
                                                        setBanModalCommentData(req);
                                                        setShowCommentUnbanModal(true);
                                                    }}>Unban Comment
                                                </Dropdown.Item> :
                                                <>
                                                    <Dropdown.Item
                                                        onClick={()=>{
                                                            setBanModalCommentData(req);
                                                            setBanModalPostLink(ideaURL + req.ideaId);
                                                            setBanModalAuthorName(userName[index].toString());
                                                            setShowCommentBanModal(true);
                                                            incrementBadPostCount(token, req.id.toString());
                                                        }}>Ban Comment
                                                    </Dropdown.Item>
                                                    {req.reviewed && req.active ?
                                                        <Dropdown.Item
                                                            onClick={()=>{
                                                                updateFalseFlagComment(parseInt(req.id.toString()), token!, false);
                                                                setActive(req.active=false);
                                                                setReviewed(req.reviewed=false);
                                                                updateCommentStatus(token, req.id.toString(), req.active, req.reviewed, req.bannedComment, req.quarantined_at);
                                                            }}>Quarantine Idea
                                                        </Dropdown.Item>
                                                        :
                                                        <Dropdown.Item
                                                            onClick={()=>{
                                                                updateFalseFlagComment(parseInt(req.id.toString()), token!, true);
                                                                setActive(req.active=true);
                                                                setReviewed(req.reviewed=true);
                                                                updateCommentStatus(token, req.id.toString(), req.active, req.reviewed, req.bannedComment, req.quarantined_at);
                                                            }}>Remove from Quarantine
                                                        </Dropdown.Item>
                                                    }
                                                </>
                                            }
                                        </NavDropdown>
                                        : <>
                                            <Button size='sm' variant='outline-danger' className='mr-2 mb-2' onClick={()=>setHideControls('')}>Cancel</Button>
                                            <Button
                                                size='sm'
                                                onClick={()=>{
                                                    setHideControls('');
                                                    if(req.active === true && req.reviewed === true){
                                                        updateFalseFlagComment(parseInt(req.id.toString()), token!, true);
                                                    }else{
                                                        updateFalseFlagComment(parseInt(req.id.toString()), token!, false);
                                                    }
                                                    updateCommentStatus(token, req.id.toString(), req.active, req.reviewed, false, req.quarantined_at);
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
};