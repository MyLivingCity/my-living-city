import React, { useContext, useState } from 'react';
import { Container, Row, Table, Button, Form, Card, Col, Dropdown } from 'react-bootstrap';
import { IAdvertisement, ISegmentAdPrice, IDefaultAdPrice } from 'src/lib/types/data/advertisement.type';
import { IUser } from '../../lib/types/data/user.type';
import moment from 'moment';
import { API_BASE_URL, USER_TYPES } from '../../lib/constants';
import {
    deleteAdvertisement, 
    updateSegmentAdPrice, 
    updateDefaultAdPrice,
    deleteSegmentAdPrice,
} from 'src/lib/api/advertisementRoutes';
import { timeDifference } from 'src/lib/utilityFunctions';
import { UserProfileContext } from '../../contexts/UserProfile.Context';

interface AllAdsPageContentProps {
    AllAdvertisement: IAdvertisement[] | undefined;
    token: string | null;
    user: IUser | null;
    segmentAdPrices?: ISegmentAdPrice[];
    defaultAdPrice?: IDefaultAdPrice | undefined;
    refetchPricing?: () => void;
}

const AllAdsPageContent: React.FC<AllAdsPageContentProps> = ({
    AllAdvertisement,
    token,
    user,
    segmentAdPrices,
    defaultAdPrice,
    refetchPricing,
}) => {
    // Segment price inline editing
    const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null);
    const [draftSegmentPrice, setDraftSegmentPrice] = useState('');

    // Default price inline editing
    const [editingDefault, setEditingDefault] = useState(false);
    const [draftDefaultPrice, setDraftDefaultPrice] = useState('');

    // Segment price handlers
    const handleSegmentEditClick = (row: ISegmentAdPrice) => {
        setEditingSegmentId(row.segmentId);
        setDraftSegmentPrice(row.weeklyPrice ?? '');
    };

    const handleSegmentSave = async (row: ISegmentAdPrice) => {
        if (!token) return;
        try {
            await updateSegmentAdPrice(row.segmentId, { weeklyPrice: draftSegmentPrice }, token);
            setEditingSegmentId(null);
            refetchPricing?.();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSegmentReset = async (row: ISegmentAdPrice) => {
        if (!token) return;
        try {
            await deleteSegmentAdPrice(row.segmentId, token);
            refetchPricing?.();
        } catch (err) {
            console.error(err);
        }
    };

    // Default price handlers
    const handleDefaultEditClick = () => {
        if (!defaultAdPrice) return;
        setEditingDefault(true);
        setDraftDefaultPrice(defaultAdPrice.weeklyPrice);
    };

    const handleDefaultSave = async () => {
        if (!token || !defaultAdPrice) return;
        try {
            await updateDefaultAdPrice(defaultAdPrice.id, { weeklyPrice: draftDefaultPrice }, token);
            setEditingDefault(false);
            refetchPricing?.();
        } catch (err) {
            console.error(err);
        }
    };

    async function handleDelete(adsId: number) {
        try {
            await deleteAdvertisement(token, adsId);
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const formatExpiration = (duration: number) => {
        const expirationDate = moment(duration);
        const now = moment();

        if (expirationDate.isBefore(now)) {
            return 'Expired';
        }

        return expirationDate.format('YYYY-MM-DD HH:mm:ss');
    };

    return (
        <Container className='all-ads-page-content w-100'>
            <Row className='mb-4 mt-4'>
                <h2 className='pb-2 pt-2 display-6'>Advertisements Manager</h2>
            </Row>

            {user?.userType === USER_TYPES.ADMIN && (
                <>
                    <Row className='mb-4'>
                        <Col xs={12}>
                            <Card>
                                <Card.Header className='text-capitalize'>
                                    Ad Pricing
                                </Card.Header>

                                <Card.Body className='pb-0'>

                                    <Row className='mb-3 align-items-center'>
                                        <div className='d-flex align-items-center px-2 gap-3'>
                                            <strong>Default Weekly Price:</strong>
                                            {editingDefault ? (
                                                <>
                                                    <Form.Control
                                                        type='text'
                                                        value={draftDefaultPrice}
                                                        onChange={e => setDraftDefaultPrice(e.target.value)}
                                                        style={{ width: '120px' }}
                                                    />
                                                    <Button size='sm' onClick={handleDefaultSave}>Save</Button>
                                                    <Button size='sm' variant='outline-danger' onClick={() => setEditingDefault(false)}>Cancel</Button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className='me-2'>${defaultAdPrice?.weeklyPrice ?? '—'}</span>
                                                    <Button size='sm' variant='primary' onClick={handleDefaultEditClick}>Edit</Button>
                                                </>
                                            )}
                                        </div>
                                    </Row>

                                    <Row>
                                        <Table bordered hover size='sm'>
                                            <thead>
                                                <tr>
                                                    <th>Segment</th>
                                                    <th>Weekly Price</th>
                                                    <th>Controls</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {segmentAdPrices?.map(row => (
                                                    <tr key={row.segmentId}>
                                                        <td className='p-2'>{row.segmentName}</td>
                                                        <td className='p-2'>
                                                            {editingSegmentId === row.segmentId ? (
                                                                <Form.Control
                                                                    type='text'
                                                                    value={draftSegmentPrice}
                                                                    onChange={e => setDraftSegmentPrice(e.target.value)}
                                                                    style={{ width: '120px' }}
                                                                />
                                                            ) : (
                                                                row.weeklyPrice
                                                                    ? `$${row.weeklyPrice}`
                                                                    : <span className='text-muted'>Default (${defaultAdPrice?.weeklyPrice ?? '—'})</span>
                                                            )}
                                                        </td>
                                                        <td className='pl-2'>
                                                            {editingSegmentId === row.segmentId ? (
                                                                <>
                                                                    <Button size='sm' onClick={() => handleSegmentSave(row)}>Save</Button>{' '}
                                                                    <Button size='sm' variant='outline-danger' onClick={() => setEditingSegmentId(null)}>Cancel</Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Dropdown>
                                                                        <Dropdown.Toggle variant='link' className='p-0'>
                                                                            Controls
                                                                        </Dropdown.Toggle>
                                                                    
                                                                        <Dropdown.Menu>
                                                                            <Dropdown.Item onClick={() => handleSegmentEditClick(row)}>
                                                                                Edit
                                                                            </Dropdown.Item>
                                                                            <Dropdown.Item onClick={() => handleSegmentReset(row)} className='text-danger'>
                                                                                Reset
                                                                            </Dropdown.Item>
                                                                        </Dropdown.Menu>
                                                                    </Dropdown>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Row>

                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className='p-2'></div>
                </>
            )}

            <Row className='mb-3 mt-2'>
                <a href='/advertisement/submit'>
                    <Button>Create Paid Ads</Button>
                </a>
                <a className='ml-2' href='/advertisement/complimentary'>
                    <Button>Create Complimentary Ad</Button>
                </a>
            </Row>

            <Row>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Owner Email</th>
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
                                        className='mb-2'
                                        block
                                        variant='primary'
                                        href={`/advertisement/edit/?id=${item.id}`}
                                    >
                    Edit
                                    </Button>
                                    {/* <a href={`/advertisement/edit/?id=${item.id}`}><Button className='mb-2' block variant="primary" onClick={() => {
                    handleEdit(item.id);
                  }}>Edit</Button></a> */}
                                    <Button
                                        block
                                        variant='outline-danger'
                                        onClick={() => {
                                            handleDelete(item.id);
                                        }}
                                    >
                    Delete
                                    </Button>
                                </td>
                                <td>{item.adTitle}</td>
                                <td>{item.adType}</td>
                                <td>{item.ownerEmail}</td>
                                <td>
                                    <img
                                        alt=''
                                        src={item.imagePath}
                                        height='100rem'
                                    ></img>
                                </td>
                                <td>{formatExpiration(item.duration)}</td>
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
