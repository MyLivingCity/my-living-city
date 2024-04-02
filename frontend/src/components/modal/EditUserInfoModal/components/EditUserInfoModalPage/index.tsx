import React from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { USER_TYPES } from 'src/lib/constants';
import { EditUserInfoModalProps } from '../..';
import { useEditUserInfoModal } from '../../hooks/useEditUserInfoModal';

interface EditUserInfoModalPageProps {
    parentProps: EditUserInfoModalProps;
    hook: ReturnType<typeof useEditUserInfoModal>;
};

const userTypes = Object.keys(USER_TYPES);

const DEFAULT_REGION = { value: '', label: 'Select Region' };
const DEFAULT_MUNICIPALITY = { value: '', label: 'Select Municipality' };
const DEFAULT_COMMUNITY = { value: '', label: 'Select Community' };

export const EditUserInfoModalPage = ({
    parentProps,
    hook
}: EditUserInfoModalPageProps) => {
    const { modalUser } = parentProps;
    return (
        <Container>
            <div className='form-row'>
                <div className='form-group col-md-12'>
                    <label htmlFor='UserTypeData'>User Type</label>
                    <Form.Control as='select' required name='UserTypeData' value={hook.userType} onChange={(event) => { hook.setUserType(event.target.value); }} disabled={hook.editSegmentsOnly}>
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
                    <label htmlFor='inputFirst'>{hook.userType !== USER_TYPES.RESIDENTIAL ? 'Contact ' : ''}First Name</label>
                    <input type='text' className='form-control' id='inputFirst' name='inputFirst' placeholder='John' required value={hook.firstName} onChange={e => hook.setFirstName(e.target.value)} disabled={hook.editSegmentsOnly} />
                </div>
                <div className='form-group col-md-6'>
                    <label htmlFor='inputLast'>{hook.userType !== USER_TYPES.RESIDENTIAL ? 'Contact ' : ''}Last Name</label>
                    <input type='text' className='form-control' id='inputLast' name='inputLast' placeholder='Doe' required value={hook.lastName} onChange={e => hook.setLastName(e.target.value)} disabled={hook.editSegmentsOnly} />
                </div>
            </div>
            {(hook.userType === USER_TYPES.BUSINESS || hook.userType === USER_TYPES.COMMUNITY) && (
                <div className='form-row'>
                    <div className='form-group col-md-12'>
                        <label htmlFor='inputOrg'>Organization Name</label>
                        <input type='text' className='form-control' id='inputOrg' name='inputOrg' placeholder='' required value={hook.organizationName} onChange={e => hook.setOrganizationName(e.target.value)} disabled={hook.editSegmentsOnly} />
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
                        disabled={hook.editSegmentsOnly}
                    />
                </div>
            </div>
            <hr />
            <div className='form-row text-capitalize'>
                <div className='form-group col-md-6'>
                    <label htmlFor='InputHomeRegion'>Home Region</label>
                    <Form.Control className='text-capitalize' name='InputHomeRegion' as='select' required value={hook.selectedHomeSuperSegment} onChange={hook.handleHomeSuperSegmentChange}>
                        <option value={DEFAULT_REGION.value}>{DEFAULT_REGION.label}</option>
                        {hook.superSegOptions?.filter(seg => {
                            if (hook.editSegmentsOnly) {
                                return seg.value === hook.selectedHomeSuperSegment || 
                                    seg.value === hook.editSegmentOnlySegment?.superSegId.toString();
                            }
                            return true;
                        })
                            .map(seg => (
                                <option key={seg.value + 'hr'} value={seg.value} className='text-capitalize'>
                                    {seg.label}
                                </option>
                            ))
                        }
                    </Form.Control>
                </div>
                <div className='form-group col-md-6'>
                    <label htmlFor='inputCom'>Home Municipality</label>
                    <Form.Control className='text-capitalize' as='select' name='inputCom' value={hook.selectedHomeSegment} onChange={hook.handleHomeSegmentChange} disabled={hook.editSegmentsOnly && hook.selectedHomeSuperSegment !== hook.editSegmentOnlySegment?.superSegId.toString()}>
                        <option value={DEFAULT_MUNICIPALITY.value}>{DEFAULT_MUNICIPALITY.label}</option>
                        {hook.homeSegOptions.filter(seg => {
                            if (hook.editSegmentsOnly) {
                                return seg.value === hook.selectedHomeSegment || 
                                    seg.value === hook.editSegmentOnlySegment?.segId.toString();
                            }
                            return true;
                        })
                            .map(seg => (
                                <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                    {seg.label}
                                </option>
                            ))}
                    </Form.Control>
                </div>
                <div className='form-group col-md-6'>
                    <label htmlFor='inputCom'>Home Community</label>
                    <Form.Control className='text-capitalize' as='select' name='inputCom' value={hook.selectedHomeSubSegment} onChange={hook.handleHomeSubSegmentChange} disabled={hook.editSegmentsOnly && hook.selectedHomeSegment !== hook.editSegmentOnlySegment?.segId.toString()}>
                        <option value={DEFAULT_COMMUNITY.label}>{DEFAULT_COMMUNITY.label}</option>
                        {hook.homeSubSegOptions
                            .map(seg => (
                                <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                    {seg.label}
                                </option>
                            ))}
                    </Form.Control>
                </div>
                <div className='form-group col-md-6 d-flex align-items-end'>
                    <label htmlFor='clearHome'></label>
                    <Button variant='danger' className='text-capitalize' name='clearHome' onClick={() => hook.handleClearHomeInfo()}>
                        Clear Home Info
                    </Button>
                </div>
            </div>
            {hook.userType !== USER_TYPES.RESIDENTIAL && (
                <>
                    <hr />
                    <div className='form-row text-capitalize col-md-12'>
                        Reach Segments
                    </div>
                    {hook.selectedHomeSuperSegment ? (
                        <div className='text-capitalize col-md-12 mt-3'>
                            <input
                                type='checkbox'
                                id={'SuperSeg-' + hook.selectedHomeSuperSegment}
                                checked={hook.selectedReachSegIds.length === hook.homeSegOptions.length}
                                onChange={hook.toggleAllReachSegIds}
                                disabled={hook.editSegmentsOnly}
                            />
                            <Form.Label htmlFor={'SuperSeg-' + hook.selectedHomeSuperSegment} style={{ paddingLeft: '10px' }}>
                                {hook.superSegOptions.find(seg => seg.value === hook.selectedHomeSuperSegment)?.label}
                            </Form.Label>

                            {hook.homeSegOptions.map((seg) => (
                                <div key={seg.value} style={{ paddingLeft: '10px' }}>
                                    <input
                                        name={'c' + seg.value}
                                        type='checkbox'
                                        id={seg.value}
                                        value={seg.value}
                                        checked={hook.selectedReachSegIds.includes(seg.value)}
                                        onChange={hook.handleReachSegChange}
                                        disabled={hook.editSegmentsOnly}
                                    />
                                    <Form.Label htmlFor={'c' + seg.value} className='text-capitalize' style={{ paddingLeft: '10px' }}>{seg.label}</Form.Label>
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
            {hook.userType === USER_TYPES.RESIDENTIAL && (
                <>
                    <hr />
                    <div className='form-row'>
                        <div className='form-group col-md-6'>
                            <label htmlFor='inputWorkRegion'>Work Region</label>
                            <Form.Control className='text-capitalize' name='inputWorkRegion' as='select' value={hook.selectedWorkSuperSegment} onChange={hook.handleWorkSuperSegmentChange} >
                                <option value={DEFAULT_REGION.value}>{DEFAULT_REGION.label}</option>
                                {hook.superSegOptions?.filter(seg => {
                                    if (hook.editSegmentsOnly) {
                                        return seg.value === hook.selectedWorkSuperSegment ||
                                            seg.value === hook.editSegmentOnlySegment?.superSegId.toString();
                                    }
                                    return true;
                                }).map(seg => (
                                    <option key={seg.value + 'hr'} value={seg.value} className='text-capitalize'>
                                        {seg.label}
                                    </option>
                                ))}
                            </Form.Control>
                        </div>
                        <div className='form-group col-md-6'>
                            <label htmlFor='inputWorkCommunity'>Work Municipality</label>
                            <Form.Control className='text-capitalize' as='select' name='inputWorkCommunity' onChange={hook.handleWorkSegmentChange} value={hook.selectedWorkSegment} disabled={hook.editSegmentsOnly && hook.selectedWorkSuperSegment !== hook.editSegmentOnlySegment?.superSegId.toString()}>
                                <option value={DEFAULT_MUNICIPALITY.value}>{DEFAULT_MUNICIPALITY.label}</option>
                                {hook.workSegOptions
                                    .filter(seg => {
                                        if (hook.editSegmentsOnly) {
                                            return seg.value === hook.selectedWorkSegment ||
                                                seg.value === hook.editSegmentOnlySegment?.segId.toString();
                                        }
                                        return true;
                                    })
                                    .map(seg => (
                                        <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                            {seg.label}
                                        </option>
                                    ))}
                            </Form.Control>
                        </div>
                        <div className='form-group col-md-6'>
                            <label htmlFor='inputCom'>Work Community</label>
                            <Form.Control className='text-capitalize' as='select' name='inputCom' value={hook.selectedWorkSubSegment} onChange={hook.handleWorkSubSegmentChange} disabled={hook.editSegmentsOnly && hook.selectedWorkSegment !== hook.editSegmentOnlySegment?.segId.toString()}>
                                <option value={DEFAULT_COMMUNITY.label}>{DEFAULT_COMMUNITY.label}</option>
                                {hook.workSubSegOptions
                                    .map(seg => (
                                        <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                            {seg.label}
                                        </option>
                                    ))}
                            </Form.Control>
                        </div>
                        <div className='form-group col-md-6 d-flex align-items-end'>
                            <label htmlFor='clearWork'></label>
                            <Button variant='danger' className='text-capitalize' name='clearWork' onClick={() => hook.handleClearWorkInfo()}>
                                Clear Work Info
                            </Button>
                        </div>
                    </div>
                    <hr />
                    <div className='form-row'>
                        <div className='form-group col-md-6'>
                            <label htmlFor='InputSchoolRegion'>School Region</label>
                            <Form.Control className='text-capitalize' name='InputSchoolRegion' as='select' value={hook.selectedSchoolSuperSegment} onChange={hook.handleSchoolSuperSegmentChange}>
                                <option value={DEFAULT_REGION.value}>{DEFAULT_REGION.label}</option>
                                {hook.superSegOptions?.map(seg => (
                                    <option key={seg.value + 'hr'} value={seg.value} className='text-capitalize'>
                                        {seg.label}
                                    </option>
                                ))}
                            </Form.Control>
                        </div>
                        <div className='form-group col-md-6'>
                            <label htmlFor='inputSchoolCommunity'>School Municipality</label>
                            <Form.Control className='text-capitalize' as='select' name='inputSchoolCommunity' onChange={hook.handleSchoolSegmentChange} value={hook.selectedSchoolSegment} disabled={hook.editSegmentsOnly && hook.selectedSchoolSuperSegment !== hook.editSegmentOnlySegment?.superSegId.toString()}>
                                <option value={DEFAULT_MUNICIPALITY.value}>{DEFAULT_MUNICIPALITY.label}</option>
                                {hook.schoolSegOptions
                                    .filter(seg => {
                                        if (hook.editSegmentsOnly) {
                                            return seg.value === hook.selectedSchoolSegment ||
                                                seg.value === hook.editSegmentOnlySegment?.segId.toString();
                                        }
                                        return true;
                                    })
                                    .map(seg => (
                                        <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                            {seg.label}
                                        </option>
                                    ))}
                            </Form.Control>
                        </div>
                        <div className='form-group col-md-6'>
                            <label htmlFor='inputCom'>School Community</label>
                            <Form.Control className='text-capitalize' as='select' name='inputCom' value={hook.selectedSchoolSubSegment} onChange={hook.handleSchoolSubSegmentChange} disabled={hook.editSegmentsOnly && hook.selectedSchoolSegment !== hook.editSegmentOnlySegment?.segId.toString()}>
                                <option value={DEFAULT_COMMUNITY.label}>{DEFAULT_COMMUNITY.label}</option>
                                {hook.schoolSubSegOptions
                                    .map(seg => (
                                        <option key={seg.value + 'hc'} value={seg.value} className='text-capitalize'>
                                            {seg.label}
                                        </option>
                                    ))}
                            </Form.Control>
                        </div>
                        <div className='form-group col-md-6 d-flex align-items-end'>
                            <label htmlFor='clearSchool'></label>
                            <Button variant='danger' className='text-capitalize' name='clearSchool' onClick={() => hook.handleClearSchoolInfo()}>
                                Clear School Info
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Container>
    );
};
