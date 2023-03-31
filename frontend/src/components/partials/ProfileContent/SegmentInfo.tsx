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
import { findSegmentByName, getAllSegments, getAllSubSegmentsWithId, getSegmentByName, getSingleSegmentBySegmentId } from 'src/lib/api/segmentRoutes';
import { useAllSegments } from 'src/hooks/segmentHooks';
import { ISegment } from 'src/lib/types/data/segment.type';
import { ISubSegment } from 'src/lib/types/data/segment.type';


// TODO: Add and implement functions for edit and delete

interface SegmentInfoProps {
    user: IUser;
    token: string;
    title: string;
    type: string;
    segmentData: SegmentData;
    geoData: any;
    segments: ISegment[];
    deleteFunction?: (user: string | undefined) => void;
    updateFunction?: (user: string | undefined, data: any) => Promise<void>;
}

interface SegmentData {
    displayFName: string;
    displayLName: string;
    street: string;
    city: string;
    postalCode: string;
    neighborhood: string;
}


export const SegmentInfo: React.FC<SegmentInfoProps> = ({ user, token, title, type, segmentData, geoData, segments, deleteFunction, updateFunction }) => {

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
    const handleSelectClose = () => {
      setSelect(false);
    }
    const handleSelectShow = () => {
        setSelect(true);
        setShow(false);
    };

    const [showDelete, setShowDelete] = useState(false);
    const handleDeleteClose = () => setShowDelete(false);
    const handleDeleteShow = () => setShowDelete(true);

    const [data, setData] = useState<SegmentData>(segmentData);
    const handleDataUpdate = (data: SegmentData) => setData(data);

    const [markers, sendData]:any = useState({home: {lat: null, lon: null},work: {lat: null, lon: null},school: {lat: null, lon: null}});

    const [selectedSegment, setSelectedSegment] = useState<string>("");
    const [subSegments, setSubSegments] = useState<ISubSegment[]>([]);

    const [formCity, setFormCity] = useState<string>(segmentData.city);
    const [formNeighborhood, setFormNeighborhood] = useState<string>(segmentData.neighborhood);

    function handleSegmentChange (e: any) {
        const index = e.target.selectedIndex;
        if (index === 0) {
            setSubSegments([]);
            return;
        }

        getAllSubSegmentsWithId(index).then((res) => {
            console.log(res);
            setSubSegments(res);
        })
    }


    function handleCommunityChange (segName : FormDataEntryValue, subSegName : FormDataEntryValue) {
        console.log(segName, subSegName);
        // Get segment and subsegment using the ids
    }

    function handleUpdateSegment(segId : number, subSegId : number) {
      // Get segment and subsegment using the ids
      const seg = segments.find((seg) => seg.segId === segId);
      const subSeg = subSegments.find((subSeg) => subSeg.id === subSegId);
      if (seg && subSeg) {
        console.log(seg, subSeg);
        setFormCity(seg.name);
        setFormNeighborhood(subSeg.name);
      }
    }

return (
    <>

    <Card style={{ width: '50rem', padding: '1.5rem'}}>
        <Row>
        <Col style={{maxWidth: "10rem"}}>
            <Card.Title className='text-center'>{title}</Card.Title>
        </Col>
        {edit ? 
            (
                <Form
                onSubmit={async (e) => {
                    e.preventDefault();
                    console.log(e.target);
                    // Get form data
                    const formData = new FormData(e.target as HTMLFormElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log(data);
                    updateFunction && await updateFunction(user.id, data);
                    // Reimplement this later
                    // const newData = {
                    //     displayFName: data.displayFName.toString(),
                    //     displayLName: data.displayLName.toString(),
                    //     street: data.streetAddress.toString(),
                    //     city: (data.city ? data.city.toString() : segmentData.city),
                    //     postalCode: data.postalCode.toString(),
                    //     neighborhood: (data.neighborhood ? data.neighborhood.toString() : segmentData.neighborhood)
                    // }
                    window.location.reload();

                }}
                >
                    <Col>
                    <Form.Group controlId='displayName'>
                        <Form.Label><strong>Display Name</strong></Form.Label>
                        <Form.Control name="displayFName" type='text' placeholder='First Name' defaultValue={capitalizeString(segmentData.displayFName)}></Form.Control>
                        <Form.Text>@</Form.Text>
                        <Form.Control name="displayLName" type='text' placeholder='Last Name' defaultValue={capitalizeString(segmentData.displayLName)}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='street'>
                        <Form.Label><strong>Street</strong></Form.Label>
                        <Form.Control name="streetAddress" type='text' placeholder='Street' defaultValue={capitalizeString(segmentData.street)}></Form.Control>
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
                        <Form.Control name="city" type='text' placeholder='City' value={capitalizeString(formCity)} readOnly plaintext></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='postalCode'>
                        <Form.Label><strong>Postal Code / Zip</strong></Form.Label>
                        <Form.Control name="postalCode" type='text' placeholder='Postal Code / Zip' defaultValue={capitalizeString(segmentData.postalCode)}></Form.Control>
                    </Form.Group>
                    <Form.Group controlId='neighborhood'>
                        <Form.Label><strong>Neighborhood</strong>
                        <Button 
                        variant='info' 
                        className='btn-sm' 
                        style={{marginLeft: "1rem"}}
                        onClick={handleShow}
                        > Change Neighbourhood </Button></Form.Label>
                        <Form.Control name="neighbourhood" type='text' placeholder='Neighborhood' value={capitalizeString(formNeighborhood)} readOnly plaintext></Form.Control>
                    </Form.Group>
                    </Col>
                    <Col>
                    <Button variant='primary' type='submit' style={{marginRight: '1rem'}}>Save</Button>
                    <Button variant='danger' className='' onClick={handleEdit}>Cancel</Button>
                    </Col>
                </Form>
            ) : 
            (
                <>
                { segmentData.displayFName == "Unknown" &&
                segmentData.displayLName == "Unknown" &&
                segmentData.street == "Unknown" &&
                segmentData.city == "Unknown" &&
                segmentData.postalCode == "Unknown" &&
                segmentData.neighborhood == "Unknown" ?
                <>
                    <ListGroup variant='flush'>
                        <ListGroupItem><strong>Display Name: </strong></ListGroupItem>
                        <ListGroupItem><strong>Street: </strong></ListGroupItem>
                        <ListGroupItem><strong>City: </strong></ListGroupItem>
                        <ListGroupItem><strong>Postal Code / Zip: </strong></ListGroupItem>
                        <ListGroupItem><strong>Neighborhood: </strong></ListGroupItem>
                    </ListGroup>
                    <ListGroup variant='flush'>
                        <ListGroupItem>{capitalizeString(segmentData.displayFName)}@{capitalizeString(segmentData.displayLName)}</ListGroupItem>
                        <ListGroupItem>{capitalizeString(segmentData.street)}</ListGroupItem>
                        <ListGroupItem>{capitalizeString(formCity)}</ListGroupItem>
                        <ListGroupItem>{segmentData.postalCode.toUpperCase()}</ListGroupItem>
                        <ListGroupItem>{capitalizeString(formNeighborhood)}</ListGroupItem>
                    </ListGroup>
                  </>
                : <>No details exist.</>}
                    <Col style={{maxWidth: "10rem"}}>
                    <Button 
                    variant='primary' 
                    className=''
                    onClick={handleEdit}
                    >Edit
                    </Button> 
            
                    {deleteFunction && <Button variant='danger' className='' onClick={handleDeleteShow}>Delete</Button>}
                    </Col>
                </>

            )
        }
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
            sendData={(markers:any)=>sendData(markers)}
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
            <Form
            onSubmit={(e)=>{
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData.entries());
              // Parse data
              const stringSegId = data.segmentId.toString();
              const stringSubSegId = data.subSegment.toString();
              console.log(data);
              handleUpdateSegment(parseInt(stringSegId), parseInt(stringSubSegId));
              handleSelectClose();
            }}
            >
            <Form.Group controlId={type + "Segment"}>
              <Form.Label>Select your {type} Municipality</Form.Label>
              <Form.Control 
              readOnly 
              name="segmentId" 
              as="select"
              onChange={(e)=>{
                handleSegmentChange(e);
              }}
              >
                <option>Please select a city</option>
                {
                  segments && segments.map((segment: ISegment) => {
                    return <option key={segment.segId} value={segment.segId}>{capitalizeString(segment.name)}
                    </option>
                  })
                }
              </Form.Control>
            </Form.Group>
            <Form.Group controlId={type + "SubSegment"}>
              <Form.Label>Select your Neighbourhood</Form.Label>
              <Form.Control
                as="select"
                name="subSegment"
                onChange={(e)=>{console.log(e)}}
              >
                {
                  subSegments && subSegments.map((subSegment:any) => {
                    return <option key={subSegment.id} value={subSegment.id}>{capitalizeString(subSegment.name)}
                    </option>
                  })
                }
              </Form.Control>
            </Form.Group>
            <Button variant="secondary" onClick={handleSelectClose}>
            Cancel
          </Button>
          <Button 
          className='float-right'
          variant="primary" type='submit'>
            Continue
          </Button>
            </Form>
        </Modal.Body>
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