import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import { getAllSegmentsWithSuperSegId, getAllSubSegmentsWithId } from 'src/lib/api/segmentRoutes';
import { updateUser } from 'src/lib/api/userRoutes';
import { getMyUserSegmentInfo, updateUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { ISegment, ISuperSegment } from 'src/lib/types/data/segment.type';
import { IUser } from 'src/lib/types/data/user.type';
import { CheckBoxItem, CheckboxTree } from '../content/RegisterPageContentReach';
import { get } from 'jquery';

interface EditUserInfoModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    modalUser: IUser;
    currentUser: IUser;
    token: string | null;
    segs?: ISuperSegment[] | undefined;
    subSeg?: ISegment[] | undefined;
    changesSaved?: (updatedUser: IUser) => void;
};

interface SelectOption {
    value: string;
    label: string;
}

const userTypes = Object.keys(USER_TYPES);

const DEFAULT_REGION = { value: '', label: 'Select Region'};
const DEFAULT_MUNICIPALITY = { value: '', label: 'Select Municipality'};
const DEFAULT_COMMUNITY = { value: '', label: 'Select Community'};

export const EditUserInfoModal = ({
    setShow,
    show,
    currentUser,
    token,
    modalUser,
    segs,
    subSeg,
    changesSaved,
}: EditUserInfoModalProps) => {
    const [userType, setUserType] = useState(modalUser?.userType as string);
    const [firstName, setFirstName] = useState(modalUser?.fname);
    const [lastName, setLastName] = useState(modalUser?.lname);
    const [organizationName, setOrganizationName] = useState(modalUser?.organizationName);

    const [superSegOptions, setSuperSegOptions] = useState<SelectOption[]>([]);
    const [orginalSegmentInfo, setOrginalSegmentInfo] = useState<IUser['userSegments']>();

    // These Options need to update based on the selected Super Segment
    const [homeSegOptions, setHomeSegOptions] = useState<SelectOption[]>([]);
    const [workSegOptions, setWorkSegOptions] = useState<SelectOption[]>([]);
    const [schoolSegOptions, setSchoolSegOptions] = useState<SelectOption[]>([]);

    // These Options need to update based on the selected Segment
    const [homeSubSegOptions, setHomeSubSegOptions] = useState<SelectOption[]>([]);
    const [workSubSegOptions, setWorkSubSegOptions] = useState<SelectOption[]>([]);
    const [schoolSubSegOptions, setSchoolSubSegOptions] = useState<SelectOption[]>([]);

    // When Super Segment is changed, the Segment Options need to update
    const handleSuperSegmentChange = (
        option: string, 
        SetSuperSegment: (value: React.SetStateAction<string>) => void,
        SetSegment: (value: React.SetStateAction<string>) => void,
        SetSegmentOptions: (value: React.SetStateAction<SelectOption[]>) => void,
        SetSubSegment: (value: React.SetStateAction<string>) => void,
        SetSubSegmentOptions: (value: React.SetStateAction<SelectOption[]>) => void,
        clearSegment?: boolean,
    ) => {
        SetSuperSegment(option);
        if (subSeg && option !== '') {
            const newSegmentOptions = subSeg
                .filter((seg) => seg.superSegId === parseInt(option))
                .map((seg) => ({ label: seg.name, value: seg.segId.toString() }));
            SetSegmentOptions(newSegmentOptions);
        } else {
            SetSegmentOptions([]);
        }
        if (clearSegment) {
            SetSegment('');
            SetSubSegment('');
            SetSubSegmentOptions([]);
        }
    };

    // When Segment is changed, the Sub Segment Options need to update
    const handleSegmentChange = (
        sectionOption: string,
        SetSegment: (value: React.SetStateAction<string>) => void,
        SetSubSegment: (value: React.SetStateAction<string>) => void,
        SetSubSegmentOptions: (value: React.SetStateAction<SelectOption[]>) => void,
        clearSubSeg?: boolean
    ) => {
        SetSegment(sectionOption);
        if (sectionOption && sectionOption !== '') {
            getAllSubSegmentsWithId(sectionOption).then((data) => {
                const subSegOptions = data.map((subSeg) => ({ value: subSeg.id.toString(), label: subSeg.name }));
                SetSubSegmentOptions(subSegOptions);
            });
        } else { SetSubSegmentOptions([]); }
        if (clearSubSeg) { SetSubSegment(''); }
    };

    // All User Types should have a Home Segment
    const [selectedHomeSuperSegment, setSelectedHomeSuperSegment] = useState<string>('');
    const [selectedHomeSegment, setSelectedHomeSegment] = useState<string>('');
    const [selectedHomeSubSegment, setSelectedHomeSubSegment] = useState<string>('');
    const handleHomeSuperSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSuperSegmentChange(event.target.value, setSelectedHomeSuperSegment, setSelectedHomeSegment, setHomeSegOptions, setSelectedHomeSubSegment, setHomeSubSegOptions, true);
    };
    const handleHomeSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSegmentChange(event.target.value, setSelectedHomeSegment, setSelectedHomeSubSegment, setHomeSubSegOptions, true);
    };
    const handleHomeSubSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedHomeSubSegment(event.target.value);
    };
    const handleClearHomeInfo = () => {
        setSelectedHomeSuperSegment('');
        setSelectedHomeSegment('');
        setSelectedHomeSubSegment('');
        setHomeSegOptions([]);
        setHomeSubSegOptions([]);
    };
    
    // Work segment is only for RESIDENTIAL users
    const [selectedWorkSuperSegment, setSelectedWorkSuperSegment] = useState<string>('');
    const [selectedWorkSegment, setSelectedWorkSegment] = useState<string>('');
    const [selectedWorkSubSegment, setSelectedWorkSubSegment] = useState<string>('');

    const handleWorkSuperSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSuperSegmentChange(event.target.value, setSelectedWorkSuperSegment, setSelectedWorkSegment, setWorkSegOptions, setSelectedWorkSubSegment, setWorkSubSegOptions, true);
    };
    const handleWorkSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSegmentChange(event.target.value, setSelectedWorkSegment, setSelectedWorkSubSegment, setWorkSubSegOptions, true);
    };
    const handleWorkSubSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWorkSubSegment(event.target.value);
    };
    const handleClearWorkInfo = () => {
        setSelectedWorkSuperSegment('');
        setSelectedWorkSegment('');
        setSelectedWorkSubSegment('');
        setWorkSegOptions([]);
        setWorkSubSegOptions([]);
    };

    // School segment is only for RESIDENTIAL users
    const [selectedSchoolSuperSegment, setSelectedSchoolSuperSegment] = useState<string>('');
    const [selectedSchoolSegment, setSelectedSchoolSegment] = useState<string>('');
    const [selectedSchoolSubSegment, setSelectedSchoolSubSegment] = useState<string>('');

    const handleSchoolSuperSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSuperSegmentChange(event.target.value, setSelectedSchoolSuperSegment, setSelectedSchoolSegment, setSchoolSegOptions, setSelectedSchoolSubSegment, setSchoolSubSegOptions, true);
    };
    const handleSchoolSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSegmentChange(event.target.value, setSelectedSchoolSegment, setSelectedSchoolSubSegment, setSchoolSubSegOptions, true);
    };
    const handleSchoolSubSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSchoolSubSegment(event.target.value);
    };
    const handleClearSchoolInfo = () => {
        setSelectedSchoolSuperSegment('');
        setSelectedSchoolSegment('');
        setSelectedSchoolSubSegment('');
        setSchoolSegOptions([]);
        setSchoolSubSegOptions([]);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const updatedUserData: IUser = {
            ...modalUser,
            userType: userType as USER_TYPES,
            fname: firstName,
            lname: lastName,
            displayFName: firstName,
            displayLName: lastName,
            organizationName,
            ...orginalSegmentInfo && {userSegments: {
                ...orginalSegmentInfo,
                userId: modalUser?.id || '',
                homeSuperSegId: parseInt(selectedHomeSuperSegment),
                homeSegmentId: parseInt(selectedHomeSegment),
                homeSubSegmentId: parseInt(selectedHomeSubSegment),
                workSuperSegId: parseInt(selectedWorkSuperSegment),
                workSegmentId: parseInt(selectedWorkSegment),
                workSubSegmentId: parseInt(selectedWorkSubSegment),
                schoolSuperSegId: parseInt(selectedSchoolSuperSegment),
                schoolSegmentId: parseInt(selectedSchoolSegment),
                schoolSubSegmentId: parseInt(selectedSchoolSubSegment),
            }},
        };
        try {
            if (updatedUserData.userSegments) {
                const [updateUserResult, updateSegmentResult] = await Promise.all([
                    updateUser(updatedUserData, token, currentUser),
                    updateUserSegmentInfo(updatedUserData.userSegments, token)
                ]);
                // To update the user in the parent component
                changesSaved && changesSaved(updateUserResult.user);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [selectedReachSegIds, setSelectedReachSegIds] = useState<any[]>([]);

    const toggleAllReachSegIds = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedReachSegIds(homeSegOptions.map((seg) => seg.value));
        } else {
            setSelectedReachSegIds([]);
        }
    };

    const handleReachSegChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isCheckboxChecked = event.target.checked;
        let selectedCopy = [...selectedReachSegIds];
        if (isCheckboxChecked) { // Checked
            selectedCopy = [...selectedCopy, event.target.value];
        } else { // Unchecked
            const index = selectedCopy.indexOf(event.target.value);
            if (index !== -1) selectedCopy.splice(index, 1);
        }
        setSelectedReachSegIds(selectedCopy);
    };

    // Get the Segment data for the selected user
    useEffect(() => {
        getMyUserSegmentInfo(token, modalUser?.id)
            .then((data: any) => {
                const segInfo = data;
                setOrginalSegmentInfo(segInfo);

                handleSuperSegmentChange(segInfo?.homeSuperSegId?.toString() || '', setSelectedHomeSuperSegment, setSelectedHomeSegment, setHomeSegOptions, setSelectedHomeSubSegment, setHomeSubSegOptions);
                handleSegmentChange(segInfo?.homeSegmentId?.toString() || '', setSelectedHomeSegment, setSelectedHomeSubSegment, setHomeSubSegOptions);
                setSelectedHomeSubSegment(segInfo.homeSubSegmentId ? segInfo.homeSubSegmentId.toString() : '');
                
                handleSuperSegmentChange(segInfo.workSuperSegId?.toString() || '', setSelectedWorkSuperSegment, setSelectedWorkSegment, setWorkSegOptions, setSelectedWorkSubSegment, setWorkSubSegOptions);
                handleSegmentChange(segInfo.workSegmentId?.toString() || '', setSelectedWorkSegment, setSelectedWorkSubSegment, setWorkSubSegOptions);
                setSelectedWorkSubSegment(segInfo.workSubSegmentId ? segInfo.workSubSegmentId.toString() : '');
                
                handleSuperSegmentChange(segInfo.schoolSuperSegId?.toString() || '', setSelectedSchoolSuperSegment, setSelectedSchoolSegment, setSchoolSegOptions, setSelectedSchoolSubSegment, setSchoolSubSegOptions);
                handleSegmentChange(segInfo.schoolSegmentId?.toString() || '', setSelectedSchoolSegment, setSelectedSchoolSubSegment, setSchoolSubSegOptions);
                setSelectedSchoolSubSegment(segInfo.schoolSubSegmentId ? segInfo.schoolSubSegmentId.toString() : '');

            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalUser?.id]);

    // Create the Super Segment Options
    useEffect(() => {
        if (segs) {
            setSuperSegOptions(segs.map((seg) => ({ value: seg.superSegId.toString(), label: seg.name })));
        }
    }, [segs]);

    console.log('selectedReachIds', selectedReachSegIds);

    return (
        <Modal 
            show={show} 
            onHide={() => setShow(false)}
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title id='contained-modal-title-vcenter'>
                    User Info
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Container>

                        <div className='form-row'>
                            <div className='form-group col-md-12'>
                                <label htmlFor='UserTypeData'>User Type</label>
                                <Form.Control as='select' required name='UserTypeData' value={userType} onChange={(event) => { setUserType(event.target.value);}}>
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
                                <label htmlFor='inputFirst'>{userType !== USER_TYPES.RESIDENTIAL ? 'Contact ' : ''}First Name</label>
                                <input type='text' className='form-control' id='inputFirst' name='inputFirst' placeholder='John' required value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputLast'>{userType !== USER_TYPES.RESIDENTIAL ? 'Contact ' : ''}Last Name</label>
                                <input type='text' className='form-control' id='inputLast' name='inputLast' placeholder='Doe' required value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>
                        {(userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) && (
                            <div className='form-row'>
                                <div className='form-group col-md-12'>
                                    <label htmlFor='inputOrg'>Organization Name</label>
                                    <input type='text' className='form-control' id='inputOrg' name='inputOrg' placeholder='' required value={organizationName} onChange={e => setOrganizationName(e.target.value)} />
                                </div>
                            </div>
                        )}
                        <div className='form-row'>
                            <div className='form-group col-md-12'>
                                <label htmlFor='inputEmail'>Email</label>
                                <Form.Control
                                    type='email'
                                    className='form-control'
                                    id='inputEmail'
                                    name='inputEmail'
                                    placeholder='Email'
                                    value={modalUser?.email}
                                    required
                                    readOnly
                                />
                            </div>
                        </div>
                        <hr />
                        <div className='form-row text-capitalize'>
                            <div className='form-group col-md-6'>
                                <label htmlFor='InputHomeRegion'>Home Region</label>
                                <Form.Control className='text-capitalize' name='InputHomeRegion' as='select' required value={selectedHomeSuperSegment} onChange={handleHomeSuperSegmentChange}>
                                    <option value={DEFAULT_REGION.value}>{DEFAULT_REGION.label}</option>
                                    {superSegOptions?.map(seg => (
                                        <option key={seg.value + 'hr'} value={seg.value} className='text-capitalize'>
                                            {seg.label}
                                        </option>
                                    ))}
                                </Form.Control>
                            </div>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputCom'>Home Municipality</label>
                                <Form.Control className='text-capitalize' as='select' name='inputCom' value={selectedHomeSegment} onChange={handleHomeSegmentChange}>
                                    <option value={DEFAULT_MUNICIPALITY.value}>{DEFAULT_MUNICIPALITY.label}</option>
                                    {homeSegOptions
                                        .map(seg => (
                                            <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                                {seg.label}
                                            </option>
                                        ))}
                                </Form.Control>
                            </div>
                            <div className='form-group col-md-6'>
                                <label htmlFor='inputCom'>Home Community</label>
                                <Form.Control className='text-capitalize' as='select' name='inputCom' value={selectedHomeSubSegment} onChange={handleHomeSubSegmentChange}>
                                    <option value={DEFAULT_COMMUNITY.label}>{DEFAULT_COMMUNITY.label}</option>
                                    {homeSubSegOptions
                                        .map(seg => (
                                            <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                                {seg.label}
                                            </option>
                                        ))}
                                </Form.Control>
                            </div>
                            <div className='form-group col-md-6 d-flex align-items-end'>
                                <label htmlFor='clearHome'></label>
                                <Button variant='danger' className='text-capitalize' name='clearHome' onClick={() => handleClearHomeInfo()}>
                                    Clear Home Info
                                </Button>
                            </div>
                        </div>
                        {userType !== USER_TYPES.RESIDENTIAL && (
                            <>
                                <hr />
                                <div className='form-row text-capitalize col-md-12'>
                                    Reach Segments
                                </div>
                                {selectedHomeSuperSegment ? (
                                    <div className='text-capitalize col-md-12 mt-3'>
                                        <input 
                                            type='checkbox'
                                            id={'SuperSeg-' + selectedHomeSuperSegment} 
                                            checked={ selectedReachSegIds.length === homeSegOptions.length} 
                                            onChange={toggleAllReachSegIds}
                                        />
                                        <Form.Label htmlFor={'SuperSeg-' + selectedHomeSuperSegment} style={{paddingLeft: '10px'}}>
                                            {superSegOptions.find(seg => seg.value === selectedHomeSuperSegment)?.label}
                                        </Form.Label>

                                        {homeSegOptions.map((seg) => (
                                            <div key={seg.value} style={{paddingLeft: '10px'}}>
                                                <input
                                                    name={'c' + seg.value}
                                                    type='checkbox'
                                                    id={seg.value}
                                                    value={seg.value}
                                                    checked={selectedReachSegIds.includes(seg.value)}
                                                    onChange={handleReachSegChange}
                                                />
                                                <Form.Label htmlFor={'c' + seg.value} className='text-capitalize' style={{paddingLeft: '10px'}}>{seg.label}</Form.Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='form-row col-md-12 mt-3'>
                                        <div className='alert alert-warning' role='alert'>
                                            Please select a home region to set reach segments
                                        </div>
                                    </div>
                                )}

                            </>   
                        )}
                        {userType === USER_TYPES.RESIDENTIAL && (
                            <>
                                <hr />
                                <div className='form-row'>
                                    <div className='form-group col-md-6'>
                                        <label htmlFor='inputWorkRegion'>Work Region</label>
                                        <Form.Control className='text-capitalize' name='inputWorkRegion' as='select' value={selectedWorkSuperSegment} onChange={handleWorkSuperSegmentChange}>
                                            <option value={DEFAULT_REGION.value}>{DEFAULT_REGION.label}</option>
                                            {superSegOptions?.map(seg => (
                                                <option key={seg.value + 'hr'} value={seg.value} className='text-capitalize'>
                                                    {seg.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label htmlFor='inputWorkCommunity'>Work Municipality</label>
                                        <Form.Control className='text-capitalize' as='select' name='inputWorkCommunity' onChange={handleWorkSegmentChange} value={selectedWorkSegment}>
                                            <option value={DEFAULT_MUNICIPALITY.value}>{DEFAULT_MUNICIPALITY.label}</option>
                                            {workSegOptions
                                                .map(seg => (
                                                    <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                                        {seg.label}
                                                    </option>
                                                ))}
                                        </Form.Control>
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label htmlFor='inputCom'>Work Community</label>
                                        <Form.Control className='text-capitalize' as='select' name='inputCom' value={selectedWorkSubSegment} onChange={handleWorkSubSegmentChange}>
                                            <option value={DEFAULT_COMMUNITY.label}>{DEFAULT_COMMUNITY.label}</option>
                                            {workSubSegOptions
                                                .map(seg => (
                                                    <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                                        {seg.label}
                                                    </option>
                                                ))}
                                        </Form.Control>
                                    </div>
                                    <div className='form-group col-md-6 d-flex align-items-end'>
                                        <label htmlFor='clearWork'></label>
                                        <Button variant='danger' className='text-capitalize' name='clearWork' onClick={() => handleClearWorkInfo()}>
                                            Clear Work Info
                                        </Button>
                                    </div>
                                </div>
                                <hr />
                                <div className='form-row'>
                                    <div className='form-group col-md-6'>
                                        <label htmlFor='InputSchoolRegion'>School Region</label>
                                        <Form.Control className='text-capitalize' name='InputSchoolRegion' as='select' value={selectedSchoolSuperSegment} onChange={handleSchoolSuperSegmentChange}>
                                            <option value={DEFAULT_REGION.value}>{DEFAULT_REGION.label}</option>
                                            {superSegOptions?.map(seg => (
                                                <option key={seg.value + 'hr'} value={seg.value} className='text-capitalize'>
                                                    {seg.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label htmlFor='inputSchoolCommunity'>School Municipality</label>
                                        <Form.Control className='text-capitalize' as='select' name='inputSchoolCommunity' onChange={handleSchoolSegmentChange} value={selectedSchoolSegment}>
                                            <option value={DEFAULT_MUNICIPALITY.value}>{DEFAULT_MUNICIPALITY.label}</option>
                                            {schoolSegOptions
                                                .map(seg => (
                                                    <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                                        {seg.label}
                                                    </option>
                                                ))}
                                        </Form.Control>
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label htmlFor='inputCom'>School Community</label>
                                        <Form.Control className='text-capitalize' as='select' name='inputCom' value={selectedSchoolSubSegment} onChange={handleSchoolSubSegmentChange}>
                                            <option value={DEFAULT_COMMUNITY.label}>{DEFAULT_COMMUNITY.label}</option>
                                            {schoolSubSegOptions
                                                .map(seg => (
                                                    <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                                        {seg.label}
                                                    </option>
                                                ))}
                                        </Form.Control>
                                    </div>
                                    <div className='form-group col-md-6 d-flex align-items-end'>
                                        <label htmlFor='clearSchool'></label>
                                        <Button variant='danger' className='text-capitalize' name='clearSchool' onClick={() => handleClearSchoolInfo()}>
                                            Clear School Info
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShow(false)}>
                        Close
                    </Button>
                    <Button variant='primary' type='submit'>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
