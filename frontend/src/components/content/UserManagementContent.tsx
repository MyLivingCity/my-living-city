import React, { useState } from 'react'
import { Card, Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { updateUser } from 'src/lib/api/userRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { IUser } from 'src/lib/types/data/user.type';
import { UserSegmentInfoCard } from '../partials/UserSegmentInfoCard';


interface UserManagementContentProps {
    users: IUser[] | undefined;
    token: string | null;
}

export const UserManagementContent: React.FC<UserManagementContentProps> = ({users, token}) => {
    const [hideControls, setHideControls] = useState('');
    const [showUserSegmentCard, setShowUserSegmentCard] = useState(false);
    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    const [ban ,setBan] = useState<boolean>(false);
    const UserSegmentHandler = (email: string, id: string) => {
        setShowUserSegmentCard(true);
        setEmail(email);
        setId(id);
    }
    const userTypes = Object.keys(USER_TYPES);
        return (
            <Container>
            <Form>
            <h2 className="mb-4 mt-4">User Management</h2>
            <Card>
            <Card.Header>User Management Tool</Card.Header>
            <Card.Body>
            <Table bordered hover size="sm">
            <thead>
                <tr>
                <th scope="col">Email</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">User Type</th>
                <th scope="col">Banned</th>
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
                    <td>{req.banned ? "Yes" : "No" }</td> 
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
                    <td><Form.Check type="switch" checked={ban} onChange={(e)=>{
                        setBan(e.target.checked)
                        req.banned = e.target.checked;
                        }} id="ban-switch"/></td>  
                    </>
                }

                    <td>
                    {req.id !== hideControls ?
                        <NavDropdown title="Controls" id="nav-dropdown">
                            <Dropdown.Item onClick={()=>{
                                setHideControls(req.id);
                                setBan(req.banned);
                                }}>Edit</Dropdown.Item>
                            <Dropdown.Item onClick={()=>UserSegmentHandler(req.email, req.id)}>View Segments</Dropdown.Item>
                        </NavDropdown>
                        : <>
                        <Button size="sm" variant="outline-danger" className="mr-2 mb-2" onClick={()=>setHideControls('')}>Cancel</Button>
                        <Button size="sm" onClick={()=>{
                            setHideControls('');
                            console.log(req);
                            updateUser(req, token);
                            }}>Save</Button>
                        </>
                    }

                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
            </Card.Body>
        </Card>
        </Form>
        <br></br>
        {/* <UserSegmentHandler/> */}
        {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token}/>}
        </Container>
        );
}