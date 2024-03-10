import { Row } from 'react-bootstrap';
import { AdsSectionPage } from 'src/pages/AdsSectionPage';

export default function Footer() {
    return (
        <div style={{bottom:0, textAlign:'center', backgroundColor: 'transparent', position: 'relative', marginTop: 400}} className='footer-copyright text-center w-100 ml-0 push'>
            <p className='fluid'>COPYRIGHT &#169; MY LIVING CITY {new Date().getFullYear()}</p>

            {/* Mobile View <= 768px */}
            <Row className='d-md-none'>
                <AdsSectionPage />
            </Row>
        </div>
    );
}
