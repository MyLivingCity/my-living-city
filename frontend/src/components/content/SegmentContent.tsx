import React, { useState, useEffect } from 'react';
import { Table, Container, Card, Row, Col, Pagination, Form } from 'react-bootstrap';
import { USER_TYPES } from 'src/lib/constants';
import { IUser } from 'src/lib/types/data/user.type';
import { EditUserInfoModal } from '../modal/EditUserInfoModal';
import { ShowSubSegments } from './SegmentManagementContent';
import { useAllSegments, useAllSubSegmentsWithId, useAllSuperSegments, useSegmentsUsers, useSingleSegmentBySegmentId } from 'src/hooks/segmentHooks';
import LoadingSpinnerInline from '../ui/LoadingSpinnerInline';
import { getAllRegularUsers } from 'src/lib/api/userRoutes';

interface SegmentContentProps {
    token: string;
    user: IUser | null;
    segId: number;
}

const userTypes = Object.keys(USER_TYPES);
const ITEMS_PER_PAGE = 10;

const segmentTypes = ['All', 'Home', 'Work', 'School', 'None'];

const makePaginationItems = (totalItems: number, currentPage: number, setActive: (value: React.SetStateAction<number>) => void): JSX.Element[] => {
    let newItems = [];
    let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    newItems.push(
        <Pagination.First
            key='first'
            onClick={() => setActive(1)}
        />
    );
    newItems.push(
        <Pagination.Prev
            key='prev'
            onClick={() => setActive(Math.max((currentPage - 1), 1) || 1)}
        />
    );

    // Calculate the first item in the pagination
    let firstItem = (() => {
        if (currentPage <= 3) {
            return 1;
        }
        let pagesLeft = totalPages - currentPage;
        if (pagesLeft <= 2) {
            return Math.max(currentPage - 4 + pagesLeft, 1);
        }
        return Math.max(currentPage - 2, 1);
    })();
    for (let number = firstItem; number <= totalPages && number <= firstItem + 4; number++) {
        newItems.push(
            <Pagination.Item
                key={number}
                active={number === currentPage}
                onClick={() => setActive(number)}
            >
                {number}
            </Pagination.Item>
        );
    }
    newItems.push(
        <Pagination.Next
            key='next'
            onClick={() => setActive(Math.min((currentPage + 1), totalPages) || 1)}
        />
    );
    newItems.push(
        <Pagination.Last
            key='last'
            onClick={() => setActive(totalPages)}
        />
    );
    return newItems;
};

export const makeSortFunction = (keyName: any, order: 'asc' | 'desc' | undefined = 'asc') => {
    const sorter = (firstValue: any, secondValue: any) => {
        if (!Object.hasOwn(firstValue, keyName)) return -1;
        if (!Object.hasOwn(secondValue, keyName)) return 1;

        const varA = typeof firstValue[keyName] === 'string' ? firstValue[keyName].toUpperCase().trim() : firstValue[keyName];
        const varB = typeof secondValue[keyName] === 'string' ? secondValue[keyName].toUpperCase().trim() : secondValue[keyName];

        let comparison = 0;

        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }

        return order === 'desc' ? comparison * -1 : comparison;
    };

    return sorter;
};

const sortByOptions = [
    'email',
    'fname',
    'lname',
    'userType',
    'organizationName',
    'createdAt',
    'updatedAt',
];

export const SegmentContent: React.FC<SegmentContentProps> = ({token, user, segId}) => {
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
    const [allUsers, setAllUsers] = useState<IUser[]>([]);
    const [userTypeFilter, setUserTypeFilter] = useState<string>('All');
    const [segmentTypeFilter, setSegmentTypeFilter] = useState<string>(segmentTypes[0]);
    const [searchFilter, setSearchFilter] = useState<string>('');
    const [subsegmentFilter, setSubsegmentFilter] = useState<string>('All');
    const [sortByValue, setSortByValue] = useState<string>('email');
    const [inSegmentFilter, setInSegmentFilter] = useState<string>('True');

    const { data: subSegData } = useAllSubSegmentsWithId(String(segId));
    const { data: segmentData, isLoading: segmentLoading } = useSingleSegmentBySegmentId(segId);
    const { data: segmentUserData } = useSegmentsUsers(segId);
    // const { data: allUserData } = useAllRegularUsers(token);

    // For the Edit User Modal
    const { data: modalSegData = [] } = useAllSuperSegments();
    const { data: modalSubSegData = [] } = useAllSegments();

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
        if (filteredUsers) {
            let newItems = makePaginationItems(filteredUsers?.length || 0, active, setActive);
            setPaginationItems(newItems);
        }
    }, [filteredUsers, active]);

    useEffect(() => {
        if (segmentUserData && segmentUserData?.users.length !== 0) {
            const sortFunction = makeSortFunction(sortByValue);
            const dataSet = inSegmentFilter === 'True' ? segmentUserData.users : allUsers || [];
            const filteredUsers = dataSet
                .filter((user) => {
                    if (userTypeFilter === 'All') {
                        return true;
                    }
                    return user.userType === userTypeFilter;
                })
                .filter((user) => {
                    if (segmentTypeFilter === 'All') {
                        return true;
                    } else if (segmentTypeFilter === 'Home') {
                        return user.userSegments?.homeSegmentId === segId;
                    } else if (segmentTypeFilter === 'Work') {
                        return user.userSegments?.workSegmentId === segId;
                    } else if (segmentTypeFilter === 'School') {
                        return user.userSegments?.schoolSegmentId === segId;
                    } else if (segmentTypeFilter === 'None') {
                        return user.userSegments?.homeSegmentId !== segId && user.userSegments?.workSegmentId !== segId && user.userSegments?.schoolSegmentId !== segId; 
                    }
                    return user.userSegments?.schoolSegmentId === segId;
                })
                .filter((user) => {
                    if (subsegmentFilter === 'All') {
                        return true;
                    } else if (segmentTypeFilter === 'Home') {
                        return user.userSegments?.homeSubSegmentName === subsegmentFilter;
                    } else if (segmentTypeFilter === 'Work') {
                        return user.userSegments?.workSubSegmentName === subsegmentFilter;
                    } else if (segmentTypeFilter === 'School') {
                        return user.userSegments?.schoolSubSegmentName === subsegmentFilter;
                    }
                    return user.userSegments?.homeSubSegmentName === subsegmentFilter
                        || user.userSegments?.workSubSegmentName === subsegmentFilter
                        || user.userSegments?.schoolSubSegmentName === subsegmentFilter;
                })
                .filter((user) => {
                    if (searchFilter === '') {
                        return true;
                    }
                    return user.email.includes(searchFilter)
                        || (user.fname && user.fname.includes(searchFilter))
                        || (user.lname && user.lname.includes(searchFilter))
                        || (user.fname && user.lname && `${user.fname} ${user.lname}`.includes(searchFilter));
                })
                .sort(sortFunction);
            setFilteredUsers(filteredUsers);
            setActive(1);
        } else {
            setFilteredUsers([]);
            setActive(1);
        }
    }, [segmentUserData, userTypeFilter, segmentTypeFilter, searchFilter, subsegmentFilter, sortByValue, segId, allUsers, inSegmentFilter]);

    useEffect(() => {
        if (inSegmentFilter === 'False' && allUsers.length === 0) {
            getAllRegularUsers(token).then((res) => {
                setAllUsers(res);
            });
        }
    }, [inSegmentFilter, allUsers, token, segId]);

    const getCorrectSubsegmentData = (user: IUser) => {
        if (segmentTypeFilter === 'Home') {
            return user.userSegments?.homeSubSegmentName;
        } else if (segmentTypeFilter === 'Work') {
            return user.userSegments?.workSubSegmentName;
        } else if (segmentTypeFilter === 'School') {
            return user.userSegments?.schoolSubSegmentName;
        } else if (user.userSegments?.homeSegmentId === segId) {
            return user.userSegments?.homeSubSegmentName;
        } else if (user.userSegments?.workSegmentId === segId) {
            return user.userSegments?.workSubSegmentName;
        } else if (user.userSegments?.schoolSegmentId === segId) {
            return user.userSegments?.schoolSubSegmentName;
        }
        return 'N/A';
    };

    const getRelationshipsString = (user: IUser) => {
        let relationships = [];
        if (user.userSegments?.homeSegmentId === segId) {
            relationships.push('Home');
        }
        if (user.userSegments?.workSegmentId === segId) {
            relationships.push('Work');
        }
        if (user.userSegments?.schoolSegmentId === segId) {
            relationships.push('School');
        }
        return relationships.join(', ');
    };

    return (
        <Container style={{ maxWidth: '1600px', margin: 'auto' }}>
            {showEditUserModal ?
                <EditUserInfoModal show={showEditUserModal} setShow={setShowEditUserModal} modalUser={modalUser!} currentUser={user!} token={token} segs={modalSegData} subSeg={modalSubSegData} changesSaved={handleUpdatedLocalUserData} editSegmentsOnly editSegmentOnlySegment={segmentUserData?.segment} />
                : null
            }

            <div className='d-flex justify-content-between'>
                <h2 className='mb-4 mt-4'>Segment Management</h2>
            </div>

            <Card>
                <Card.Header className='text-capitalize'>{segmentData?.name} Segment Info</Card.Header>
                <Card.Body className='text-capitalize'>
                    <Container>
                        {segmentLoading ? 
                            <LoadingSpinnerInline />
                            : (
                                <>
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
                                </>
                            )}
                    </Container> 
                </Card.Body>    
            </Card>

            <br />

            <ShowSubSegments data={subSegData} segId={Number(segId) || 1} token={token} segName={segmentData?.name} />

            <br />
            <h4>Segment Users</h4>

            <Row>
                <Col>
                    <Form.Label htmlFor='SearchData'>Search</Form.Label>
                    <Form.Control type='text' name='SearchData' value={searchFilter} placeholder='Email / Name' onChange={(event) => { setSearchFilter(event.target.value); }} />
                </Col>
                <Col>
                    <Form.Label htmlFor='SegmentTypeData'>Segment Type</Form.Label>
                    <Form.Control as='select' required name='SegmentTypeData' value={segmentTypeFilter} onChange={(event) => { setSegmentTypeFilter(event.target.value); }}>
                        {segmentTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Label htmlFor='UserTypeData'>User Type</Form.Label>
                    <Form.Control as='select' required name='UserTypeData' value={userTypeFilter} onChange={(event) => { setUserTypeFilter(event.target.value); }}>
                        <option value='All'>All</option>
                        {userTypes
                            .filter((type) => type !== USER_TYPES.SUPER_ADMIN && type !== USER_TYPES.ADMIN && type !== USER_TYPES.MOD)
                            .map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                    </Form.Control>
                </Col>
            </Row>
            <br />
            <Row>
                <Col>
                    <Form.Label htmlFor='SubSegmentData'>Sub Segment</Form.Label>
                    <Form.Control as='select' required name='SubSegmentData' value={subsegmentFilter} onChange={(event) => { setSubsegmentFilter(event.target.value); }}>
                        <option value='All'>All</option>
                        {subSegData?.map((subSeg) => (
                            <option key={subSeg.id} value={subSeg.name}>
                                {subSeg.name}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
                {(user?.userType === USER_TYPES.ADMIN || user?.userType === USER_TYPES.SUPER_ADMIN) && (
                    <Col>
                        <Form.Label htmlFor='InSegmentData'>In Segment Only</Form.Label>
                        <Form.Control as='select' required name='InSegmentData' value={inSegmentFilter} onChange={(event) => { setInSegmentFilter(event.target.value); }}>
                            <option value='True'>True</option>
                            <option value='False'>False</option>
                        </Form.Control>
                    </Col>
                )}
                <Col>
                    <Form.Label htmlFor='SortByData'>Sort By</Form.Label>
                    <Form.Control className='text-capitalize' as='select' required name='SortByData' value={sortByValue} onChange={(event) => { setSortByValue(event.target.value); }}>
                        {sortByOptions.map((option) => (
                            <option className='text-capitalize' key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
                {(user?.userType !== USER_TYPES.ADMIN && user?.userType !== USER_TYPES.SUPER_ADMIN) && (
                    <Col ></Col>
                )}
            </Row>
            <br />
            <Pagination>
                {paginationitems}
            </Pagination>
            <span>
                Showing {active === 1 ? 1 : (active - 1) * ITEMS_PER_PAGE + 1} to {active * ITEMS_PER_PAGE > filteredUsers.length ? filteredUsers.length : active * ITEMS_PER_PAGE} of {filteredUsers.length} entries
            </span>
            
            <Table bordered hover size='sm' style={{ fontSize: '0.8rem' }}>
                <thead className='table-active'>
                    <tr>
                        <th scope='col' className='text-center align-middle'>Email</th>
                        <th scope='col' className='text-center align-middle'>Organization</th>
                        <th scope='col' className='text-center align-middle'>First</th>
                        <th scope='col' className='text-center align-middle'>Last</th>
                        <th scope='col' className='text-center align-middle'>User Type</th>
                        <th scope='col' className='text-center align-middle'>Subsegment</th>
                        <th scope='col' className='text-center align-middle'>Relationship</th>
                        <th scope='col' className='text-center align-middle'>Verified</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers
                        .filter((_, index) => index >= (active - 1) * ITEMS_PER_PAGE && index < active * ITEMS_PER_PAGE)
                        .map((req: IUser, index: number) => (
                            <tr
                                key={req.id}
                                onClick={() => {
                                    setShowEditUserModal(true);
                                    setModalUser(req);
                                }}
                                className='cursor-pointer'
                            >
                                <td className='align-middle' style={{wordBreak: 'break-word'}}>{req.email}</td>
                                <td className='text-center align-middle'>{req.organizationName ? req.organizationName : 'N/A'}</td>
                                <td className='text-center align-middle'>{req.fname}</td>
                                <td className='text-center align-middle'>{req.lname}</td>
                                <td className='text-center align-middle'>{req.userType}</td>
                                <td className='text-center align-middle'>{getCorrectSubsegmentData(req)}</td> 
                                <td className='text-center align-middle'>{getRelationshipsString(req)}</td>
                                <td className='text-center align-middle'>{req.verified ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                </tbody>
            </Table>
            <br />
        </Container>
    );
};