import React, { useEffect, useState } from 'react'
import { Col, Container, Row, Card, Image, ListGroup, ListGroupItem, Button, Form, Table, NavDropdown, Dropdown, Alert} from 'react-bootstrap';
import { postUserSegmentRequest } from 'src/lib/api/userSegmentRequestRoutes';
import { API_BASE_URL, USER_TYPES } from 'src/lib/constants';
import { IUser } from '../../../lib/types/data/user.type';
import { capitalizeString } from '../../../lib/utilityFunctions';
import { RequestSegmentModal } from '../../partials/RequestSegmentModal';
import StripeCheckoutButton from "src/components/partials/StripeCheckoutButton"
import {getUserSubscriptionStatus} from 'src/lib/api/userRoutes'
import { LinkType, Link, PublicStandardProfile, PublicCommunityBusinessProfile, PublicMunicipalProfile } from 'src/lib/types/data/publicProfile.type'; 
import { getCommunityBusinessProfile, updateCommunityBusinessProfile, getCommunityBusinessLinks, getMunicipalProfile, getStandardProfile, updateStandardProfile,updateMunicipalProfile, getMunicipalLinks } from 'src/lib/api/publicProfileRoutes';
import { postAvatarImage } from 'src/lib/api/avatarRoutes';
import ImageUploader from 'react-images-upload';

interface SegmentInfoProps {
    user: IUser;
    token: string;
    title: string;
    segmentData: SegmentData;
    deleteFunction?: () => void;
}

interface SegmentData {
    displayNameFirst: string;
    displayNameLast: string;
    street: string;
    city: string;
    postalCode: string;
    neighborhood: string;
}


export const SegmentInfo: React.FC<SegmentInfoProps> = ({ user, token, title, segmentData, deleteFunction }) => {

    const [edit, setEdit] = useState(false);

    function handleEdit() {
        // TODO: Add confirmation modal and then edit
        setEdit(!edit);
    }

    function handleDelete() {
        if (deleteFunction) {
            // TODO: Add confirmation modal and then delete 
            setEdit(!edit);
        }
    }


return (
    <Card style={{ width: '40rem', padding: '1.5rem'}}>
        <Row>
        <Col>
            <Card.Title className='text-center'>{title}</Card.Title>
        </Col>
        {edit ? 
            (
                <Form>
                    <Form.Group controlId='displayNameFirst'>
                        <Form.Label><strong>Display Name</strong></Form.Label>
                        <Form.Control type='text' placeholder='First Name' value={capitalizeString(segmentData.displayNameFirst)}></Form.Control>
                        <Form.Text>@</Form.Text>
                        <Form.Control type='text' placeholder='First Name' value={capitalizeString(segmentData.displayNameLast)}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='street'>
                        <Form.Label><strong>Street</strong></Form.Label>
                        <Form.Control type='text' placeholder='Street' value={capitalizeString(segmentData.street)}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='city'>
                        <Form.Label><strong>City</strong></Form.Label>
                        <Form.Control type='text' placeholder='City' value={capitalizeString(segmentData.city)}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='postalCode'>
                        <Form.Label><strong>Postal Code / Zip</strong></Form.Label>
                        <Form.Control type='text' placeholder='Postal Code / Zip' value={segmentData.postalCode.toUpperCase()}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='neighborhood'>
                        <Form.Label><strong>Neighborhood</strong></Form.Label>
                        <Form.Control type='text' placeholder='Neighborhood' value={capitalizeString(segmentData.neighborhood)}></Form.Control>
                    </Form.Group>
                </Form>
            ) : 
            (
                <>
                    <ListGroup variant='flush'>
                        <ListGroupItem><strong>Display Name: </strong></ListGroupItem>
                        <ListGroupItem><strong>Street: </strong></ListGroupItem>
                        <ListGroupItem><strong>City: </strong></ListGroupItem>
                        <ListGroupItem><strong>Postal Code / Zip: </strong></ListGroupItem>
                        <ListGroupItem><strong>Neighborhood: </strong></ListGroupItem>
                    </ListGroup>
                    <ListGroup variant='flush'>
                        <ListGroupItem>{capitalizeString(segmentData.displayNameFirst)} {capitalizeString(segmentData.displayNameLast)}</ListGroupItem>
                        <ListGroupItem>{capitalizeString(segmentData.street)}</ListGroupItem>
                        <ListGroupItem>{capitalizeString(segmentData.city)}</ListGroupItem>
                        <ListGroupItem>{segmentData.postalCode.toUpperCase()}</ListGroupItem>
                        <ListGroupItem>{capitalizeString(segmentData.neighborhood)}</ListGroupItem>
                    </ListGroup>
                </>

            )
        }
        <Col className='text-center justify-content-center'>
            {edit ? (
                <>
                <Button variant='primary' className='' onClick={handleEdit}>Save</Button> 
                <Button variant='danger' className='' onClick={handleEdit}>Cancel</Button>
                </>
            )
            : (
                <>
                    <Button 
                    variant='primary' 
                    className=''
                    onClick={handleEdit}
                    >Edit
                    </Button> 
            
                    {deleteFunction && <Button variant='danger' className=''>Delete</Button>}
                </>
            )
            }
        </Col>
        </Row>
    <br/>
  </Card>
)
}

export default SegmentInfo