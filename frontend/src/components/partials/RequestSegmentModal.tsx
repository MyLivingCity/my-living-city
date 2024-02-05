import React, { useState } from 'react';
import { Modal, Form, Button, Toast } from 'react-bootstrap';
import { useFormik } from 'formik';
import { COUNTRIES, PROVINCES, TEXT_INPUT_LIMIT } from 'src/lib/constants';
interface RequestSegmentModalProps {
  showModal: boolean;
  setShowModal: any;
  index: number;
  setSegmentRequests: any;
  segmentRequests: any;
}
interface IRequestSegment {
  country: string;
  province: string;
  segmentName: string;
  subSegmentName: string;
}
export const RequestSegmentModal: React.FC<RequestSegmentModalProps> = ({
  showModal,
  setShowModal,
  index,
  setSegmentRequests,
  segmentRequests,
}) => {
  const [show, setShow] = useState(false);
  const refactorSegRequests = (index: number, segDetails: any) => {
    let segDetailsArray = [...segmentRequests];
    segDetailsArray[index] = segDetails;
    setSegmentRequests(segDetailsArray);
  };

  function submitHandler(values: IRequestSegment) {
    refactorSegRequests(index, values);
    setShowModal(false);
    if (values.segmentName !== '') {
      setShow(true);
    }
  }
  const formik = useFormik<IRequestSegment>({
    initialValues: {
      country: COUNTRIES[0],
      province: PROVINCES[0],
      segmentName: '',
      subSegmentName: '',
    },

    onSubmit: submitHandler,
  });
  return (
    <>
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
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
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="province">
              <Form.Label>Province / state</Form.Label>
              <Form.Control
                as="select"
                name="province"
                value={formik.values.province}
                onChange={formik.handleChange}
              >
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
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
      <Toast onClose={() => setShow(false)} show={show} delay={4000} autohide>
        <Toast.Header>
          <strong className="me-auto">Successful community request</strong>
        </Toast.Header>
        <Toast.Body>Thank you for your community request</Toast.Body>
      </Toast>
    </>
  );
};
