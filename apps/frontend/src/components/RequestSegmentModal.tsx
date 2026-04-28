import { useState } from "react";
import { Modal, Form, Button, Toast } from "react-bootstrap";
import { useFormik } from "formik";
import {
  COUNTRIES,
  PROVINCES,
  TEXT_INPUT_LIMIT,
} from "@lib/constants/constants";

interface IRequestSegment {
  country: string;
  province: string;
  segmentName: string;
  subSegmentName: string;
}

type RequestSegmentModalProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  index: number;
  setSegmentRequests: React.Dispatch<React.SetStateAction<IRequestSegment[]>>;
  segmentRequests: IRequestSegment[];
};

export const RequestSegmentModal = ({
  showModal,
  setShowModal,
  index,
  setSegmentRequests,
  segmentRequests,
}: RequestSegmentModalProps) => {
  const [showToast, setShowToast] = useState(false);

  const formik = useFormik<IRequestSegment>({
    initialValues: {
      country: COUNTRIES[0] ?? "",
      province: PROVINCES[0] ?? "",
      segmentName: "",
      subSegmentName: "",
    },
    onSubmit: (values) => {
      const updated = [...segmentRequests];
      updated[index] = values;
      setSegmentRequests(updated);
      setShowModal(false);
      if (values.segmentName !== "") setShowToast(true);
    },
  });

  return (
    <>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Request your community</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={formik.handleSubmit}>
            <Form.Group controlId="country">
              <Form.Label>Country</Form.Label>
              <Form.Control
                as="select"
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="province">
              <Form.Label>Province / State</Form.Label>
              <Form.Control
                as="select"
                name="province"
                value={formik.values.province}
                onChange={formik.handleChange}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="segmentName">
              <Form.Label>Municipality or place name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter municipality"
                value={formik.values.segmentName}
                onChange={formik.handleChange}
                maxLength={TEXT_INPUT_LIMIT.LOCATION}
              />
            </Form.Group>
            <Form.Group controlId="subSegmentName">
              <Form.Label>Neighbourhood</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter neighbourhood"
                value={formik.values.subSegmentName}
                onChange={formik.handleChange}
                maxLength={TEXT_INPUT_LIMIT.LOCATION}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={4000}
        autohide
      >
        <Toast.Header>
          <strong className="me-auto">Successful community request</strong>
        </Toast.Header>
        <Toast.Body>Thank you for your community request</Toast.Body>
      </Toast>
    </>
  );
};
