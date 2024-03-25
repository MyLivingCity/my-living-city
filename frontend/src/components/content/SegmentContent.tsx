import React, { useState, useEffect } from 'react';
import { Table, Dropdown, Container, NavDropdown, Card, Row, Col, Pagination } from 'react-bootstrap';
import { deleteUser } from 'src/lib/api/userRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { IUser } from 'src/lib/types/data/user.type';
import { EditUserInfoModal } from '../modal/EditUserInfoModal';
import { ShowSubSegments } from './SegmentManagementContent';
import { useAllSegments, useAllSubSegmentsWithId, useAllSuperSegments, useSegmentsUsers, useSingleSegmentBySegmentId } from 'src/hooks/segmentHooks';

interface SegmentContentProps {
    token: string;
    user: IUser | null;
    segId: number;
}

const userTypes = Object.keys(USER_TYPES);
const ITEMS_PER_PAGE = 4;

export const SegmentContent: React.FC<SegmentContentProps> = ({token, user, segId}) => {
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);

    const { data: subSegData, isLoading: subSegLoading } = useAllSubSegmentsWithId(String(segId));
    const { data: segmentData, isLoading: segmentLoading } = useSingleSegmentBySegmentId(segId);
    const { data: modalSegData = [], isLoading: modalSegLoading } = useAllSuperSegments();
    const { data: modalSubSegData = [], isLoading: modalSubSegLoading } = useAllSegments();

    const {data: segmentUserData, isLoading: segmentUserLoading} = useSegmentsUsers(segId);
    console.log('segmentUserData', segmentUserData);

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

    const handleUpdatedLocalUserData = (updatedUser: IUser) => {
        setFilteredUsers(
            filteredUsers.map((user) => {
                if (user.id === updatedUser.id) {
                    return updatedUser;
                }
                return user;
            })
        );
    };

    const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);
    const [modalUser, setModalUser] = useState<IUser>();

    const [paginationitems, setPaginationItems] = useState<any>([]);
    const [active, setActive] = useState<number>(1);

    useEffect(() => {
        let newItems = [];
        if (segmentUserData && segmentUserData?.residents.length !== 0) {
            let totalPages = Math.ceil(segmentUserData?.residents.length / ITEMS_PER_PAGE);
            newItems.push(
                <Pagination.First
                    key='first'
                    onClick={() => setActive(1)}
                />
            );
            newItems.push(
                <Pagination.Prev
                    key='prev'
                    onClick={() => setActive(Math.max((active - 1), 1) || 1)}
                />
            );

            // Calculate the first item in the pagination
            let firstItem = (() => {
                if (active <= 3) {
                    return 1;
                }
                let pagesLeft = totalPages - active;
                if (pagesLeft <= 2) {
                    return active - 4 + pagesLeft;
                }
                return active - 2;
            })();
            for (let number = firstItem; number <= totalPages && number <= firstItem + 4; number++) {
                newItems.push(
                    <Pagination.Item
                        key={number}
                        active={number === active}
                        onClick={() => setActive(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }
            newItems.push(
                <Pagination.Next
                    key='next'
                    onClick={() => setActive(Math.min((active + 1), totalPages) || 1)}
                />
            );
            newItems.push(
                <Pagination.Last
                    key='last'
                    onClick={() => setActive(totalPages)}
                />
            );
            setPaginationItems(newItems);
        }
    }, [segmentUserData, active]);

    return (
        <Container style={{ maxWidth: '1600px', margin: 'auto' }}>
            {showEditUserModal ?
                <EditUserInfoModal show={showEditUserModal} setShow={setShowEditUserModal} modalUser={modalUser!} currentUser={user!} token={token} segs={modalSegData} subSeg={modalSubSegData} changesSaved={handleUpdatedLocalUserData} />
                : null
            }

            <div className='d-flex justify-content-between'>
                <h2 className='mb-4 mt-4'>Segment Management</h2>
                {/* <Button variant='primary' className='mb-4 mt-4' onClick={() => toggleEditSegmentInfoForm()}>Edit</Button> */}
            </div>

            <Card>
                <Card.Header className='text-capitalize'>{segmentData?.name} Segment Info</Card.Header>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col>Id: {segmentData?.segId}</Col>
                            <Col>Name: {segmentData?.name}</Col>
                        </Row>
                        <Row>
                            <Col>Country: {segmentData?.country}</Col>
                            <Col>Province: {segmentData?.province}</Col>
                        </Row>
                        <Row>
                            <Col>Super Segment: {segmentData?.superSegName}</Col>
                        </Row>
                        <Row>
                            <Col>Created At: {new Date(segmentData?.createdAt || '').toLocaleDateString()}</Col>
                            <Col>Updated At: {new Date(segmentData?.updatedAt || '').toLocaleDateString()}</Col>
                        </Row>
                    </Container> 
                </Card.Body>    
            </Card>

            <br />

            <ShowSubSegments data={subSegData} segId={Number(segId) || 1} token={token} segName={segmentData?.name} />

            <br />
            <h4>Home Segment Users</h4>
            <Pagination>
                {paginationitems}
            </Pagination>
            <Table bordered hover size='sm' style={{ fontSize: '0.8rem' }}>
                <thead className='table-active'>
                    <tr>
                        <th scope='col' className='text-center align-middle'>Email</th>
                        <th scope='col' className='text-center align-middle'>Organization</th>
                        <th scope='col' className='text-center align-middle'>First</th>
                        <th scope='col' className='text-center align-middle'>Last</th>
                        <th scope='col' className='text-center align-middle'>User Type</th>
                        <th scope='col' className='text-center align-middle'>Banned</th>
                        <th scope='col' className='text-center align-middle'>Reviewed</th>
                        <th scope='col' className='text-center align-middle'>Verified</th>
                        <th scope='col' className='text-center align-middle'>Controls</th>
                    </tr>
                </thead>
                <tbody>
                    {segmentUserData?.residents
                        .filter((_, index) => index >= (active - 1) * ITEMS_PER_PAGE && index < active * ITEMS_PER_PAGE)
                        .map((req: IUser, index: number) => (
                            <tr
                                key={req.id}
                                onClick={() => {
                                    setShowEditUserModal(true);
                                    setModalUser(req);
                                }}>
                                <td className='align-middle' style={{wordBreak: 'break-word'}}>{req.email}</td>
                                <td className='text-center align-middle'>{req.organizationName ? req.organizationName : 'N/A'}</td>
                                <td className='text-center align-middle'>{req.fname}</td>
                                <td className='text-center align-middle'>{req.lname}</td>
                                <td className='text-center align-middle'>{req.userType}</td>
                                <td className='text-center align-middle'>{req.banned ? 'Yes' : 'No' }</td> 
                                <td className='text-center align-middle'>{req.reviewed ? 'Yes' : 'No'}</td>
                                <td className='text-center align-middle'>{req.verified ? 'Yes' : 'No'}</td>

                                <td onClick={e => e.stopPropagation()}>
                                    <NavDropdown title='Controls' id='nav-dropdown'>
                                        <Dropdown.Item
                                            onClick={() => {
                                                const confirmed = window.confirm('Are you sure you want to delete this user?');
                                                if (confirmed) {
                                                    handleDeleteUser(req.id);
                                                }
                                            }}
                                            className='text-danger'>
                                        Delete
                                        </Dropdown.Item>
                                    </NavDropdown>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
            <br />
        </Container>
        
    );
    
};