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
import Modal from 'react-bootstrap/Modal';
import SimpleMap from 'src/components/map/SimpleMap';

// TODO: Add and implement functions for edit and delete

interface SegmentInfoProps {
    user: IUser;
    token: string;
    title: string;
    type: string;
    segmentData: SegmentData;
    deleteFunction?: (user: string | undefined) => void;
}

interface SegmentData {
    displayNameFirst: string;
    displayNameLast: string;
    street: string;
    city: string;
    postalCode: string;
    neighborhood: string;
}


export const SegmentInfo: React.FC<SegmentInfoProps> = ({ user, token, title, type, segmentData, deleteFunction }) => {

    const [edit, setEdit] = useState(false);

    function handleEdit() {
        // TODO: Add confirmation modal (optional) and then edit
        
        setEdit(!edit);
    }

    function handleDelete() {
        if (deleteFunction) {
            // TODO: Add confirmation modal (optional) and then delete 
            deleteFunction(user.id);
            setEdit(!edit);
        }
    }

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [select, setSelect] = useState(false);
    const handleSelectClose = () => setSelect(false);
    const handleSelectShow = () => {
        setSelect(true);
        setShow(false);
    };

    const [showDelete, setShowDelete] = useState(false);
    const handleDeleteClose = () => setShowDelete(false);
    const handleDeleteShow = () => setShowDelete(true);


return (
    <>

    <Card style={{ width: '50rem', padding: '1.5rem'}}>
        <Row>
        <Col>
            <Card.Title className='text-center'>{title}</Card.Title>
        </Col>
        {edit ? 
            (
                <Form>
                    <Form.Group controlId='displayNameFirst'>
                        <Form.Label><strong>Display Name</strong></Form.Label>
                        <Form.Control type='text' placeholder='First Name' defaultValue={capitalizeString(segmentData.displayNameFirst)}></Form.Control>
                        <Form.Text>@</Form.Text>
                        <Form.Control type='text' placeholder='First Name' defaultValue={capitalizeString(segmentData.displayNameLast)}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='street'>
                        <Form.Label><strong>Street</strong></Form.Label>
                        <Form.Control type='text' placeholder='Street' defaultValue={capitalizeString(segmentData.street)}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='city'>
                        <Form.Label><strong>City</strong>
                        <Button 
                        variant='info' 
                        className='btn-sm' 
                        style={{marginLeft: "1rem"}}
                        onClick={handleShow}
                        > Change City </Button>
                        </Form.Label>
                        <Form.Control type='text' placeholder='City' defaultValue={capitalizeString(segmentData.city)} readOnly plaintext></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='postalCode'>
                        <Form.Label><strong>Postal Code / Zip</strong></Form.Label>
                        <Form.Control type='text' placeholder='Postal Code / Zip' defaultValue={segmentData.postalCode.toUpperCase()}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='neighborhood'>
                        <Form.Label><strong>Neighborhood</strong>
                        <Button 
                        variant='info' 
                        className='btn-sm' 
                        style={{marginLeft: "1rem"}}
                        onClick={handleShow}
                        > Change Neighbourhood </Button></Form.Label>
                        <Form.Control type='text' placeholder='Neighborhood' defaultValue={capitalizeString(segmentData.neighborhood)} readOnly plaintext></Form.Control>
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
                        <ListGroupItem>{capitalizeString(segmentData.displayNameFirst)}@{capitalizeString(segmentData.displayNameLast)}</ListGroupItem>
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
            
                    {deleteFunction && <Button variant='danger' className='' onClick={handleDeleteShow}>Delete</Button>}
                </>
            )
            }
        </Col>
        </Row>
    <br/>
  </Card>
  <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Show us where your {type} is</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <SimpleMap 
            iconName={type}
            ></SimpleMap>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSelectShow}>
            Continue
          </Button>
        </Modal.Footer>
    </Modal>
    <Modal show={select} onHide={handleSelectClose}>
        <Modal.Header closeButton>
          <Modal.Title>Show us where your {type} is</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
            <Form.Group controlId={type + "Segment"}>
              <Form.Label>Your {type} Municipality is</Form.Label>
              <Form.Control readOnly name="schoolSegmentId" defaultValue={capitalizeString('testReplace')}>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId={type + "SubSegment"}>
              <Form.Label>Select your Neighbourhood</Form.Label>
              <Form.Control
                as="select"
                name="sub-segment"
                onChange={(e)=>{console.log(e)}}
              >
              </Form.Control>
            </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSelectClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSelectClose}>
            Continue
          </Button>
        </Modal.Footer>
    </Modal>
    <Modal show={showDelete} onHide={handleDeleteClose}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>
            You are about to delete all of your information on your {type} community. <strong>This cannot be undone.</strong>
            </p>
            <p>
            Would you like to proceed?
            </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
  </>
)
}

export default SegmentInfo