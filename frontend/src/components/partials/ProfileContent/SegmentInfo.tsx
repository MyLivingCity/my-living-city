import React, { useState } from 'react';
import { Col, Row, Card, ListGroup, ListGroupItem, Button, Form} from 'react-bootstrap';
import { IUser } from '../../../lib/types/data/user.type';
import { capitalizeString } from '../../../lib/utilityFunctions';
import Modal from 'react-bootstrap/Modal';
import SimpleMap from 'src/components/map/SimpleMap';
import { getAllSubSegmentsWithId, getSegmentByName } from 'src/lib/api/segmentRoutes';
import { ISegment } from 'src/lib/types/data/segment.type';
import { ISubSegment } from 'src/lib/types/data/segment.type';
import { get } from 'jquery';


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
    segmentId: number;
    displayFName: string;
    displayLName: string;
    street: string;
    city: string;
    postalCode: string;
    neighborhood: string;
}

interface NeighborhoodDropdownProps {
    subSegments: any[];
    formNeighborhood: string;
    setFormNeighborhood: (value: string) => void;
}

const DEFAULT_MUNICIPALITY = { value: '', label: 'Select Municipality'};
const DEFAULT_NEIGHBORHOOD = { value: '', label: 'Select Neighborhood'};

// Resuable dropdown list for neighborhoods
const NeighborhoodDropdown: React.FC<NeighborhoodDropdownProps> = ({ subSegments, formNeighborhood, setFormNeighborhood }) => {
    return (
        <Form.Group controlId='neighborhood'>
            <Form.Label><strong>Neighborhood</strong></Form.Label>
            <Form.Control
                as='select'
                name='neighbourhood'
                value={formNeighborhood}
                onChange={(e) => {
                    // console.log(e);
                    setFormNeighborhood(e.target.value);
                }}
            >
                <option value={DEFAULT_NEIGHBORHOOD.value}>{DEFAULT_NEIGHBORHOOD.label}</option>
                {
                    subSegments && [...subSegments].sort((a, b) => {
                        if (a.name === formNeighborhood) return -1;
                        if (b.name === formNeighborhood) return 1;
                        return a.name.localeCompare(b.name);
                    }).map((subSegment:any) => {
                        return <option key={subSegment.id} value={subSegment.name}>{capitalizeString(subSegment.name)}
                        </option>;
                    })
                }
            </Form.Control>
        </Form.Group>
    );
};


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
    };
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

    // Display data
    const [displayFName, setDisplayFName] = useState<string>(segmentData.displayFName);
    const [displayLName, setDisplayLName] = useState<string>(segmentData.displayLName);
    const [street, setStreet] = useState<string>(segmentData.street);
    const [postalCode, setPostalCode] = useState<string>(segmentData.postalCode);
    const [subSegments, setSubSegments] = useState<ISubSegment[]>([]);

    const [formCity, setFormCity] = useState<string>(segmentData.city);
    const [formNeighborhood, setFormNeighborhood] = useState<string>(segmentData.neighborhood);

    // Update neighborhood dropdown (sugsegment) when (municipality) segment changes
    function handleSegmentChange (e: any) {
        const selectedSegId = e.target.value;
        if (selectedSegId === 0) {
            setSubSegments([]);
            return;
        }

        getAllSubSegmentsWithId(selectedSegId).then((res) => {
            setSubSegments(res);
        });
    }


    function handleCommunityChange (segName : FormDataEntryValue, subSegName : FormDataEntryValue) {
        // Get segment and subsegment using the ids
    }

    function handleUpdateSegment(segId : number) {
        // Get segment and subsegment using the ids
        const seg = segments.find((seg) => seg.segId === segId);
        if (seg) {
            setFormCity(seg.name);
        } 
    }

    const handleUpdateNeighborhoodOnly = () => {
        handleEdit();
        // segmentId is 0 if it is null in database
        if (segmentData.segmentId !== 0) {
            getAllSubSegmentsWithId(segmentData.segmentId).then((res) => {
                setSubSegments(res);
            });
        } else {
            return {};
        }
    };

    // Clear segment info
    const handleClearSegmentInfo = () => {
        setFormCity('');
        setFormNeighborhood('');
        setSubSegments([]);
    };

    return (
        <>

            <Card style={{ width: '50rem', padding: '1.5rem'}}>
                <Row>
                    <Col style={{maxWidth: '10rem'}}>
                        <Card.Title className='text-center'>{title}</Card.Title>
                    </Col>
                    {edit ? 
                        (
                            <Form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    // Get form data
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    const data = Object.fromEntries(formData.entries());
                                    updateFunction && await updateFunction(user.id, data);
                                    // Reimplement this later
                                    // const newData = {
                                    //     displayFName: data.displayFName.toString(),
                                    //     displayLName: data.displayLName.toString(),
                                    //     street: data.streetAddress.toString(),
                                    //     city: (data.city ? data.city.toString() : segmentData.city),
                                    //     postalCode: data.postalCode.toString(),
                                    //     neighborhood: (data.neighborhood ? data.neighborhood.toString() : segmentData.neighborhood)
                                    // };
                                    window.location.reload();

                                }}
                            >
                                <Col>
                                    <Form.Group controlId='displayName'>
                                        <Form.Label><strong>Display Name</strong></Form.Label>
                                        <Form.Control name='displayFName' type='text' placeholder='First Name' defaultValue={capitalizeString(displayFName)}></Form.Control>
                                        <Form.Text>@</Form.Text>
                                        <Form.Control name='displayLName' type='text' placeholder='Last Name' defaultValue={capitalizeString(displayLName)}></Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId='street'>
                                        <Form.Label><strong>Street</strong></Form.Label>
                                        <Form.Control name='streetAddress' type='text' placeholder='Street' defaultValue={capitalizeString(street)}></Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId='city'>
                                        <Form.Label><strong>Municipality</strong>
                                            <Button 
                                                variant='info' 
                                                className='btn-sm' 
                                                style={{marginLeft: '1rem'}}
                                                onClick={handleShow}
                                            > Change Municipality </Button>
                                        </Form.Label>
                                        <Form.Control name='city' type='text' placeholder='Not Selected' value={capitalizeString(formCity)} readOnly plaintext></Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId='postalCode'>
                                        <Form.Label><strong>Postal Code / Zip</strong></Form.Label>
                                        <Form.Control name='postalCode' type='text' placeholder='Postal Code / Zip' defaultValue={capitalizeString(postalCode)}></Form.Control>
                                    </Form.Group>
                                    <NeighborhoodDropdown
                                        subSegments={subSegments}
                                        formNeighborhood={formNeighborhood}
                                        setFormNeighborhood={setFormNeighborhood} />
                                </Col>
                                <Col>
                                    <Button variant='primary' type='submit' style={{marginRight: '1rem'}}>Save</Button>
                                    <Button variant='danger' className='' style={{marginRight: '1rem'}} onClick={() => {handleEdit(); window.location.reload(); }}>Cancel</Button>
                                    {type !== 'home' && <Button variant='warning' className='' onClick={handleClearSegmentInfo}>Clear Segment Info</Button>}
                                </Col>
                            </Form>
                        ) : 
                        (
                            <>
                                <ListGroup variant='flush'>
                                    <ListGroupItem><strong>Display Name: </strong></ListGroupItem>
                                    <ListGroupItem><strong>Street: </strong></ListGroupItem>
                                    <ListGroupItem><strong>Municipality: </strong></ListGroupItem>
                                    <ListGroupItem><strong>Postal Code / Zip: </strong></ListGroupItem>
                                    <ListGroupItem><strong>Neighborhood: </strong></ListGroupItem>
                                </ListGroup>
                                <ListGroup variant='flush'>
                                    <ListGroupItem>{capitalizeString(displayFName)}@{capitalizeString(displayLName)}</ListGroupItem>
                                    <ListGroupItem>{capitalizeString(street)}</ListGroupItem>
                                    <ListGroupItem>{capitalizeString(formCity)}</ListGroupItem>
                                    <ListGroupItem>{postalCode.toUpperCase()}</ListGroupItem>
                                    <ListGroupItem>{capitalizeString(formNeighborhood)}</ListGroupItem>
                                </ListGroup>
                                <Col style={{maxWidth: '10rem'}}>
                                    <Button 
                                        variant='primary' 
                                        className=''
                                        onClick={
                                            handleUpdateNeighborhoodOnly
                                        }
                                    >Edit
                                    </Button> 
            
                                    {/* {deleteFunction && <Button variant='danger' className='' onClick={handleDeleteShow}>Delete</Button>} */}
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
                    <Button variant='secondary' onClick={handleClose}>
            Cancel
                    </Button>
                    <Button variant='primary' onClick={handleSelectShow}>
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
                            const stringSegId = data.city.toString();
                            handleUpdateSegment(parseInt(stringSegId));
                            handleSelectClose();
                        }}
                    >
                        <Form.Group controlId={type + 'Segment'}>
                            <Form.Label>Select your {type} Municipality</Form.Label>
                            <Form.Control 
                                readOnly 
                                name='city' 
                                as='select'
                                onChange={(e)=>{
                                    handleSegmentChange(e);
                                }}
                            >
                                <option value={DEFAULT_MUNICIPALITY.value}>{DEFAULT_MUNICIPALITY.label}</option>
                                {
                                    segments && segments.filter((segment: ISegment) => segment.name.toLowerCase() !== 'notselected').map((segment: ISegment) => {
                                        return <option key={segment.segId} value={segment.segId}>{capitalizeString(segment.name)}
                                        </option>;
                                    })
                                }
                            </Form.Control>
                        </Form.Group>
                        <NeighborhoodDropdown                                   
                            subSegments={subSegments}
                            formNeighborhood={formNeighborhood}
                            setFormNeighborhood={setFormNeighborhood} />
                                
                        <Button variant='secondary' onClick={handleSelectClose}>
            Cancel
                        </Button>
                        <Button 
                            className='float-right'
                            variant='primary'
                            type='submit'>
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
                    <Button variant='secondary' onClick={handleDeleteClose}>
            Cancel
                    </Button>
                    <Button variant='primary' onClick={handleDelete}>
            Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SegmentInfo;