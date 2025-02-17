import {Field} from 'formik';
import { FormikStep} from '../RegisterPageContent4';
import * as Yup from 'yup';
import { Form as BForm, Button} from 'react-bootstrap';
import { RequestSegmentModal } from 'src/components/partials/RequestSegmentModal';
import { capitalizeFirstLetterEachWord} from 'src/lib/utilityFunctions';
import { ISegment} from 'src/lib/types/data/segment.type';


type CommunityLocationInter = {
    segments: any;
    setSegment: any; 
    refactorStateArray: any;
    segIds: any;
    setSegIds: any;
    setSubsegData: any;
    displaySubSegList: any; 
    communityType: any;
    setCommunityType: any;
    subIds: any;
    setSubIds: any;
    setShowModal: any;
    showModal: any;
    segmentRequests: any;
    setSegmentRequests: any;
}

function CommunityLocation({
    segments, 
    setSegment, 
    refactorStateArray, 
    segIds, 
    setSegIds, 
    setSubsegData, 
    displaySubSegList, 
    communityType,
    setCommunityType,
    subIds,
    setSubIds,
    setShowModal,
    showModal,
    segmentRequests,
    setSegmentRequests
}: CommunityLocationInter){
    return(
        <>
            <FormikStep>
                <BForm.Control
                    name='homeSegmentId'
                    as='select'
                    className='mb-3'
                    onChange={(e) => {
                        const selectedSegment = segments.find(
                            (seg: { segId: number; }) => seg.segId === parseInt(e.target.value)
                        );
                        if (selectedSegment) {
                            setSegment(selectedSegment);
                            refactorStateArray(segIds, 0, selectedSegment.segId, setSegIds);
                            refactorStateArray(subIds, 0, null, setSubIds);
                            setSubsegData(selectedSegment.segId);
                        }
                    }}
                >
                    <option hidden>Select a municipality</option>
                    {segments.map((seg: ISegment) => (
                        <option key={seg.segId} value={seg.segId}>
                            {capitalizeFirstLetterEachWord(seg.name)}
                        </option>
                    ))}
                </BForm.Control>

                <BForm.Group>
                    <BForm.Label>Select your Neighbourhood (optional)</BForm.Label>
                    <BForm.Control
                        name='homeSubName'
                        as='select'
                        onChange={(e) => {  
                            refactorStateArray(
                                subIds,
                                0,
                                parseInt(e.target.value),
                                setSubIds
                            );
                        }}
                    >
                        <option hidden></option>
                        {displaySubSegList(segIds[0])}
                    </BForm.Control>
                </BForm.Group>
                <BForm.Group>
                    <BForm.Label>Select your community relationship</BForm.Label>
                    <BForm.Control
                        as='select'
                        value={communityType || ''}
                        onChange={(e) => {
                            const type = e.target.value;    
                            setCommunityType(type);
                        }}
                    >
                        <option hidden>Select a type</option>
                        <option value='home'>Home</option>
                        <option value='work'>Work</option>
                        <option value='school'>School</option>
                    </BForm.Control>
                    <p>
            Don't see your Municipality?
                        <Button
                            onClick={() => {
                                setShowModal(true);
                            }}
                            variant='link text-primary'
                        >
            Click here
                        </Button>
                    </p>
                </BForm.Group>

                {communityType === 'work' && (
                    <FormikStep
                        validationSchema={Yup.object().shape({
                            workDetails: Yup.object().shape({
                                streetAddress: Yup.string().required('Work Street Name is required'),
                                postalCode: Yup.string().required('Work ZIP / Postal Code is required'),
                                company: Yup.string().required('Company is required'),
                            }),
                        })}
                    >
                        <BForm.Group>
                            <BForm.Label>Work Street Name</BForm.Label>
                            <Field
                                required={communityType === 'work'} 
                                name='workDetails.streetAddress'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Work ZIP / Postal Code</BForm.Label>
                            <Field
                                required={communityType === 'work'} 
                                name='workDetails.postalCode'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Company</BForm.Label>
                            <Field
                                required={communityType === 'work'} 
                                name='workDetails.company'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                    </FormikStep>
                )}
                {/* Conditionally render School Details */}
                {communityType === 'school' && (
                    <FormikStep
                        validationSchema={Yup.object().shape({
                            schoolDetails: Yup.object().shape({
                                streetAddress: Yup.string()
                                    .required('School Street Name is required'),
                                postalCode: Yup.string()
                                    .required('School ZIP / Postal Code is required'),
                                faculty: Yup.string()
                                    .required('Faculty / Department of Study is required'),
                                programCompletionDate: Yup.date()
                                    .required('Program Completion Date is required')
                                    .typeError('Invalid date format'),
                            }),
                        })}
                    >
                        <BForm.Group>
                            <BForm.Label>School Street Name</BForm.Label>
                            <Field
                                required={communityType === 'school'} 
                                name='schoolDetails.streetAddress'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>School ZIP / Postal Code</BForm.Label>
                            <Field
                                required={communityType === 'school'} 
                                name='schoolDetails.postalCode'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Faculty / Department of Study</BForm.Label>
                            <Field
                                required={communityType === 'school'} 
                                name='schoolDetails.faculty'
                                type='text'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                        <BForm.Group>
                            <BForm.Label>Program Completion Date</BForm.Label>
                            <Field
                                required={communityType === 'school'} 
                                name='schoolDetails.programCompletionDate'
                                type='date'
                                as={BForm.Control}
                            />
                        </BForm.Group>
                    </FormikStep>
                )}

                <RequestSegmentModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    index={0}
                    setSegmentRequests={setSegmentRequests}
                    segmentRequests={segmentRequests}
                />
            </FormikStep>
        </>
    );
};

export default CommunityLocation;