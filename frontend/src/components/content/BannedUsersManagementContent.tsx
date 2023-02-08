import React, { useState } from 'react'
import { Card, Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateCommentStatus } from 'src/lib/api/commentRoutes';
import { updateFalseFlagComment } from 'src/lib/api/flagRoutes';
import { updateUser } from 'src/lib/api/userRoutes';
import { USER_TYPES } from 'src/lib/constants';
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
interface BannedUsersManagementContentProps {
    users: any[] | undefined;
    token: string | null;
    user: IUser | null;
    comments: IComment[] | undefined; 
    ideas: IIdeaWithAggregations[] | undefined;
    commentFlags: ICommentFlag[] | undefined; 
}

export const BannedUsersManagementContent: React.FC<BannedUsersManagementContentProps> = ({users, token, user, comments, ideas, commentFlags}) => {
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
    }

    let userEmail : String[] = [];
    let userFirstName : String[] = [];
    let userLastName : String[] = [];
    let userType: String[] = [];
    let banType: String[] = [];
    let banReason: String[] = [];
    let banMessage: String[] = [];
    let banDate: Date[] = [];
    let banEndDate: Date[] = [];

    if(users){
        for(let i = 0; i < users!.length; i++){
            userEmail.push(users[i].email);
            userFirstName.push(users[i].fname!);
            userLastName.push(users[i].lname!);
            userType.push(users[i].userType!);
            banType.push(users[i].banType!);
            banReason.push(users[i].banReason!);
            banMessage.push(users[i].banMessage!);
            banDate.push(users[i].createdAt!);
            banEndDate.push(users[i].banUntil!);
        }
    }



    const userTypes = Object.keys(USER_TYPES);
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
            <h2 className="mb-4 mt-4">Banned Users Management</h2>
            <Table bordered hover size="sm">
            <thead className="table-active">
                <tr>
                <th scope="col">Email</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">User Type</th>
                <th scope="col">Ban Type</th>
                <th scope="col">Ban Reason</th>
                <th scope="col">Ban Message</th>
                <th scope="col">Ban Date</th>
                <th scope="col">Banned Until</th>
                </tr>
            </thead>
            <tbody>
            {users?.map((req: IComment, index: number) => (
                <tr key={req.id}>
                    {req.id.toString() !== hideControls ? 
                    <>
                    <td>{userEmail[index]}</td>
                    <td>{userFirstName[index]}</td>
                    <td>{userLastName[index]}</td>
                    <td>{userType[index]}</td>
                    <td>{banType[index]}</td>
                    <td>{banReason[index]}</td>
                    <td>{banMessage[index]}</td>
                    <td>{(new Date(banDate[index]).toLocaleDateString())}</td>
                    <td>{(new Date(banEndDate[index])).toLocaleDateString()}</td>
                    </> :<>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><Form.Check type="switch" checked={req.active} onChange={(e)=>{
                        req.active = e.target.checked;
                        setBan(e.target.checked)
                        }} id="ban-switch"/></td>
                        <td><Form.Check type="switch" checked={req.reviewed} onChange={(e)=>{
                        req.reviewed = e.target.checked;
                        setReviewed(e.target.checked)
                        }} id="reviewed-switch"/></td>    
                    </>
                }



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