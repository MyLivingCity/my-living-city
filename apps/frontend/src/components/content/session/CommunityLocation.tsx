import { Field, useFormikContext } from "formik";
import { FormikStep } from "../../ui/session/FormikStep";
import * as Yup from "yup";
import { Form as BForm, Button } from "react-bootstrap";
import {
  getAllSegments,
  findSubsegmentsBySegmentId,
} from "../../../lib/api/segment.routes";
import { RequestSegmentModal } from "../../ui/session/RequestSegmentModal";
import { type ISegment, type ISubSegment } from "../../../types/segment.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { USER_TYPES } from "src/lib/constants";
import { capitalize } from "src/lib/utils";

type BusinessWorkDetails = {
  streetAddress: string;
  postalCode: string;
  organizationName: string;
};

type SegmentRequest = {
  country: string;
  province: string;
  segmentName: string;
  subSegmentName: string;
};

type CommunityLocationProps = {
  segments: ISegment[];
  setSegment: React.Dispatch<React.SetStateAction<ISegment | null>>;
  segIds: number[];
  setSegIds: React.Dispatch<React.SetStateAction<number[]>>;
  setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
  subIds: number[];
  setSubIds: React.Dispatch<React.SetStateAction<number[]>>;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
  segmentRequests: SegmentRequest[];
  setSegmentRequests: React.Dispatch<React.SetStateAction<SegmentRequest[]>>;
  showNext: boolean;
  userType: string;
  businessWorkDetails: BusinessWorkDetails;
  communityType: string | null;
  setCommunityType: React.Dispatch<React.SetStateAction<string | null>>;
};

const WorkDetailsForm = () => (
  <FormikStep
    validationSchema={Yup.object({
      workDetails: Yup.object({
        streetAddress: Yup.string().required("Work Street Name is required"),
        postalCode: Yup.string().required("Work ZIP / Postal Code is required"),
        company: Yup.string().required("Company is required"),
      }),
    })}
  >
    <BForm.Group>
      <BForm.Label>Work Street Name</BForm.Label>
      <Field name="workDetails.streetAddress" type="text" as={BForm.Control} />
    </BForm.Group>
    <BForm.Group>
      <BForm.Label>Work ZIP / Postal Code</BForm.Label>
      <Field name="workDetails.postalCode" type="text" as={BForm.Control} />
    </BForm.Group>
    <BForm.Group>
      <BForm.Label>Company</BForm.Label>
      <Field name="workDetails.company" type="text" as={BForm.Control} />
    </BForm.Group>
  </FormikStep>
);

const SchoolDetailsForm = () => (
  <FormikStep
    validationSchema={Yup.object({
      schoolDetails: Yup.object({
        streetAddress: Yup.string().required("School Street Name is required"),
        postalCode: Yup.string().required(
          "School ZIP / Postal Code is required",
        ),
        faculty: Yup.string().required(
          "Faculty / Department of Study is required",
        ),
        programCompletionDate: Yup.date()
          .required("Program Completion Date is required")
          .typeError("Invalid date format"),
      }),
    })}
  >
    <BForm.Group>
      <BForm.Label>School Street Name</BForm.Label>
      <Field
        name="schoolDetails.streetAddress"
        type="text"
        as={BForm.Control}
      />
    </BForm.Group>
    <BForm.Group>
      <BForm.Label>School ZIP / Postal Code</BForm.Label>
      <Field name="schoolDetails.postalCode" type="text" as={BForm.Control} />
    </BForm.Group>
    <BForm.Group>
      <BForm.Label>Faculty / Department of Study</BForm.Label>
      <Field name="schoolDetails.faculty" type="text" as={BForm.Control} />
    </BForm.Group>
    <BForm.Group>
      <BForm.Label>Program Completion Date</BForm.Label>
      <Field
        name="schoolDetails.programCompletionDate"
        type="date"
        as={BForm.Control}
      />
    </BForm.Group>
  </FormikStep>
);

const CommunityLocation = ({
  segIds,
  setSubIds,
  setSegIds,
  segments,
  setSegment,
  setSegments,
  setShowModal,
  showModal,
  segmentRequests,
  setSegmentRequests,
  showNext,
  userType,
  businessWorkDetails,
}: CommunityLocationProps) => {
  const { setFieldValue, values } = useFormikContext<{
    homeSegmentId: number | undefined;
    homeSubName: number | undefined;
    communityType: string;
    workDetails: { streetAddress: string; postalCode: string; company: string };
  }>();

  const [subSegments, setSubSegments] = useState<ISubSegment[]>([]);
  const [initialLoad, setInitialLoad] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchSubsegData = async (segmentId: number) => {
    try {
      const subsegments = await findSubsegmentsBySegmentId(segmentId);
      setSubSegments(subsegments);
      if (subsegments[0]?.id) {
        setSubIds([subsegments[0].id]);
      }
    } catch (error) {
      console.error("Error fetching subsegments:", error);
    }
  };

  useEffect(() => {
    if (userType === USER_TYPES.COMMUNITY) {
      setFieldValue("communityType", "home");
    } else if (userType === USER_TYPES.BUSINESS) {
      setFieldValue("communityType", "work");
      setFieldValue(
        "workDetails.streetAddress",
        businessWorkDetails.streetAddress,
      );
      setFieldValue("workDetails.postalCode", businessWorkDetails.postalCode);
      setFieldValue(
        "workDetails.company",
        businessWorkDetails.organizationName,
      );
    }
  }, [userType, businessWorkDetails]);

  useEffect(() => {
    if (initialLoad) return;
    const fetchInitialSegments = async () => {
      setIsFetching(true);
      try {
        const fetchedSegments = await getAllSegments();
        setSegments(fetchedSegments);
        if (fetchedSegments.length > 0) {
          const first = fetchedSegments[0];

          setSegment(first!);
          setSegIds([first!.segId]);
          setFieldValue("homeSegmentId", first!.segId);
          await fetchSubsegData(first!.segId);
        }
        setInitialLoad(true);
      } catch (error) {
        console.error("Failed to fetch initial segments:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchInitialSegments();
  }, []);

  const handleSegmentChange = useCallback(
    (value: string) => {
      const selectedId = parseInt(value);

      const selected = segments.find((seg) => seg.segId === selectedId);

      if (selected) {
        setSegment(selected);
        setSegIds([selected.segId]);
        setSubIds([]);
        setFieldValue("homeSegmentId", selected.segId);
        fetchSubsegData(selected.segId);
      }
    },
    [segments],
  );

  const handleSubSegmentChange = useCallback(
    (value: string) => {
      const subId = parseInt(value);

      setSubIds([subId]);
      setFieldValue("homeSubName", subId);
    },
    [setFieldValue],
  );

  const segmentOptions = useMemo(() => {
    if (!Array.isArray(segments)) return [];

    return segments.map((seg) => (
      <option key={seg.segId} value={seg.segId}>
        {capitalize(seg.name)}
      </option>
    ));
  }, [segments]);

  const subSegmentOptions = useMemo(() => {
    if (!subSegments.length || !segIds[0]) return null;
    return subSegments
      .filter((sub) => sub.segId === segIds[0])
      .map((sub) => (
        <option key={sub.id} value={sub.id}>
          {capitalize(sub.name)}
        </option>
      ));
  }, [subSegments, segIds]);

  const validationSchema = showNext
    ? Yup.object({
        homeSegmentId: Yup.number()
          .typeError("Municipality is required")
          .required("Municipality is required"),
        communityType: Yup.string().required(
          "Community relationship is required",
        ),
      })
    : Yup.object({
        homeSegmentId: Yup.number()
          .typeError("Municipality is required")
          .required("Municipality is required"),
      });

  return (
    <FormikStep validationSchema={validationSchema}>
      <BForm.Group>
        <BForm.Label>Select your Municipality</BForm.Label>
        <BForm.Control
          as="select"
          name="homeSegmentId"
          className="mb-3"
          disabled={isFetching}
          value={values.homeSegmentId ?? ""}
          onChange={(e) => handleSegmentChange(e.target.value)}
        >
          <option value="" disabled>
            Select a municipality
          </option>
          {segmentOptions}
        </BForm.Control>
      </BForm.Group>

      <BForm.Group>
        <BForm.Label>Select your Neighbourhood (Optional)</BForm.Label>
        <BForm.Control
          name="homeSubName"
          as="select"
          onChange={(e) => handleSubSegmentChange(e.target.value)}
          disabled={!segIds[0] || !subSegments.length}
          value={values.homeSubName ?? ""}
        >
          <option value="">Select a neighbourhood</option>
          {subSegmentOptions}
        </BForm.Control>
        <p>
          Don't see your Municipality?{" "}
          <Button
            onClick={() => setShowModal(true)}
            variant="link"
            className="text-primary"
          >
            Click here
          </Button>
        </p>
      </BForm.Group>

      {showNext && (
        <>
          <BForm.Group>
            <BForm.Label>Select your community relationship</BForm.Label>
            <Field name="communityType" as="select" className="form-control">
              <option value="" disabled>
                Select a type
              </option>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="school">School</option>
            </Field>
          </BForm.Group>
          {values.communityType === "work" && <WorkDetailsForm />}
          {values.communityType === "school" && <SchoolDetailsForm />}
          <RequestSegmentModal
            showModal={showModal}
            setShowModal={setShowModal}
            index={0}
            setSegmentRequests={setSegmentRequests}
            segmentRequests={segmentRequests}
          />
        </>
      )}
    </FormikStep>
  );
};

export default CommunityLocation;
