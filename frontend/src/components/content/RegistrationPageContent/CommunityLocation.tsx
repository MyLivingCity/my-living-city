/* eslint-disable */
import { Field } from 'formik';
import { FormikStep, FormikStepperProps } from '../RegisterPageContent4';
import * as Yup from 'yup';
import { Form as BForm, Button } from 'react-bootstrap';
import { getAllSegments, findSubsegmentsBySegmentId } from 'src/lib/api/segmentRoutes';
import { RequestSegmentModal } from 'src/components/partials/RequestSegmentModal';
import { capitalizeFirstLetterEachWord, refactorStateArray } from 'src/lib/utilityFunctions';
import { ISegment, ISubSegment } from 'src/lib/types/data/segment.type';
import { useCallback, useEffect, useMemo, useState } from 'react';

type CommunityLocationProps = {
    segments: any;
    setSegment: any;
    refactorStateArray: any;
    segIds: any;
    setSegIds: any;
    communityType: any;
    setCommunityType: any;
    setSegments: any;
    subIds: any;
    setSubIds: any;
    setShowModal: any;
    showModal: any;
    segmentRequests: any;
    setSegmentRequests: any;
};

const CommunityLocation = ({
    subIds,
    segIds,
    setSubIds,
    setSegIds,
    segments,
    setSegment,
    refactorStateArray,
    communityType,
    setShowModal,
    setSegments,
    showModal,
    segmentRequests,
    setSegmentRequests,
    setCommunityType,
}: CommunityLocationProps) => {
    const [subSegments, setSubSegments] = useState<ISubSegment[]>([]);
    const [initialLoad, setInitialLoad] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // NEW: helper to fetch and set subsegments (neighbours)
    const fetchSubsegData = async (segmentId: number) => {
      try {
        const subsegments = await findSubsegmentsBySegmentId(segmentId);
        console.log('Fetched Subsegments for Segment ID', segmentId, subsegments);
        setSubSegments(subsegments);
        // Set the first subsegment as default if available.
        refactorStateArray(subIds, 0, subsegments[0]?.id || null, setSubIds);
      } catch (error) {
        console.error('Error fetching subsegments:', error);
      }
    };

    // Fetch initial segments only once on mount
    useEffect(() => {
      const fetchInitialSegments = async () => {
        if (initialLoad) return;
        setIsFetching(true);
        
        try {
          const fetchedSegments = await getAllSegments();
          setSegments(fetchedSegments);
          
          if (fetchedSegments.length > 0) {
            const initialSegment = fetchedSegments[0];
            setSegment(initialSegment);
            refactorStateArray(segIds, 0, initialSegment.segId, setSegIds);
          
            await fetchSubsegData(initialSegment.segId);
          }
          setInitialLoad(true);
        } catch (error) {
          console.error('Failed to fetch initial segments:', error);
        } finally {
          setIsFetching(false);
        }
      };
  
      fetchInitialSegments();
    }, []); 
  
    const handleSegmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = parseInt(e.target.value);
      const selectedSegment = segments.find((seg: ISegment) => seg.segId === selectedId);
      
      if (selectedSegment) {
        setSegment(selectedSegment);
        refactorStateArray(segIds, 0, selectedSegment.segId, setSegIds);
        refactorStateArray(subIds, 0, null, setSubIds);
        fetchSubsegData(selectedSegment.segId);
      }
    }, [segments, setSegment, segIds, subIds, setSegIds, setSubIds]);
  
    
    const handleSubSegmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      refactorStateArray(subIds, 0, parseInt(e.target.value), setSubIds);
    }, [subIds, setSubIds]);
  
    const segmentOptions = useMemo(() => 
      segments.map((seg: ISegment) => (
        <option key={seg.segId} value={seg.segId}>
          {capitalizeFirstLetterEachWord(seg.name)}
        </option>
      ))
    , [segments]);
  
    const subSegmentOptions = useMemo(() => {
      if (!subSegments.length || !segIds[0]) return null;
      
      return subSegments
        .filter(sub => sub.segId === segIds[0])
        .map(sub => (
          <option key={sub.id} value={sub.id}>
            {capitalizeFirstLetterEachWord(sub.name)}
          </option>
        ));
    }, [subSegments, segIds]);
  
    return (
      <FormikStep>
        <BForm.Group>
            <BForm.Label>Select your Municipality</BForm.Label>
            <BForm.Control
          name='homeSegmentId'
          as='select'
          className='mb-3'
          onChange={handleSegmentChange}
          disabled={isFetching}
        >
          <option hidden>Select a municipality</option>
          {segmentOptions}
        </BForm.Control>
  
        </BForm.Group>
        
        <BForm.Group>
        <BForm.Label>Select your Neighbourhood (Optional)</BForm.Label>
          <BForm.Control
            name='homeSubName'
            as='select'
            onChange={handleSubSegmentChange}
            disabled={!segIds[0] || !subSegments.length}
          >
            <option hidden>Select a neighbourhood</option>
            {subSegmentOptions}
          </BForm.Control>
          <p>
            Don't see your Municipality?
            <Button onClick={() => setShowModal(true)} variant="link text-primary">
              Click here
            </Button>
          </p>
        </BForm.Group>
  
        <BForm.Group>
          <BForm.Label>Select your community relationship</BForm.Label>
          <BForm.Control 
            as="select" 
            value={communityType || ''} 
            onChange={e => setCommunityType(e.target.value)}
          >
            <option hidden>Select a type</option>
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="school">School</option>
          </BForm.Control>
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
