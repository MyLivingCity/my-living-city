import React from 'react';
import {
    Table,
    Form,
    Button,
    Col,
    Container,
    Row,
    Card,
    Alert,
    NavDropdown,
} from 'react-bootstrap';
import { useState } from 'react';
import {
    ISegment,
    ISubSegment,
    ISegmentRequest,
    ISuperSegment,
} from '../../lib/types/data/segment.type';
import { IFetchError } from '../../lib/types/types';
import { capitalizeString } from '../../lib/utilityFunctions';
import {
    createSegment,
    createSubSegment,
    updateSegment,
    updateSubSegment,
    updateSuperSegment,
} from '../../lib/api/segmentRoutes';
import { ShowSubSegmentsPage } from 'src/pages/ShowSubSegmentsPage';
import { UserSegmentRequestCard } from '../partials/UserSegmentRequestCard';
import { COUNTRIES, PROVINCES } from 'src/lib/constants';
import { Dropdown } from 'react-bootstrap';
import { capitalizeFirstLetterEachWord } from './../../lib/utilityFunctions';

export interface ShowSubSegmentsProps {
    segId: number;
    token: string;
    segName: string | null | undefined;
    data?: ISubSegment[] | undefined;
}
export const ShowSubSegments: React.FC<ShowSubSegmentsProps> = ({
    data,
    segId,
    segName,
    token,
}) => {
    // const {data} = useAllSubSegmentsWithId(String(segId!));
    const [hideControls, setHideControls] = useState('');
    const [showNewSubSeg, setShowNewSubSeg] = useState(false);
    const [error, setError] = useState<IFetchError | null>(null);
    let createData = {} as ISubSegment;
    const handleSubSegSubmit = async (updateData?: any) => {
        try {
            if (updateData) {
                if (!updateData.name) {
                    setError(Error('Please enter a sub-segment name when updating'));
                    throw error;
                }
                if (!updateData.lat || !updateData.lon) {
                    setError(Error('Please enter lat and lon when updating sub-segment'));
                    throw error;
                }
                if (!updateData.radius) {
                    setError(Error('Please enter a radius when updating sub-segment'));
                    throw error;
                }
                await updateSubSegment(updateData, token);
            } else {
                if (!createData.name) {
                    setError(Error('Please enter a name when creating a sub-segment'));
                    throw error;
                }
                if (!createData.lat || !createData.lon) {
                    setError(
                        Error('Please enter a lat and long when creating a segment')
                    );
                    throw error;
                }
                if (data) {
                    const found = data!.find(
                        (element) => element.name === createData.name
                    );
                    if (found) {
                        setError(Error('A Sub-segment with this name already exists'));
                        throw error;
                    }
                }

                createData.segId = segId;
                await createSubSegment(createData, token);
                if (data) data.push(createData);
            }
            setShowNewSubSeg(false);
            setError(null);
        } catch (error) {
            console.log(error);
            // setShowNewSubSeg(false);
        }
    };
    const sleep = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };
    return (
        <Card>
            {/* <img alt=""src={"http://localhost:3001/static/uploads/1621449457193-SampleAds1.png"} /> */}
            <Card.Header>
                {capitalizeString(segName!)} Sub-Segments{' '}
                <Button
                    className='float-right'
                    size='sm'
                    onClick={(e) => {
                        setShowNewSubSeg(true);
                    }}
                >
                    Add New Sub-Segments
                </Button>
            </Card.Header>
            <Card.Body>
                <Table bordered hover size='sm'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Lat</th>
                            <th>Lon</th>
                            <th>Radius</th>
                            <th style={{ width: '10rem' }}>Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((segment: ISubSegment) => (
                            <tr key={segment.id}>
                                {String(segment.id) !== hideControls ? (
                                    <>
                                        <td>
                                            {segment.name ? capitalizeString(segment.name) : ''}
                                        </td>
                                        <td>{segment.lat}</td>
                                        <td>{segment.lon}</td>
                                        <td>{segment.radius}</td>
                                        <td>
                                            <NavDropdown title='Controls' id='nav-dropdown'>
                                                <Dropdown.Item
                                                    onClick={() => setHideControls(String(segment.id))}
                                                >
                                                    Edit
                                                </Dropdown.Item>
                                            </NavDropdown>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>
                                            <Form.Control
                                                type='text'
                                                defaultValue={capitalizeString(segment.name)}
                                                onChange={(e) => {
                                                    segment.name = e.target.value;
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type='text'
                                                defaultValue={segment.lat}
                                                onChange={(e) => {
                                                    segment.lat = parseFloat(e.target.value);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type='text'
                                                defaultValue={segment.lon}
                                                onChange={(e) => {
                                                    segment.lon = parseFloat(e.target.value);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type='text'
                                                defaultValue={segment.radius}
                                                onChange={(e) => {
                                                    segment.radius = parseFloat(e.target.value);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <Button
                                                size='sm'
                                                variant='outline-danger'
                                                className='mr-2'
                                                onClick={() => setHideControls('')}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size='sm'
                                                onClick={() => {
                                                    handleSubSegSubmit(segment);
                                                    setHideControls('');
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {showNewSubSeg && (
                            <tr>
                                <td>
                                    <Form.Control
                                        type='text'
                                        onChange={(e) => (createData.name = e.target.value)}
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        type='text'
                                        onChange={(e) =>
                                            (createData.lat = parseFloat(e.target.value))
                                        }
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        type='text'
                                        onChange={(e) =>
                                            (createData.lon = parseFloat(e.target.value))
                                        }
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        type='text'
                                        onChange={(e) =>
                                            (createData.radius = parseFloat(e.target.value))
                                        }
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Button
                                        type='submit'
                                        size='sm'
                                        onClick={() => {
                                            handleSubSegSubmit();
                                            sleep(6000);
                                            window.location.reload();
                                        }}
                                    >
                                        Add Sub-Segment
                                    </Button>{' '}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                {error && (
                    <Alert variant='danger' className='error-alert'>
                        {error.message}
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};

interface ShowSegmentsProps {
    segments: ISegment[] | undefined;
    token: string;
    segReq: ISegmentRequest[] | undefined;
    superSegments: ISuperSegment[] | undefined;
}
//NOTES
//Currently requesting all segments from the database. In future only request the segments that are needed.
//Segments are filtered on the front-end by country/province. Will need to query by these params to limit the amount of segments returned.
//Only handling Canadian Provinces, will need to be able to add other countries as well in the future.
export const ShowSegments: React.FC<ShowSegmentsProps> = ({
    segments,
    token,
    segReq,
    superSegments,
}) => {
    const [hideControls, setHideControls] = useState('');
    const [showNewSeg, setShowNewSeg] = useState(false);
    const [segId, setSegId] = useState<number | null>(null);
    const [segName, setSegName] = useState<string | null>(null);
    const [error, setError] = useState<IFetchError | null>(null);
    const [showSub, setShowSub] = useState(false);
    const [provName, setProvName] = useState(PROVINCES[0].toLowerCase());
    const [countryName, setCountryName] = useState(COUNTRIES[0].toLowerCase());
    const filteredSegments = segments!.filter(
        (segment) =>
            segment.province === provName && segment.country === countryName
    );

    const filteredSuperSegments = superSegments!.filter(
        (segment) =>
            segment.province.toLowerCase() === provName.toLowerCase() && segment.country.toLowerCase() === countryName.toLowerCase()
    );
    const [newSuperSegment, setNewSuperSegment] = useState({name: ''});

    let createData = {} as ISegment;
    const handleSegSubmit = async (updateData?: any) => {
        try {
            if (updateData) {
                if (!updateData.name) {
                    setError(Error('Please enter a segment name when updating'));
                    throw error;
                }
                await updateSegment(updateData, token);
            } else {
                if (!createData.name) {
                    setError(Error('Please enter a name when creating a segment'));
                    throw error;
                }
                const found = segments!.find(
                    (element) => element.name === createData.name
                );
                if (found) {
                    setError(Error('A Segment with this name already exists'));
                    throw error;
                }
                createData.country = countryName;
                createData.province = provName;
                await createSegment(createData, token);
                if (segments) segments.push(createData);
            }
            setShowNewSeg(false);
            setError(null);
        } catch (error) {
            console.log(error);
        }
    };
    const handleSuperSegSubmit = async (updateData?: any) => {
        try {
            if (updateData) {
                if (!updateData.name) {
                    setError(Error('Please enter a segment name when updating'));
                    throw error;
                }
                await updateSuperSegment(updateData, token);
            } else {
                if (!newSuperSegment.name) {
                    setError(Error('Please enter a name when creating a segment'));
                    throw error;
                }
                const found = segments!.find(
                    (element) => element.name === createData.name
                );
                if (found) {
                    setError(Error('A Segment with this name already exists'));
                    throw error;
                }
                createData.country = countryName;
                createData.province = provName;
                await createSegment(createData, token);
                if (segments) segments.push(createData);
            }
            setShowNewSeg(false);
            setError(null);
        } catch (error) {
            console.log(error);
        }
    };
    const sleep = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };
    return (
        <div className='wrapper'>
            <Row>
                <Col>
                    <Form.Group>
                        <Card>
                            <Card.Header>Enter a location to manage</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control
                                            size='sm'
                                            as='select'
                                            name='country'
                                            onChange={(e) => {
                                                setCountryName(e.target.value.toLowerCase());
                                                setShowSub(false);
                                                setShowNewSeg(false);
                                            }}
                                        >
                                            {COUNTRIES.map((country) => (
                                                <option key={country}>{country}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                    <Col>
                                        <Form.Label>Province</Form.Label>
                                        <Form.Control
                                            size='sm'
                                            as='select'
                                            name='prov'
                                            onChange={(e) => {
                                                setProvName(e.target.value.toLowerCase());
                                                setShowSub(false);
                                                setShowNewSeg(false);
                                            }}
                                        >
                                            {PROVINCES.map((prov) => (
                                                <option key={prov}>{prov}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            {capitalizeString(provName!)} super segments{' '}
                            <Button
                                className='float-right'
                                size='sm'
                                onClick={(e) => {
                                    setShowNewSeg(true);
                                }}
                            >
                                Create New Super Segment
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Table bordered hover size='sm'>
                                <thead>
                                    <tr>
                                        <th>Segment Name</th>
                                        <th>Controls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSuperSegments?.map((segment) => (
                                        <tr key={segment.superSegId}>
                                            {String(segment.superSegId) !== hideControls ? (
                                                <>
                                                    <td>
                                                        {segment.name
                                                            ? capitalizeFirstLetterEachWord(segment.name)
                                                            : ''}
                                                    </td>
                                                    <td>
                                                        <NavDropdown title='Controls' id='nav-dropdown'>
                                                            <Dropdown.Item
                                                                onClick={() =>
                                                                    setHideControls(String(segment.superSegId))
                                                                }
                                                            >
                                                                Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={() => {
                                                                    setSegId(segment.superSegId);
                                                                    setSegName(segment.name);
                                                                    setShowNewSeg(false);
                                                                    setShowSub(true);
                                                                }}
                                                            >
                                                                Show Sub Segments
                                                            </Dropdown.Item>
                                                        </NavDropdown>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <Form.Control
                                                            type='text'
                                                            defaultValue={capitalizeString(segment.name)}
                                                            onChange={(e) => {
                                                                segment.name = e.target.value;
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Button
                                                            size='sm'
                                                            className='mr-2'
                                                            variant='outline-danger'
                                                            onClick={() => setHideControls('')}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            onClick={async () => {
                                                                setHideControls('');
                                                                await handleSuperSegSubmit(segment);
                                                                window.location.reload();
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {showNewSeg && (
                                        <tr>
                                            <td>
                                                <Form.Control
                                                    type='text'
                                                    onChange={(e) =>
                                                        (createData.name = e.target.value.toLowerCase())
                                                    }
                                                ></Form.Control>
                                            </td>
                                            <td>
                                                <Button
                                                    type='submit'
                                                    size='sm'
                                                    onClick={() => {
                                                        handleSegSubmit();
                                                        sleep(6000);
                                                        window.location.reload();
                                                    }}
                                                >
                                                    Add Super Segment
                                                </Button>{' '}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {error && (
                                <Alert variant='danger' className='error-alert'>
                                    {error.message}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <br />
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            {capitalizeString(provName!)} segments{' '}
                            <Button
                                className='float-right'
                                size='sm'
                                onClick={(e) => {
                                    setShowNewSeg(true);
                                }}
                            >
                                Create New Segment
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Table bordered hover size='sm'>
                                <thead>
                                    <tr>
                                        {/* <th>Seg ID</th> */}
                                        <th>Segment Name</th>
                                        <th>Super Seg-Name</th>
                                        <th>Controls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSegments?.map((segment) => (
                                        <tr key={segment.segId}>
                                            {String(segment.segId) !== hideControls ? (
                                                <>
                                                    <td>
                                                        {segment.name
                                                            ? capitalizeFirstLetterEachWord(segment.name)
                                                            : ''}
                                                    </td>
                                                    <td>
                                                        {segment.superSegName
                                                            ? capitalizeFirstLetterEachWord(
                                                                segment.superSegName
                                                            )
                                                            : ''}
                                                    </td>
                                                    <td>
                                                        <NavDropdown title='Controls' id='nav-dropdown'>
                                                            <Dropdown.Item
                                                                onClick={() =>
                                                                    setHideControls(String(segment.segId))
                                                                }
                                                            >
                                                                Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={() => {
                                                                    setSegId(segment.segId);
                                                                    setSegName(segment.name);
                                                                    setShowNewSeg(false);
                                                                    setShowSub(true);
                                                                }}
                                                            >
                                                                Show Sub Segments
                                                            </Dropdown.Item>
                                                        </NavDropdown>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <Form.Control
                                                            type='text'
                                                            defaultValue={capitalizeString(segment.name)}
                                                            onChange={(e) => {
                                                                segment.name = e.target.value;
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type='text'
                                                            defaultValue={
                                                                segment.superSegName
                                                                    ? capitalizeString(segment.superSegName)
                                                                    : ''
                                                            }
                                                            onChange={(e) => {
                                                                segment.superSegName = e.target.value;
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Button
                                                            size='sm'
                                                            className='mr-2'
                                                            variant='outline-danger'
                                                            onClick={() => setHideControls('')}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            onClick={() => {
                                                                handleSegSubmit(segment);
                                                                setHideControls('');
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {showNewSeg && (
                                        <tr>
                                            <td>
                                                <Form.Control
                                                    type='text'
                                                    onChange={(e) =>
                                                        (createData.name = e.target.value.toLowerCase())
                                                    }
                                                ></Form.Control>
                                            </td>
                                            <td>
                                                <Form.Control
                                                    type='text'
                                                    onChange={(e) => (createData.superSegName =
                                                        e.target.value.toLowerCase())
                                                    }
                                                ></Form.Control>
                                            </td>
                                            <td>
                                                <Button
                                                    type='submit'
                                                    size='sm'
                                                    onClick={() => {
                                                        handleSegSubmit();
                                                        sleep(6000);
                                                        window.location.reload();
                                                    }}
                                                >
                                                    Add Segment
                                                </Button>{' '}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {error && (
                                <Alert variant='danger' className='error-alert'>
                                    {error.message}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                    <br />
                    {showSub && segId && (
                        <ShowSubSegmentsPage
                            segId={segId}
                            segName={segName}
                            token={token}
                        />
                    )}{' '}
                    <br />
                    <UserSegmentRequestCard segReq={segReq} token={token} />
                </Col>
            </Row>
        </div>
    );
};

interface SegmentPageContentProps {
    segments: ISegment[] | undefined;
    token: any;
    segReq: ISegmentRequest[] | undefined;
    superSegments: ISuperSegment[] | undefined;
}
//Country isnt reflected in the form data, need to implement when more countries are being used.
//Enter location to manage only checks for the segments with the province name selected.
//Passing all the segments to the segmentmanagementContent component, in the future only get the api data that is needed.
const SegmentManagementContent: React.FC<SegmentPageContentProps> = ({
    segments,
    token,
    segReq,
    superSegments,
}) => {
    return (
        <Container className='mb-4 mt-4'>
            <h2 className='pb-2 pt-2 display-6'>Segmentation Manager</h2>
            <ShowSegments superSegments={superSegments} segments={segments} token={token} segReq={segReq} />
        </Container>
    );
};

export default SegmentManagementContent;
