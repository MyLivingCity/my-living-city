import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Card, Alert, NavDropdown, Dropdown, Row, Col } from 'react-bootstrap';
import { capitalizeFirstLetterEachWord, capitalizeString } from 'src/lib/utilityFunctions';
import { Link } from 'react-router-dom';
import {
    createSegment,
    updateSegment,
    deleteSegmentBySegmentId,
    getAllSuperSegmentsByCountryProvince,
} from '../../lib/api/segmentRoutes';
import { ISegment, ISuperSegment, ISegmentRequest, SegmentType } from '../../lib/types/data/segment.type';
import { IFetchError } from '../../lib/types/types';
import { UserSegmentRequestCard } from '../partials/UserSegmentRequestCard';
import { ShowSubSegmentsPage } from 'src/pages/ShowSubSegmentsPage';
import { COUNTRIES, PROVINCES } from 'src/lib/constants';

interface SegmentTableProps {
    provName: string;
    countryName: string;
    segments: ISegment[] | undefined;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    token: string;
    segReq: ISegmentRequest[] | undefined;
}

const SegmentTable: React.FC<SegmentTableProps> = ({
    provName,
    countryName,
    segments,
    setSegments,
    token,
    segReq,
}) => {
    const [hideControls, setHideControls] = useState('');
    const [showNewSeg, setShowNewSeg] = useState(false);
    const [segId, setSegId] = useState<number | null>(null);
    const [segName, setSegName] = useState<string | null>(null);
    const [error, setError] = useState<IFetchError | null>(null);
    const [showSub, setShowSub] = useState(false);
    const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
    const [createData, setCreateData] = useState<ISegment>({
        name: '',
        country: '',
        province: '',
        parentSegment: undefined,
        segId: 0,
        parentId: 0,
        lat: 0,
        lon: 0,
        radius: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        segmentType: SegmentType.segment,
    });
    const filteredSegments = segments!.filter(
        (segment) =>
            segment.province.toLowerCase() === provName.toLowerCase() && segment.country.toLowerCase() === countryName.toLowerCase()
    );

    useEffect(() => {
        const fetchSuperSegments = async () => {
            try {
                const superSegmentsData = await getAllSuperSegmentsByCountryProvince(
                    countryName.toLowerCase(),
                    provName.toLowerCase()
                );
                if (superSegmentsData.length > 0) {
                    setCreateData((prevData) => ({
                        ...prevData,
                        superSegId: superSegmentsData[0].superSegId,
                        superSegName: superSegmentsData[0].name.toLowerCase(),
                    }));
                }
                setSuperSegments(superSegmentsData);
            } catch (error) {
                console.error('Error fetching super segments:', error);
            }
        };

        fetchSuperSegments();
    }, [countryName, provName]);


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
                    (element) => element.name.toLowerCase() === createData.name.toLowerCase()
                );
                if (found) {
                    setError(Error('A Segment with this name already exists'));
                    throw error;
                }
                createData.country = countryName;
                createData.province = provName;
                const created = await createSegment(createData, token);
                if (segments && created) segments.push(created);
            }
            setShowNewSeg(false);
            setError(null);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteSegment = async (segId: number) => {
        const confirmed = window.confirm('Are you sure you want to delete this segment?');
        if (confirmed) {
            try {
                await deleteSegmentBySegmentId(segId, token);
                const updatedSegments = segments!.filter(segment => segment.segId !== segId);
                setSegments(updatedSegments);
            } catch (error) {
                console.error('Failed to delete the segment:', error);
            }
        }
    };

    return (
        <Row style={{ overflow: 'auto' }}>
            <Col>
                <Card>
                    <Card.Header className='text-capitalize'>
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
                                    <th>Province</th>
                                    <th>Country</th>
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
                                                    {segment.parentSegment?.name
                                                        ? capitalizeFirstLetterEachWord(
                                                            segment.parentSegment.name.toLowerCase()
                                                        )
                                                        : ''}
                                                </td>
                                                <td>
                                                    {segment.province
                                                        ? capitalizeFirstLetterEachWord(
                                                            segment.province
                                                        )
                                                        : ''}
                                                </td>
                                                <td>
                                                    {segment.country
                                                        ? capitalizeFirstLetterEachWord(
                                                            segment.country
                                                        )
                                                        : ''}
                                                </td>
                                                <td>
                                                    <NavDropdown title='Controls' id='nav-dropdown'>
                                                        <Dropdown.Item>
                                                            <Link
                                                                to={`/segment/management/${segment.segId}`}
                                                                className='dropdown-item p-0 m-0'
                                                            >
                                                                View
                                                            </Link>
                                                        </Dropdown.Item>
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
                                                        <Dropdown.Item
                                                            onClick={() => handleDeleteSegment(segment.segId)}
                                                            className='text-danger'
                                                        >
                                                            Delete
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
                                                        as='select'
                                                        defaultValue={segment.parentId}
                                                        onChange={(e) => {
                                                            segment.parentId = parseInt(e.target.value, 10);
                                                        }}
                                                    >
                                                        {superSegments.map((superSegment) => (
                                                            <option key={superSegment.superSegId} value={superSegment.superSegId}>
                                                                {superSegment.name.toUpperCase()}
                                                            </option>
                                                        ))}
                                                    </Form.Control>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        as='select'
                                                        defaultValue={segment.province.toLowerCase()}
                                                        onChange={(e) => {
                                                            segment.province = e.target.value.toLowerCase();
                                                        }}
                                                    >
                                                        {PROVINCES.map((prov) => (
                                                            <option key={prov} value={prov.toLowerCase()}>{prov}</option>
                                                        ))}
                                                    </Form.Control>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        as='select'
                                                        defaultValue={segment.country.toLowerCase()}
                                                        onChange={(e) => {
                                                            segment.country = e.target.value.toLowerCase();
                                                        }}
                                                    >
                                                        {COUNTRIES.map((prov) => (
                                                            <option key={prov} value={prov.toLowerCase()}>{prov}</option>
                                                        ))}
                                                    </Form.Control>
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
                                                as='select'
                                                onChange={(e) => {
                                                    const selectedSuperSegId = parseInt(e.target.value, 10);
                                                    const selectedSuperSegment = superSegments.find(
                                                        (superSeg) => superSeg.superSegId === selectedSuperSegId);
                                                    setCreateData((prevData) => ({
                                                        ...prevData,
                                                        superSegId: selectedSuperSegId,
                                                        superSegName: selectedSuperSegment ? selectedSuperSegment.name.toLowerCase() : '',
                                                    }));
                                                }}
                                            >
                                                {superSegments.map((superSegment) => (
                                                    <option key={superSegment.superSegId} value={superSegment.superSegId}>
                                                        {superSegment.name.toUpperCase()}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </td>
                                        <td>
                                            <Button
                                                type='button'
                                                size='sm'
                                                onClick={() => {
                                                    handleSegSubmit();
                                                    // sleep(6000);
                                                    // window.location.reload();
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
    );
};

export default SegmentTable;
