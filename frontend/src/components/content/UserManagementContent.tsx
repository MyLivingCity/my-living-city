import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Table, Dropdown, Container, Button, Form, NavDropdown, Row, Col, Card } from 'react-bootstrap';
import { updateUser, getUserBanHistory, removeFlagQuarantine, removePostCommentQuarantine, deleteUser, postRegisterUser, getUserWithEmail, updateUserPassword } from 'src/lib/api/userRoutes';
import { API_BASE_URL, USER_TYPES } from 'src/lib/constants';
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
import { UserSegPlainText } from '../partials/UserSegPlainText';
import { IRegisterInput } from './../../lib/types/input/register.input';
import { ISegment, ISuperSegment } from 'src/lib/types/data/segment.type';
import { EditUserInfoModal } from '../modal/EditUserInfoModal';
import UserChangePasswordModal from '../modal/UserChangePasswordModal';
import { postUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { unendorseIdeaByUser } from 'src/lib/api/ideaRoutes';
import { createCommentUnderSubSegment } from 'src/lib/api/commentRoutes';

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
    segs?: ISuperSegment[] | undefined;
    subSeg?: ISegment[] | undefined;
    userVerbose?: IUser | null;
}

export function formatBanHistory(banhistory: any) {
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
            );
        } else if (ban.type === 'COMMENT') {
            return (
                <tr>
                    <td>Ban Reason: {ban.reason}</td>
                    <td>Moderator Message: {ban.message}</td>
                    <td>Moderator ID: {ban.modId}</td>
                    <td>Banned At: {ban.createdAt}</td>
                </tr>
            );
        } else if (ban.type === 'IDEA') {
            return (
                <tr>
                    <td>Ban Reason: {ban.reason}</td>
                    <td>Moderator Message: {ban.message}</td>
                    <td>Moderator ID: {ban.modId}</td>
                    <td>Banned At: {ban.createdAt}</td>
                </tr>
            );
        } else {
            return <tr><td>Invalid</td></tr>;
        }
    });
    return banHistory;
}

export const UserManagementContent: React.FC<UserManagementContentProps> = ({ users, token, user, flags, commentFlags, ideas, proposals, comments, bans, segs, subSeg, userVerbose }) => {
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
    const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
    const [modalUser, setModalUser] = useState<IUser>();
    const [banHistory, setBanHistory] = useState<any>();
    const UserSegmentHandler = (email: string, id: string) => {
        setShowUserSegmentCard(true);
        setEmail(email);
        setId(id);
    };
    const [buttonText, setButtonText] = useState(user?.userType === USER_TYPES.SUPER_ADMIN || user?.userType === USER_TYPES.ADMIN ? 'User Creation Wizard' : 'Municipal User Creation Wizard');
    const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
    const [selectedSubSegmentId, setSelectedSubSegmentId] = useState<string>('');
    const [comment, setComment] = useState<string>('');

    let newHomeID = 1;
    const [selectedUserType, setSelectedUserType] = useState('');
    const [selectedHomeRegion, setSelectedHomeRegion] = useState('');
    const handleHomeRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRegionName = event.target.value;
        setSelectedHomeRegion(selectedRegionName);
    };

    let newWorkID = 1;
    const [selectedWorkRegion, setSelectedWorkRegion] = useState('');
    const handleWorkRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRegionName = event.target.value;
        setSelectedWorkRegion(selectedRegionName);
    };

    let newSchoolID = 1;
    const [selectedSchoolRegion, setSelectedSchoolRegion] = useState('');
    const handleSchoolRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRegionName = event.target.value;
        setSelectedSchoolRegion(selectedRegionName);
    };

    const [emailFilter, setEmailFilter] = useState<string>('');
    const [orgFilter, setOrgFilter] = useState<string>('');
    const [fnameFilter, setFnameFilter] = useState<string>('');
    const [lnameFilter, setLnameFilter] = useState<string>('');
    const [userTypeFilter, setUserTypeFilter] = useState<string>('');
    const [homeSegmentFilter, setHomeSegmentFilter] = useState<string>('');
    const [schoolSegmentFilter, setSchoolSegmentFilter] = useState<string>('');
    const [workSegmentFilter, setWorkSegmentFilter] = useState<string>('');
    const [totalFlagsFilter, setTotalFlagsFilter] = useState<'all' | 'flagged' | 'not-flagged'>('all');
    const [falseFlagsFilter, setFalseFlagsFilter] = useState<'all' | 'flagged' | 'not-flagged'>('all');
    const [bannedFilter, setBannedFilter] = useState<string>('');
    const [reviewedFilter, setReviewedFilter] = useState<string>('');
    const [verifiedFilter, setVerifiedFilter] = useState<string>('');

    let userFalseFlags: number[] = [];
    let userFlags: number[] = [];
    if (users && flags) {
        for (let i = 0; i < users.length; i++) {
            let counter = 0;
            let flagCounter = 0;
            for (let z = 0; z < flags.length; z++) {
                if (users[i].id === flags[z].flaggerId && flags[z].falseFlag === true) {
                    counter++;
                    flagCounter++;
                } else if (users[i].id === flags[z].flaggerId) {
                    flagCounter++;
                }
            }
            userFalseFlags.push(counter);
            userFlags.push(flagCounter);
        }
    }
    if (users && commentFlags) {
        for (let i = 0; i < users.length; i++) {
            let counter = 0;
            let flagCounter = 0;
            for (let z = 0; z < commentFlags.length; z++) {
                if (users[i].id === commentFlags[z].flaggerId && commentFlags[z].falseFlag === true) {
                    counter++;
                    flagCounter++;
                } else if (users[i].id === commentFlags[z].flaggerId) {
                    flagCounter++;
                }
            }
            userFalseFlags[i] = userFalseFlags[i] + counter;
            userFlags[i] = userFlags[i] + flagCounter;
        }
    }
    const userTypes = Object.keys(USER_TYPES);

    const toggleCreateAccountForm = () => {
        setShowCreateAccountForm(!showCreateAccountForm);
        if (user?.userType === USER_TYPES.SUPER_ADMIN || user?.userType === USER_TYPES.ADMIN) {
            setButtonText(showCreateAccountForm ? 'User Creation Wizard' : 'Hide Creation Wizard');
        } else {
            setButtonText(showCreateAccountForm ? 'Municipal User Creation Wizard' : 'Hide Creation Wizard');
        }
    };

    const getOrganizationNameAdmin = ( 
        selectedUserType: string, 
        formData: FormData
    ): string | undefined => {
        switch(selectedUserType) {
            case USER_TYPES.BUSINESS || USER_TYPES.COMMUNITY: {
                return formData.get('inputOrg') as string;
            }
            case USER_TYPES.MUNICIPAL: {
                return formData.get('inputCom') as string;
            }
        }
        return undefined;
    };

    const getOrganizationName = (
        user: IUser | null, 
        userVerbose: IUser | null | undefined,
        selectedUserType: string, 
        formData: FormData
    ): string | undefined => {
        // Check the type of user creating the account, since the wizards display different fields
        switch(user?.userType){
            case USER_TYPES.ADMIN || USER_TYPES.SUPER_ADMIN: {
                return getOrganizationNameAdmin(selectedUserType, formData);
            }

            // Return the municipal seg admin's organization name or fallback to their homeSegmentName if an org name is not set.
            case USER_TYPES.MUNICIPAL_SEG_ADMIN: {
                return userVerbose?.organizationName || userVerbose?.userSegments?.homeSegmentName;
            }
        }
        return undefined; 
    };
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const orgName = getOrganizationName(user, userVerbose, selectedUserType,  formData);
            
        const registerData: IRegisterInput = {
            userRoleId: undefined,
            email: formData.get('inputEmail') as string,
            password: formData.get('inputPassword') as string,
            confirmPassword: formData.get('inputPassword') as string,
            organizationName: orgName,
            fname: formData.get('inputFirst') as string,
            lname: formData.get('inputLast') as string,
            displayFName: formData.get('inputFirst') as string,
            displayLName: (user?.userType === USER_TYPES.SUPER_ADMIN || user?.userType === USER_TYPES.ADMIN) ? formData.get('inputLast') as string : 'Municipal',
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
            homeSegmentId: userVerbose?.userType === USER_TYPES.SUPER_ADMIN || userVerbose?.userType === USER_TYPES.ADMIN ? newHomeID : userVerbose?.userSegments?.homeSegmentId,
            workSegmentId: userVerbose?.userType === USER_TYPES.SUPER_ADMIN || userVerbose?.userType === USER_TYPES.ADMIN ? newWorkID : undefined,
            schoolSegmentId: userVerbose?.userType === USER_TYPES.SUPER_ADMIN || userVerbose?.userType === USER_TYPES.ADMIN ? newSchoolID : undefined,
            homeSubSegmentId: undefined,
            workSubSegmentId: undefined,
            schoolSubSegmentId: undefined,
            userType: userVerbose?.userType === USER_TYPES.SUPER_ADMIN || userVerbose?.userType === USER_TYPES.ADMIN ? selectedUserType : 'MUNICIPAL',
            reachSegmentIds: [],
            verified: true,
        };

        try {
            if (await getUserWithEmail(registerData.email) === 200) {
                setValidEmail(false);
            } else {
                await postRegisterUser(registerData, null, false, null, token);
                console.log('User registered successfully!');
                form.reset();
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        if (!selectedSubSegmentId || !comment.trim()) {
            alert('Please select a subsegment and enter a comment.');
            return;
        }
    
        try {
            const response = await createCommentUnderSubSegment(selectedSubSegmentId, token!, {
                content: comment,
            });
    
            if (response) {
                alert('Comment posted successfully!');
                setComment('');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const capitalizeString = (s: string) => {
        if (s === null) {
            return;
        }
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

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
        setMunicipalFilteredUsers(
            municipalFilteredUsers.map((user) => {
                if (user.id === updatedUser.id) {
                    return updatedUser;
                }
                return user;
            })
        );
    };

    const handlePasswordChange = async (newPassword: string) => {
        console.log(newPassword);
        if (modalUser) {
            try {
                await updateUserPassword(modalUser.id, newPassword, token);
                console.log('changed user password successfully!');
            } catch (error) {
                console.error('Error changing user password:', error);
            }
        }
    };


    useEffect(() => {
        const filterUsers = async () => {
            if (users) {
                // Filter out specific user types or conditions if needed
                const filteredUsers = users.filter(user =>
                    user.userType !== USER_TYPES.SUPER_ADMIN &&
                    user.userType !== USER_TYPES.ADMIN &&
                    user.userType !== USER_TYPES.MOD &&
                    user.userType !== USER_TYPES.SEG_MOD &&
                    user.userType !== USER_TYPES.MUNICIPAL_SEG_ADMIN &&
                    user.userType !== USER_TYPES.SEG_ADMIN
                );
                setFilteredUsers(filteredUsers);
            }
        };
        filterUsers();
    }, [users]);

    useEffect(() => {
        const filterMunicipalUsers = async () => {
            if (users && userVerbose) {
                // Filter out specific user types or conditions if needed
                const municipalFilteredUsers = users.filter(
                    user =>
                        user.userType === 'MUNICIPAL' &&
                        userVerbose.userSegments?.homeSegmentId &&
                        user.userSegments?.homeSegmentId == userVerbose.userSegments.homeSegmentId
                );
                setMunicipalFilteredUsers(municipalFilteredUsers);
            }
        };
        filterMunicipalUsers();
    }, [users, userVerbose]);

    const [validEmail, setValidEmail] = useState(true);

    const usersWithFlags = users!.map((user, index) => {
        // Ensure proper number conversion and handle undefined/NaN cases
        const totalFlags = Math.max(0, Number(userFlags[index]) || 0);
        const falseFlags = Math.max(0, Number(userFalseFlags[index]) || 0);
        
        // Create a new object with all user properties plus the flag counts
        return {
            ...user,
            totalFlags: totalFlags,
            falseFlags: falseFlags,
            // Ensure these are numbers in the object
            _totalFlags: totalFlags,
            _falseFlags: falseFlags
        };
    });
    
    const filteredUsersList = usersWithFlags.filter((user) => {
        // Use the already converted numbers from usersWithFlags
        const totalFlags = user._totalFlags; // or user.totalFlags
        const falseFlags = user._falseFlags; // or user.falseFlags
    
        console.log('Filtering user:', {
            email: user.email,
            totalFlags: totalFlags,
            falseFlags: falseFlags,
            originalTotalFlags: user.totalFlags,
            originalFalseFlags: user.falseFlags
        });
    
        return (
            (emailFilter === '' || user.email.includes(emailFilter)) &&
            (orgFilter === '' || (user.organizationName || '').includes(orgFilter)) &&
            (fnameFilter === '' || user.fname?.includes(fnameFilter)) &&
            (lnameFilter === '' || user.lname?.includes(lnameFilter)) &&
            (userTypeFilter === '' || user.userType.includes(userTypeFilter)) &&
            (homeSegmentFilter === '' || (user.userSegments?.homeSegmentName || '').includes(homeSegmentFilter)) &&
            (schoolSegmentFilter === '' || (user.userSegments?.schoolSegmentName || '').includes(schoolSegmentFilter)) &&
            (workSegmentFilter === '' || (user.userSegments?.workSegmentName || '').includes(workSegmentFilter)) &&
            // STRICT flag filtering:
            (totalFlagsFilter === 'all' || 
            (totalFlagsFilter === 'flagged' ? totalFlags >= 1 : totalFlags === 0)) &&
            (falseFlagsFilter === 'all' || 
            (falseFlagsFilter === 'flagged' ? falseFlags >= 1 : falseFlags === 0)) &&
            (bannedFilter === '' || (user.banned ? 'Yes' : 'No') === bannedFilter) &&
            (reviewedFilter === '' || (user.reviewed ? 'Yes' : 'No') === reviewedFilter) &&
            (verifiedFilter === '' || (user.verified ? 'Yes' : 'No') === verifiedFilter)
        );
    });

    {user?.userType === USER_TYPES.MUNICIPAL && (
        <Form onSubmit={handleCommentSubmit} className='mb-4'>
            <Form.Group>
                <Form.Label>Select Subsegment</Form.Label>
                <Form.Control
                    as='select'
                    required
                    value={selectedSubSegmentId}
                    onChange={(e) => setSelectedSubSegmentId(e.target.value)}
                >
                    <option value=''>Select a subsegment</option>
                    {subSeg?.map((segment) => (
                        <option key={segment.segId} value={segment.segId}>
                            {segment.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
    
            <Form.Group>
                <Form.Label>Write Comment</Form.Label>
                <Form.Control
                    as='textarea'
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </Form.Group>
    
            <Button type='submit' disabled={!selectedSubSegmentId}>
                Submit Comment
            </Button>
        </Form>
    );}


    if (user?.userType === USER_TYPES.MUNICIPAL_SEG_ADMIN) {
        return (
            <Container style={{ maxWidth: '100%', marginLeft: 50 }}>
                <h2 className='mb-4 mt-4'>Municipality of <UserSegPlainText email={user.email} id={user.id} token={token} /> User Management</h2>
                <Button variant='primary' className='mb-4 mt-4' onClick={() => toggleCreateAccountForm()}>{buttonText}</Button>
                {showCreateAccountForm && (
                    <Form onSubmit={handleSubmit}>
                        <div className='form-row'>
                        </div>
                        <div className='form-row'>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputFirst'>First Name</label>
                                <input type='text' className='form-control' id='inputFirst' name='inputFirst' placeholder='John' required />
                            </div>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputLast'>Last Name</label>
                                <input type='text' className='form-control' id='inputLast' name='inputLast' placeholder='Doe' required />
                            </div>
                        </div>
                        <div className='form-row'>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputEmail'>Email</label>
                                <input type='email' className='form-control' id='inputEmail' name='inputEmail' placeholder='Email' required />
                            </div>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputPassword'>Password</label>
                                <input type='password' className='form-control' id='inputPassword' name='inputPassword' placeholder='Password' required />
                            </div>
                        </div>
                        <div className='form-row'>
                        </div>
                        <button type='submit' className='btn btn-primary mr-2 mb-2'>Submit</button>
                    </Form >
                )}
                <Table bordered hover size='sm'>
                    <thead className='table-active'>
                        <tr>
                            <th scope='col' className='text-center align-middle'>Email</th>
                            <th scope='col' className='text-center align-middle'>Department</th>
                            <th scope='col' className='text-center align-middle'>First</th>
                            <th scope='col' className='text-center align-middle'>Last</th>
                            <th scope='col' className='text-center align-middle'>User Type</th>
                            <th scope='col' className='text-center align-middle'>Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {municipalFilteredUsers?.map((req: IUser, index: number) => (
                            req.userType === 'MUNICIPAL' && String(<UserSegPlainText email={req.email} id={req.id} token={token} />).toLowerCase() === String(<UserSegPlainText email={user.email} id={user.id} token={token} />).toLowerCase() ? (
                                <tr key={req.id}>

                                    {req.id !== hideControls ?
                                        <>
                                            <td className='align-middle'>{req.email}</td>
                                            <td className='text-center align-middle'>{req.organizationName ? req.organizationName : 'N/A'}</td>
                                            <td className='text-center align-middle'>{req.fname}</td>
                                            <td className='text-center align-middle'>{req.lname}</td>
                                            <td className='text-center align-middle'>{req.userType}</td>
                                        </> :
                                        <>
                                            <td><Form.Control type='text' defaultValue={req.email} onChange={(e) => req.email = e.target.value} /></td>
                                            <td><Form.Control type='text' defaultValue={req.organizationName} onChange={(e) => req.organizationName = e.target.value} /></td>
                                            <td><Form.Control type='text' defaultValue={req.fname} onChange={(e) => req.fname = e.target.value} /></td>
                                            <td><Form.Control type='text' defaultValue={req.lname} onChange={(e) => req.lname = e.target.value} /></td>
                                            <td className='text-center align-middle '><Button onClick={() => setShowUserFlagsModal(true)}>Info</Button></td>

                                        </>
                                    }

                                    <td>
                                        {req.id !== hideControls ?
                                            <NavDropdown title='Controls' id='nav-dropdown' className='text-center align-middle '>
                                                <Dropdown.Item
                                                    onClick={() => {
                                                        setHideControls(req.id);
                                                        setReviewed(req.reviewed);
                                                        setModalUser(req);
                                                    }}>Edit</Dropdown.Item>
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
                                            : <>
                                                <div className='d-flex justify-content-between'>
                                                    <Button size='sm' variant='outline-danger' className='mr-2 mb-2 text-center align-middle' onClick={() => setHideControls('')}>Cancel</Button>
                                                    <Button
                                                        size='sm'
                                                        className='mr-2 mb-2 text-center align-middle'
                                                        onClick={() => {
                                                            setHideControls('');

                                                            updateUser(req, token, user);
                                                        }}>Save</Button>
                                                </div>
                                            </>
                                        }

                                    </td>
                                </tr>
                            ) : null))}
                    </tbody>
                </Table>

                <br></br>
                {/* <UserSegmentHandler/> */}
                {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token} />}
            </Container>
        );
    } else {
        return (
            <Container style={{ maxWidth: '1600px', margin: 'auto' }}>
                {showUserFlagsModal ?

                    <UserFlagsModal show={showUserFlagsModal} setShow={setShowUserFlagsModal} user={modalUser!} flags={flags} commentFlags={commentFlags} ideas={ideas} proposals={proposals} comments={comments} />
                    : null
                }
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
                {showEditUserModal ?
                    <EditUserInfoModal show={showEditUserModal} setShow={setShowEditUserModal} modalUser={modalUser!} currentUser={user!} token={token} segs={segs} subSeg={subSeg} changesSaved={handleUpdatedLocalUserData} />
                    : null
                }
                {showChangePasswordModal && (
                    <UserChangePasswordModal
                        show={showChangePasswordModal}
                        onHide={() => setShowChangePasswordModal(false)}
                        onSubmit={handlePasswordChange}
                        modalUser={modalUser}
                    />
                )}


                <div className='d-flex justify-content-between'>
                    <h2 className='mb-4 mt-4'>User Management</h2>
                    {(user?.userType === USER_TYPES.SUPER_ADMIN || user?.userType === USER_TYPES.ADMIN) && (
                        <Button variant='primary' className='mb-4 mt-4' onClick={() => toggleCreateAccountForm()}>{buttonText}</Button>
                    )}
                </div>
                {(user?.userType === USER_TYPES.SUPER_ADMIN || user?.userType === USER_TYPES.ADMIN) && showCreateAccountForm &&
                    (
                        <Form onSubmit={handleSubmit}>
                            <div className='form-row'>
                                <div className='form-group col-md-12'>
                                    <label htmlFor='inputData'>User Type</label>
                                    <Form.Control as='select' required name='inputType' onChange={(event) => { setSelectedUserType(event.target.value); }}>
                                        <option value=''>Select User Type</option>
                                        {userTypes.filter(
                                            item => item === USER_TYPES.RESIDENTIAL ||
                                                item === USER_TYPES.COMMUNITY ||
                                                item === USER_TYPES.MUNICIPAL ||
                                                item === USER_TYPES.BUSINESS
                                        ).map(item => <option key={item}>{item}</option>)}
                                    </Form.Control>
                                </div>
                            </div>
                            <div className='form-row'>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='inputFirst'>{selectedUserType !== USER_TYPES.RESIDENTIAL ? 'Contact ' : ''}First Name</label>
                                    <input type='text' className='form-control' id='inputFirst' name='inputFirst' placeholder='John' required />
                                </div>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='inputLast'>{selectedUserType !== USER_TYPES.RESIDENTIAL ? 'Contact ' : ''}Last Name</label>
                                    <input type='text' className='form-control' id='inputLast' name='inputLast' placeholder='Doe' required />
                                </div>
                            </div>
                            {(selectedUserType === USER_TYPES.BUSINESS || selectedUserType === USER_TYPES.COMMUNITY) && (
                                <div className='form-row'>
                                    <div className='form-group col-md-12'>
                                        <label htmlFor='inputOrg'>Organization Name</label>
                                        <input type='text' className='form-control' id='inputOrg' name='inputOrg' placeholder='' required />
                                    </div>
                                </div>
                            )}
                            <div className='form-row'>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='inputEmail'>Email</label>
                                    <Form.Group>
                                        <Form.Control
                                            type='email'
                                            className='form-control'
                                            id='inputEmail'
                                            name='inputEmail'
                                            placeholder='Email'
                                            required
                                            isInvalid={!validEmail}
                                            onChange={() => setValidEmail(true)}
                                        />
                                        <Form.Control.Feedback type='invalid'>
                                            Email is already in use.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='inputPassword'>Password</label>
                                    <input type='password' className='form-control' id='inputPassword' name='inputPassword' placeholder='Password' required />
                                </div>
                            </div>

                            <div className='form-row'>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='InputHomeRegion'>Home Region</label>
                                    <Form.Control name='InputHomeRegion' as='select' required value={selectedHomeRegion} onChange={handleHomeRegionChange}>
                                        <option value=''>Select Region</option>
                                        {segs?.map(seg => (
                                            <option key={seg.superSegId + 'hr'} value={seg.name}>
                                                {seg.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </div>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='inputCom'>Home Community</label>
                                    <Form.Control as='select' name='inputCom' onChange={(event) => { newHomeID = parseInt(event.target.value); }}>
                                        <option value=''>Select Community</option>
                                        {subSeg && subSeg
                                            .filter(seg => seg.superSegName?.toUpperCase() === selectedHomeRegion.toUpperCase())
                                            .map(seg => (
                                                <option key={seg.segId + 'hc'} value={seg.segId}>
                                                    {capitalizeString(seg.name)}
                                                </option>
                                            ))}
                                    </Form.Control>
                                </div>
                            </div>
                            {selectedUserType === USER_TYPES.RESIDENTIAL && (
                                <>
                                    <div className='form-row'>
                                        <div className='form-group col-md-6'>
                                            <label htmlFor='inputWorkRegion'>Work Region</label>
                                            <Form.Control name='inputWorkRegion' as='select' value={selectedWorkRegion} onChange={handleWorkRegionChange}>
                                                <option value=''>Select Region</option>
                                                {segs?.map(seg => (
                                                    <option key={seg.superSegId + 'wr'} value={seg.name}>
                                                        {seg.name}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </div>
                                        <div className='form-group col-md-6'>
                                            <label htmlFor='inputWorkCommunity'>Work Community</label>
                                            <Form.Control as='select' name='inputWorkCommunity' onChange={(event) => { newWorkID = parseInt(event.target.value); }}>
                                                <option value=''>Select Community</option>
                                                {subSeg && subSeg
                                                    .filter(seg => seg.superSegName?.toUpperCase() === selectedWorkRegion.toUpperCase())
                                                    .map(seg => (
                                                        <option key={seg.segId + 'wc'} value={seg.segId}>
                                                            {capitalizeString(seg.name)}
                                                        </option>
                                                    ))}
                                            </Form.Control>
                                        </div>
                                    </div>

                                    <div className='form-row'>
                                        <div className='form-group col-md-6'>
                                            <label htmlFor='InputSchoolRegion'>School Region</label>
                                            <Form.Control name='InputSchoolRegion' as='select' value={selectedSchoolRegion} onChange={handleSchoolRegionChange}>
                                                <option value=''>Select Region</option>
                                                {segs?.map(seg => (
                                                    <option key={seg.superSegId + 'sr'} value={seg.name}>
                                                        {seg.name}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </div>
                                        <div className='form-group col-md-6'>
                                            <label htmlFor='inputSchoolCommunity'>School Community</label>
                                            <Form.Control as='select' name='inputSchoolCommunity' onChange={(event) => { newSchoolID = parseInt(event.target.value); }}>
                                                <option value=''>Select Community</option>
                                                {subSeg && subSeg
                                                    .filter(seg => seg.superSegName?.toUpperCase() === selectedSchoolRegion.toUpperCase())
                                                    .map(seg => (
                                                        <option key={seg.segId + 'sc'} value={seg.segId}>
                                                            {capitalizeString(seg.name)}
                                                        </option>
                                                    ))}
                                            </Form.Control>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type='submit' className='btn btn-primary mr-2 mb-2'>Submit</button>
                        </Form>
                    )
                }
                <Form style={{ overflow: 'auto' }}>
                    <Row>
                        <Col>
                            <Form.Group>
                                <Card>
                                    <Card.Header>Filter Users</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            {/* Email Filter */}
                                            <Col>
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control
                                                    type='text'
                                                    placeholder='Filter Email'
                                                    value={emailFilter}
                                                    onChange={(e) => setEmailFilter(e.target.value)}
                                                    size='sm'
                                                />
                                            </Col>
                                            
                                            {/* Organization Filter */}
                                            <Col>
                                                <Form.Label>Organization</Form.Label>
                                                <Form.Control
                                                    type='text'
                                                    placeholder='Filter Organization'
                                                    value={orgFilter}
                                                    onChange={(e) => setOrgFilter(e.target.value)}
                                                    size='sm'
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <Row className='mt-3'>
                                            {/* First Name Filter */}
                                            <Col>
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control
                                                    type='text'
                                                    placeholder='Filter First Name'
                                                    value={fnameFilter}
                                                    onChange={(e) => setFnameFilter(e.target.value)}
                                                    size='sm'
                                                />
                                            </Col>
                                            
                                            {/* Last Name Filter */}
                                            <Col>
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control
                                                    type='text'
                                                    placeholder='Filter Last Name'
                                                    value={lnameFilter}
                                                    onChange={(e) => setLnameFilter(e.target.value)}
                                                    size='sm'
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <Row className='mt-3'>
                                            {/* User Type Filter */}
                                            <Col>
                                                <Form.Label>User Type</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={userTypeFilter}
                                                    onChange={(e) => setUserTypeFilter(e.target.value)}
                                                    size='sm'
                                                >
                                                    <option value=''>All</option>
                                                    {Array.from(new Set(
                                                        filteredUsers
                                                            ?.map((user) => user.userType)
                                                            .filter((type) => type && type !== 'SUPER_ADMIN' && type !== 'ADMIN' && type !== 'SEG_ADMIN' && type !== 'MUNICIPAL_SEG_ADMIN' && type !== 'DEVELOPER' && type !== 'IN_PROGRESS' && type !== 'ASSOCIATE' && type !== 'MOD' && type !== 'SEG_MOD')
                                                    )).map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Col>
                                            
                                            {/* Home Segment Filter */}
                                            <Col>
                                                <Form.Label>Home Segment</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={homeSegmentFilter}
                                                    onChange={(e) => setHomeSegmentFilter(e.target.value)}
                                                    size='sm'
                                                >
                                                    <option value=''>All</option>
                                                    {Array.from(new Set(
                                                        filteredUsers
                                                            ?.map((user) => user.userSegments?.homeSegmentName)
                                                            .filter((name) => name)
                                                    )).map((name) => (
                                                        <option key={name} value={name}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Col>
                                        </Row>
                                        
                                        <Row className='mt-3'>
                                            {/* School Segment Filter */}
                                            <Col>
                                                <Form.Label>School Segment</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={schoolSegmentFilter}
                                                    onChange={(e) => setSchoolSegmentFilter(e.target.value)}
                                                    size='sm'
                                                >
                                                    <option value=''>All</option>
                                                    {Array.from(new Set(
                                                        filteredUsers
                                                            ?.map((user) => user.userSegments?.schoolSegmentName)
                                                            .filter((name) => name && name !== 'NA' && name !== 'N/A')
                                                    )).map((name) => (
                                                        <option key={name} value={name}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Col>
                                            
                                            {/* Work Segment Filter */}
                                            <Col>
                                                <Form.Label>Work Segment</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={workSegmentFilter}
                                                    onChange={(e) => setWorkSegmentFilter(e.target.value)}
                                                    size='sm'
                                                >
                                                    <option value=''>All</option>
                                                    {Array.from(new Set(
                                                        filteredUsers
                                                            ?.map((user) => user.userSegments?.workSegmentName)
                                                            .filter((name) => name && name !== 'NA' && name !== 'N/A')
                                                    )).map((name) => (
                                                        <option key={name} value={name}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Col>
                                        </Row>
                                        
                                        <Row className='mt-3'>
                                            {/* Total Flags Filter */}
                                            <Col>
                                                <Form.Label>Has Flags</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={totalFlagsFilter}
                                                    onChange={(e) => setTotalFlagsFilter(e.target.value as 'all' | 'flagged' | 'not-flagged')}
                                                    size='sm'
                                                >
                                                    <option value='all'>All</option>
                                                    <option value='flagged'>Yes (≥1 flags)</option>
                                                    <option value='not-flagged'>No (0 flags)</option>
                                                </Form.Control>
                                            </Col>
                                            
                                            {/* False Flags Filter */}
                                            <Col>
                                                <Form.Label>Has False Flags</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={falseFlagsFilter}
                                                    onChange={(e) => setFalseFlagsFilter(e.target.value as 'all' | 'flagged' | 'not-flagged')}
                                                    size='sm'
                                                >
                                                    <option value='all'>All</option>
                                                    <option value='flagged'>Yes (≥1 flags)</option>
                                                    <option value='not-flagged'>No (0 flags)</option>
                                                </Form.Control>
                                            </Col>
                                        </Row>
                                        
                                        <Row className='mt-3'>
                                            {/* Banned Filter */}
                                            <Col>
                                                <Form.Label>Banned</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={bannedFilter}
                                                    onChange={(e) => setBannedFilter(e.target.value)}
                                                    size='sm'
                                                >
                                                    <option value=''>All</option>
                                                    <option value='Yes'>Yes</option>
                                                    <option value='No'>No</option>
                                                </Form.Control>
                                            </Col>
                                            
                                            {/* Reviewed Filter */}
                                            <Col>
                                                <Form.Label>Reviewed</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={reviewedFilter}
                                                    onChange={(e) => setReviewedFilter(e.target.value)}
                                                    size='sm'
                                                >
                                                    <option value=''>All</option>
                                                    <option value='Yes'>Yes</option>
                                                    <option value='No'>No</option>
                                                </Form.Control>
                                            </Col>
                                        </Row>
                                        
                                        <Row className='mt-3'>
                                            {/* Verified Filter */}
                                            <Col>
                                                <Form.Label>Verified</Form.Label>
                                                <Form.Control
                                                    as='select'
                                                    value={verifiedFilter}
                                                    onChange={(e) => setVerifiedFilter(e.target.value)}
                                                    size='sm'
                                                >
                                                    <option value=''>All</option>
                                                    <option value='Yes'>Yes</option>
                                                    <option value='No'>No</option>
                                                </Form.Control>
                                            </Col>
                                            
                                            {/* Empty column for alignment */}
                                            <Col></Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Table bordered hover size='sm' style={{ fontSize: '0.8rem' }}>
                        <thead className='table-active'>
                            <tr>
                                <th scope='col' className='text-center align-middle'>
                                    Email
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Organization
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    First
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Last
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    User Type
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Home Segment
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    School Segment
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Work Segment
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Total Flags
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    False Flags
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Banned
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Reviewed
                                </th>
                                <th scope='col' className='text-center align-middle'>
                                    Verified
                                </th>
                                <th scope='col' className='text-center align-middle'>Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsersList?.map((req: IUser, index: number) => (
                                req.userType !== 'SUPER_ADMIN' && req.userType !== 'ADMIN' && req.userType !== 'MOD' && req.userType !== 'SEG_MOD' && req.userType !== 'MUNICIPAL_SEG_ADMIN' && req.userType !== 'SEG_ADMIN' ? (
                                    <tr
                                        key={req.id}
                                        onClick={() => {
                                            if (hideControls === null || hideControls === '') {
                                                setShowEditUserModal(true);
                                                setModalUser(req);
                                            }
                                        }}>
                                        {req.id !== hideControls ?
                                            <>
                                                <td className='align-middle' style={{ wordBreak: 'break-word' }}>{req.email}</td>
                                                <td className='text-center align-middle'>{req.organizationName ? req.organizationName : 'N/A'}</td>
                                                <td className='text-center align-middle'>{req.fname}</td>
                                                <td className='text-center align-middle'>{req.lname}</td>
                                                <td className='text-center align-middle'>{req.userType}</td>
                                                <td className='text-center align-middle'>{req?.userSegments?.homeSegmentName || 'NA'}</td>
                                                <td className='text-center align-middle'>{req?.userSegments?.schoolSegmentName || 'NA'}</td>
                                                <td className='text-center align-middle'>{req?.userSegments?.workSegmentName || 'NA'}</td>
                                                <td className='text-center align-middle'>{userFlags![index].toString()}</td>
                                                <td className='text-center align-middle'>{userFalseFlags![index].toString()}</td>
                                                <td className='text-center align-middle'>{req.banned ? 'Yes' : 'No'}</td>
                                                <td className='text-center align-middle'>{req.reviewed ? 'Yes' : 'No'}</td>
                                                <td className='text-center align-middle'>{req.verified ? 'Yes' : 'No'}</td>
                                            </> :
                                            <>
                                                <td><Form.Control type='text' defaultValue={req.email} onChange={(e) => req.email = e.target.value} /></td>
                                                <td><Form.Control type='text' defaultValue={req.organizationName} onChange={(e) => req.organizationName = e.target.value} /></td>
                                                <td><Form.Control type='text' defaultValue={req.fname} onChange={(e) => req.fname = e.target.value} /></td>
                                                <td><Form.Control type='text' defaultValue={req.lname} onChange={(e) => req.lname = e.target.value} /></td>
                                                <td><Form.Control as='select' onChange={(e) => { (req.userType as string) = e.target.value; }}>
                                                    {userTypes
                                                        .filter((type) => type !== 'SUPER_ADMIN')
                                                        .filter((type) => type !== 'ADMIN')
                                                        .filter((type) => type !== 'SEG_ADMIN')
                                                        .filter((type) => type !== 'MUNICIPAL_SEG_ADMIN')
                                                        .filter((type) => type !== 'DEVELOPER')
                                                        .filter((type) => type !== 'IN_PROGRESS')
                                                        .filter((type) => type !== 'ASSOCIATE')
                                                        .filter((type) => type !== 'MOD')
                                                        .filter((type) => type !== 'SEG_MOD')
                                                        .map((item) => (
                                                            <option key={item}>{item}</option>
                                                        ))}
                                                </Form.Control>
                                                </td>
                                                <td className='text-center align-middle '><Button onClick={() => setShowUserFlagsModal(true)}>Info</Button></td>
                                                <td></td>
                                                <td className='text-center align-middle'>{req.banned ? 'Yes' : 'No'}</td>
                                                <td className='text-center align-middle' ><Form.Check
                                                    type='switch'
                                                    checked={reviewed}
                                                    onChange={(e) => {
                                                        setReviewed(e.target.checked);
                                                        req.reviewed = e.target.checked;
                                                    }}
                                                    id='reviewed-switch' />
                                                </td>
                                                <td className='text-center align-middle'>{req.verified ? 'Yes' : 'No'}</td>
                                            </>
                                        }

                                        <td onClick={e => e.stopPropagation()}>
                                            {req.id !== hideControls ?
                                                <NavDropdown title='Controls' id='nav-dropdown'>
                                                    <Dropdown.Item
                                                        onClick={() => {
                                                            setHideControls(req.id);
                                                            setReviewed(req.reviewed);
                                                            setModalUser(req);
                                                        }}>Edit</Dropdown.Item>
                                                    <Dropdown.Item
                                                        onClick={() => {
                                                            setModalUser(req);
                                                            setShowChangePasswordModal(true);
                                                        }}>Change User Password</Dropdown.Item>
                                                    <Dropdown.Item
                                                        onClick={() =>
                                                            UserSegmentHandler(req.email, req.id)
                                                        }>View Segments</Dropdown.Item>
                                                    {req.banned ?
                                                        <Dropdown.Item
                                                            onClick={() => {
                                                                setModalUser(req);
                                                                setShowUserUnbanModal(true);
                                                            }}>Modify Ban</Dropdown.Item>
                                                        :
                                                        <Dropdown.Item
                                                            onClick={() => {
                                                                setModalUser(req);
                                                                setShowUserBanModal(true);
                                                            }}>Ban User</Dropdown.Item>
                                                    }
                                                    <Dropdown.Item
                                                        onClick={() => getUserBanHistory(req.id).then(data => {
                                                            setModalUser(req);
                                                            setBanHistory(formatBanHistory(data));
                                                            setShowUserBanHistoryModal(true);
                                                        })} >Ban History</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => removeFlagQuarantine(req.id)}>Remove Flag Quarantine</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => removePostCommentQuarantine(req.id)}>Remove Post Comment Quarantine</Dropdown.Item>
                                                    {req.verified !== true &&
                                                        <Dropdown.Item
                                                            onClick={async () => {
                                                                req.verified = true;
                                                                let response = await updateUser(req, token, user);
                                                                if (response?.user?.verified === true) {
                                                                    handleUpdatedLocalUserData(response.user);
                                                                }
                                                            }}>Verify Email</Dropdown.Item>
                                                    }
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
                                                : <>
                                                    <div className='d-flex justify-content-between'>
                                                        <Button size='sm' variant='outline-danger' className='mr-2 mb-2 text-center align-middle' onClick={() => setHideControls('')}>Cancel</Button>
                                                        <Button
                                                            size='sm'
                                                            className='mr-2 mb-2 text-center align-middle'
                                                            onClick={() => {
                                                                setHideControls('');

                                                                updateUser(req, token, user);
                                                            }}>Save</Button>
                                                    </div>
                                                </>
                                            }

                                        </td>
                                    </tr>
                                ) : null))}
                        </tbody>
                    </Table>
                </Form>
                <br></br>
                {/* <UserSegmentHandler/> */}
                {showUserSegmentCard && <UserSegmentInfoCard email={email} id={id} token={token} />}
            </Container>

        );
    }
};
