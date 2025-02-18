/* eslint-disable */
import { Field } from 'formik';
import { FormikStep, FormikStepperProps } from '../RegisterPageContent4';
import * as Yup from 'yup';
import { Form as BForm, Button } from 'react-bootstrap';
import { RequestSegmentModal } from 'src/components/partials/RequestSegmentModal';
import { capitalizeFirstLetterEachWord } from 'src/lib/utilityFunctions';
import { Key, useState } from 'react';
import { ISegment, ISubSegment } from 'src/lib/types/data/segment.type';

type CommunityLocationProps = {
    segments: any;
    setSegment: any;
    refactorStateArray: any;
    segIds: any;
    setSegIds: any;
    setSubsegData: any;
    communityType: any;
    setCommunityType: any;
    subIds: any;
    setSubIds: any;
    setShowModal: any;
    showModal: any;
    segmentRequests: any;
    setSegmentRequests: any;
};

const CommunityLocation =({
    subIds,
    segIds,
    setSubIds,
    setSegIds,
    segments,
    setSegment,
    refactorStateArray,
    communityType,
    setShowModal,
    showModal,
    segmentRequests,
    setSegmentRequests,
    setCommunityType,
    setSubsegData,
    ...props
  }: CommunityLocationProps) => {
    const [subSegments, setSubSegments] = useState<ISubSegment[]>();
    const [subSegments2, setSubSegments2] = useState<ISubSegment[]>();
    const [workTransfer, transferHomeToWork] = useState(false);
    const [schoolTransfer, transferWorkToSchool] = useState(false);
    const displaySubSegList = (id: number) => {
        console.log(id);
        if (subSegments && subSegments[0].segId === id) {
            return subSegments?.map((subSeg) => (
                <option key={subSeg.id} value={subSeg.id}>
                    {capitalizeFirstLetterEachWord(subSeg.name)}
                </option>
            ));
        }
        if (subSegments2 && subSegments2[0].segId === id) {
            return subSegments2?.map((subSeg) => (
                <option key={subSeg.id} value={subSeg.id}>
                    {capitalizeFirstLetterEachWord(subSeg.name)}
                </option>
            ));
        }
    };

    return (
    <FormikStep>
        <BForm.Control
    name='homeSegmentId'
    as='select'
    className='mb-3'
    onChange={(e) => {
        const selectedSegment = segments.find(
            (seg: { segId: number }) => seg.segId === parseInt(e.target.value)
        );

        console.log("Selected Segment ID:", e.target.value);
        console.log("Found Segment:", selectedSegment);
        console.log("Before Update - segIds:", segIds);
        console.log("Before Update - subIds:", subIds);

        if (selectedSegment) {
            setSegment(selectedSegment);
            refactorStateArray(segIds, 0, selectedSegment.segId, setSegIds);
            refactorStateArray(subIds, 0, null, setSubIds);
            setSubsegData(selectedSegment.segId);

            console.log("Updated segIds:", segIds);
            console.log("Updated subIds:", subIds);
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
            console.log("Neighbourhood Selected:", e.target.value);
            console.log("Before Update - subIds:", subIds);

            refactorStateArray(subIds, 0, parseInt(e.target.value), setSubIds);

            console.log("Updated subIds:", subIds);
        }}
    >
        <option hidden></option>
        {displaySubSegList(segIds[0])}
    </BForm.Control>
</BForm.Group>



            <BForm.Group>
                <BForm.Label>Select your community relationship</BForm.Label>
                <BForm.Control as="select" value={communityType || ''} onChange={e => setCommunityType(e.target.value)}>
                    <option hidden>Select a type</option>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="school">School</option>
                </BForm.Control>
                <p>
                    Don't see your Municipality?
                    <Button onClick={() => setShowModal(true)} variant="link text-primary">
                        Click here
                    </Button>
                </p>
            </BForm.Group>

            {communityType === 'work' && <WorkDetailsForm />}
            {communityType === 'school' && <SchoolDetailsForm />}

            <RequestSegmentModal
                showModal={showModal}
                setShowModal={setShowModal}
                index={0}
                setSegmentRequests={setSegmentRequests}
                segmentRequests={segmentRequests}
            />
        </FormikStep>
    );
};

const WorkDetailsForm = () => {
    return (
        <FormikStep
            validationSchema={Yup.object({
                workDetails: Yup.object({
                    streetAddress: Yup.string().required('Work Street Name is required'),
                    postalCode: Yup.string().required('Work ZIP / Postal Code is required'),
                    company: Yup.string().required('Company is required'),
                }),
            })}
        >
            <BForm.Group>
                <BForm.Label>Work Street Name</BForm.Label>
                <Field name="workDetails.streetAddress" type="text" as={BForm.Control} required />
            </BForm.Group>
            <BForm.Group>
                <BForm.Label>Work ZIP / Postal Code</BForm.Label>
                <Field name="workDetails.postalCode" type="text" as={BForm.Control} required />
            </BForm.Group>
            <BForm.Group>
                <BForm.Label>Company</BForm.Label>
                <Field name="workDetails.company" type="text" as={BForm.Control} required />
            </BForm.Group>
        </FormikStep>
    );
};

const SchoolDetailsForm = () => {
    return (
        <FormikStep
            validationSchema={Yup.object({
                schoolDetails: Yup.object({
                    streetAddress: Yup.string().required('School Street Name is required'),
                    postalCode: Yup.string().required('School ZIP / Postal Code is required'),
                    faculty: Yup.string().required('Faculty / Department of Study is required'),
                    programCompletionDate: Yup.date()
                        .required('Program Completion Date is required')
                        .typeError('Invalid date format'),
                }),
            })}
        >
            <BForm.Group>
                <BForm.Label>School Street Name</BForm.Label>
                <Field name="schoolDetails.streetAddress" type="text" as={BForm.Control} required />
            </BForm.Group>
            <BForm.Group>
                <BForm.Label>School ZIP / Postal Code</BForm.Label>
                <Field name="schoolDetails.postalCode" type="text" as={BForm.Control} required />
            </BForm.Group>
            <BForm.Group>
                <BForm.Label>Faculty / Department of Study</BForm.Label>
                <Field name="schoolDetails.faculty" type="text" as={BForm.Control} required />
            </BForm.Group>
            <BForm.Group>
                <BForm.Label>Program Completion Date</BForm.Label>
                <Field name="schoolDetails.programCompletionDate" type="date" as={BForm.Control} required />
            </BForm.Group>
        </FormikStep>
    );
};

export default CommunityLocation;
