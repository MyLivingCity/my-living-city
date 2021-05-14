import { Col, Container, Row } from 'react-bootstrap';
import { FaComments, FaClipboard, FaRegUserCircle } from 'react-icons/fa';

interface DescriptionSectionProps {

}

const DescriptionSection = (props: DescriptionSectionProps) => {
  return (
    <Container className='py-5'>
      <h2 className="pb-1 border-bottom display-4 text-center">Share your Ideas</h2>
      <Row className='py-3'>
        <Col className='text-center py-2'>
          <FaRegUserCircle size={150} />
          <p className='lead text-center pt-3'>Create your account</p>
        </Col>
        <Col className='text-center py-2'>
          <FaClipboard size={150} />
          <p className='lead text-center pt-3'>Post your Idea</p>
        </Col>
        <Col className='text-center py-2'>
          <FaComments size={150} />
          <p className='lead text-center pt-3'>Take part in Discussion</p>
        </Col>
      </Row>
    </Container>
  );
}

export default DescriptionSection