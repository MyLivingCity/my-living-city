import { Col, Container, Row } from 'react-bootstrap';
import { FaComments, FaClipboard, FaRegUserCircle } from 'react-icons/fa';
import { ROUTES } from 'src/lib/constants';

interface DescriptionSectionProps {

}

const DescriptionSection = (props: DescriptionSectionProps) => {
    return (
        <Container className='py-5'>
            <h2 className='pb-1 border-bottom display-6 text-left'>Share your Ideas</h2>
            <Row className='py-3'>
                <Col className='text-center py-2'>
                    <a href={ROUTES.REGISTER}><FaRegUserCircle size={100} /></a>
                    <p className='lead text-center pt-3'>Create your account</p>
                </Col>
                <Col className='text-center py-2'>
                    <a href={ROUTES.SUBMIT_IDEA}><FaClipboard size={100} /></a>
                    <p className='lead text-center pt-3'>Post your Idea</p>
                </Col>
                <Col className='text-center py-2'>
                    <a href={ROUTES.CONVERSATIONS}><FaComments size={100} /></a>
                    <p className='lead text-center pt-3'>Take part in Discussion</p>
                </Col>
            </Row>
        </Container>
    );
};

export default DescriptionSection;