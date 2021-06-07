import React from 'react'
import { Container, Row, Table, Button} from 'react-bootstrap';
import { IAdvertisement } from 'src/lib/types/data/advertisement.type';
import moment from 'moment';
import { API_BASE_URL } from '../../lib/constants'

// import '../../../../server/uploads'
import '../../scss/content/_allAds.scss'
import { deleteAdvertisement } from 'src/lib/api/advertisementRoutes';

interface AllAdsPageContentProps {
  AllAdvertisement: IAdvertisement[] | undefined
  token: string | null
}

const AllAdsPageContent: React.FC<AllAdsPageContentProps> = ({ AllAdvertisement, token }) => {
  // console.log(AllAdvertisement);
  // const [adsId, setAdsId] = useState<number>();
  // console.log(adsId);

  async function handleDelete(adsId: number) {
    
    try {
      await deleteAdvertisement(token, adsId);
      window.location.reload();
    } catch(err) {
      console.log(err)
    }
  }
  return (
    
    <Container className='all-ads-page-content w-100'>
      <Row className='justify-content-center'>
      <h1 className="pb-1 border-bottom display-6 text-center">Advertisements Manager</h1>
      </Row>

      <Row className='mb-3'>
        <a href='/advertisement/submit'>
          <Button>Create Ads</Button>
        </a>
      </Row>

      <Row>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Actions</th>
              <th>Title</th>
              <th>Type</th>
              <th>Owner ID</th>
              <th>Images</th>
              <th>Expiration</th>
              <th>Position</th>
              <th>Link</th>
              <th>Publish Status</th>
              <th>Create Date</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {AllAdvertisement?.map(item => (
              <tr key={item.id}>
                <td>
                  {/* <a href={`/advertisement/edit/?id=${item.id}`}><Button className='mb-2' block variant="primary">Edit</Button></a> */}
                  <Button block variant="danger" onClick={() => {
                    handleDelete(item.id);
                  }}>Delete</Button>
                </td>
                <td>{item.adTitle}</td>
                <td>{item.adType}</td>
                <td>{item.ownerId}</td>
                <td><img alt="" src={`${API_BASE_URL}/ads/${(item.imagePath).substring(7)}`}></img></td>
                <td>{moment(item.duration).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{item.adPosition}</td>
                <td><a href={item.externalLink}>{item.externalLink}</a></td>
                <td>{item.published.toString()}</td>
                <td>{item.createdAt}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
      
      
    </Container>
  );
}

export default AllAdsPageContent