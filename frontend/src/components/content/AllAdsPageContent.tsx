import React from 'react';
import { Container, Row, Table, Button } from 'react-bootstrap';
import { IAdvertisement } from 'src/lib/types/data/advertisement.type';
import moment from 'moment';
import { API_BASE_URL } from '../../lib/constants';
import {
  deleteAdvertisement,
} from 'src/lib/api/advertisementRoutes';
import { timeDifference } from 'src/lib/utilityFunctions';
interface AllAdsPageContentProps {
  AllAdvertisement: IAdvertisement[] | undefined;
  token: string | null;
}

const AllAdsPageContent: React.FC<AllAdsPageContentProps> = ({
  AllAdvertisement,
  token,
}) => {
 

  async function handleDelete(adsId: number) {
    try {
      await deleteAdvertisement(token, adsId);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Container className="all-ads-page-content w-100">
      <Row className="mb-4 mt-4">
        <h2 className="pb-2 pt-2 display-6">Advertisements Manager</h2>
      </Row>

      <Row className="mb-3">
        <a href="/advertisement/submit">
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
            {AllAdvertisement?.map((item) => (
              <tr key={item.id}>
                <td>
                  <Button
                    className="mb-2"
                    block
                    variant="primary"
                    href={`/advertisement/edit/?id=${item.id}`}
                  >
                    Edit
                  </Button>
                  {/* <a href={`/advertisement/edit/?id=${item.id}`}><Button className='mb-2' block variant="primary" onClick={() => {
                    handleEdit(item.id);
                  }}>Edit</Button></a> */}
                  <Button
                    block
                    variant="outline-danger"
                    onClick={() => {
                      handleDelete(item.id);
                    }}
                  >
                    Delete
                  </Button>
                </td>
                <td>{item.adTitle}</td>
                <td>{item.adType}</td>
                <td>{item.ownerId}</td>
                <td>
                  <img
                    alt=""
                    src={item.imagePath}
                    height="100rem"
                  ></img>
                </td>
                <td>{moment(item.duration).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{item.adPosition}</td>
                <td>
                  <a href={item.externalLink}>{item.externalLink}</a>
                </td>
                <td>{item.published ? 'Yes' : 'No'}</td>
                <td>{timeDifference(new Date(), new Date(item.createdAt))}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

export default AllAdsPageContent;
