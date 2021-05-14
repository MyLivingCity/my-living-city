import { Container } from 'react-bootstrap'

export default function Footer() {
  return (
    <div className="outer-footer">
      <Container fluid className="inner-footer">
        <p className='text-center'>COPYRIGHT &#169; MY LIVING CITY {new Date().getFullYear()}</p>
      </Container>
    </div>
  )
}
