<<<<<<< HEAD
import { Col, Container, Row } from "react-bootstrap";
import { FaComments, FaClipboard, FaRegUserCircle } from "react-icons/fa";
import { ROUTES } from "@/lib/constants/constants";

const DescriptionSection = () => {
  return (
    <Container style={{ paddingTop: "2rem" }}>
      <h2
        className="pb-1 border-bottom display-6 text-left"
        style={{ paddingInline: "0.5rem" }}
      >
        Share your Ideas
      </h2>
      <Row className="py-3">
        <Col className="text-center py-2">
          <a href={ROUTES.REGISTER} className="custom-button">
            <FaRegUserCircle size={100} className="icon" />
          </a>
          <p className="lead text-center pt-1">Create your account</p>
        </Col>
        <Col className="text-center py-2">
          <a href={ROUTES.SUBMIT_IDEA} className="custom-button">
            <FaClipboard size={100} className="icon" />
          </a>
          <p className="lead text-center pt-1">Post your Idea</p>
        </Col>
        <Col className="text-center py-2">
          <a href={ROUTES.CONVERSATIONS} className="custom-button">
            <FaComments size={100} className="icon" />
          </a>
          <p className="lead text-center pt-1">Take part in Discussion</p>
        </Col>
      </Row>
    </Container>
  );
};

export default DescriptionSection;
=======
import { Col, Container, Row } from 'react-bootstrap';
import { FaComments, FaClipboard, FaRegUserCircle } from 'react-icons/fa';
import { ROUTES } from 'src/lib/constants';

interface DescriptionSectionProps {

}

const DescriptionSection = (props: DescriptionSectionProps) => {
    return (
        <Container style={{ paddingTop: '2rem' }}>
            <h2 className='pb-1 border-bottom display-6 text-left' style={{ paddingInline: '0.5rem' }}>Share your Ideas</h2>
            <Row className='py-3'>
                <Col className='text-center py-2'>
                    <a href={ROUTES.REGISTER} className='custom-button'><FaRegUserCircle size={100} className='icon' />
                    </a>
                    <p className='lead text-center pt-1'>Create your account</p>
                </Col>
                <Col className='text-center py-2'>
                    <a href={ROUTES.SUBMIT_IDEA} className='custom-button'><FaClipboard size={100} className='icon' />
                    </a>
                    <p className='lead text-center pt-1'>Post your Idea</p>

                </Col>
                <Col className='text-center py-2'>
                    <a href={ROUTES.CONVERSATIONS} className='custom-button'><FaComments size={100} className='icon' />
                    </a>
                    <p className='lead text-center pt-1'>Take part in Discussion</p>
                </Col>
            </Row>
        </Container>
    );
};

export default DescriptionSection;
>>>>>>> a042bfddc6c34dd0d5e8f4d746a50c8e6a28fe82
