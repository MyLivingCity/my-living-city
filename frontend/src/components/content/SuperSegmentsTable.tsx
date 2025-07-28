import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Card, Alert, NavDropdown, Dropdown, Row, Col } from 'react-bootstrap';
import { capitalizeFirstLetterEachWord, capitalizeString } from 'src/lib/utilityFunctions';
import {
    createSuperSegment,
    updateSuperSegment,
    deleteSuperSegmentBySuperSegmentId,
    getAllSuperSegmentsByCountryProvince,
} from '../../lib/api/segmentRoutes';
import { ISegment, ISuperSegment, SegmentType } from '../../lib/types/data/segment.type';
import { IFetchError } from '../../lib/types/types';
import { COUNTRIES, PROVINCES } from 'src/lib/constants';

interface SuperSegmentTableProps {
    provName: string;
    countryName: string;
    superSegments: ISuperSegment[];
    segments: ISegment[] | undefined;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    setSuperSegments: (superSegments: ISuperSegment[]) => void;
    token: string;
}

const SuperSegmentTable: React.FC<SuperSegmentTableProps> = ({
    provName,
    countryName,
    segments,
    setSegments,
    superSegments,
    setSuperSegments,
    token,
}) => {
    const [hideControls, setHideControls] = useState('');
    const [showNewSeg, setShowNewSeg] = useState(false);
    const [hideSuperControls, setHideSuperControls] = useState('');
    const [showNewSuperSeg, setShowNewSuperSeg] = useState(false);
    const [error, setError] = useState<IFetchError | null>(null);
    

    const filteredSuperSegments = superSegments!.filter(
        (segment) =>
            segment.province.toLowerCase() === provName.toLowerCase() && segment.country.toLowerCase() === countryName.toLowerCase()
    );
    const [newSuperSegment, setNewSuperSegment] = useState({
        name: '',
        country: '',
        province: '',
    });

    const [createData, setCreateData] = useState<ISegment>({
        name: '',
        country: '',
        province: '',
        parentSegment: {
            name: '',
            segId: 0,
            parentId: 0,
            country: '',
            province: '',
            lat: 0,
            lon: 0,
            radius: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            segmentType: SegmentType.subSegment
        },
        segId: 0,
        parentId: 0,
        lat: 0,
        lon: 0,
        radius: 0,
        segmentType: SegmentType.segment,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    useEffect(() => {
        const fetchSuperSegments = async () => {
            try {
                const superSegmentsData = await getAllSuperSegmentsByCountryProvince(countryName.toLowerCase(), provName.toLowerCase());
                if (superSegmentsData.length > 0) {
                    setCreateData(prevData => ({
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

    useEffect(() => {
        console.log('Super Segments state updated:', superSegments);
    }, [superSegments]);

    const handleSuperSegSubmit = async (updateData?: any) => {
        try {
            if (updateData) {
                if (!updateData.name) {
                    setError(Error('Please enter a segment name when updating'));
                    throw error;
                }
                await updateSuperSegment(updateData, token);
                setSegments((prevSegments) => {
                    const updatedSegments = prevSegments.map((segment) => {
                        if (segment.parentId === updateData.superSegId) {
                            return {
                                ...segment,
                                superSegName: updateData.name,
                                country: updateData.country,
                                province: updateData.province,
                            };
                        }
                        return segment;
                    });
                    return updatedSegments;
                });
            } else {
                if (!newSuperSegment.name) {
                    setError(Error('Please enter a name when creating a segment'));
                    throw error;
                }
                const found = superSegments!.find(
                    (element) => element.name === newSuperSegment.name
                );
                if (found) {
                    setError(Error('A Super Segment with this name already exists'));
                    throw error;
                }
                newSuperSegment.country = countryName;
                newSuperSegment.province = provName;
                const newSuperSegmentReturn = await createSuperSegment(newSuperSegment, token);
                if (newSuperSegmentReturn) superSegments.push(newSuperSegmentReturn);
            }
            setShowNewSeg(false);
            setError(null);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    };
    
  
    const handleDeleteSuperSegment = async (superSegId: number) => {
        // Check if it has any Segments
        const hasSegments = segments!.find(segment => segment.parentId === superSegId);
        if (hasSegments) {
            setError({ message: 'Cannot delete a Super Segment with associated Segments' });
            return;
        }
        const confirmed = window.confirm('Are you sure you want to delete this super segment?');
        if (confirmed) {
            try {
                // Delete Super Segment
                await deleteSuperSegmentBySuperSegmentId(superSegId, token);
                const updatedSuperSegments = superSegments!.filter(segment => segment.superSegId !== superSegId);
                setSuperSegments(updatedSuperSegments);
            } catch (error) {
                console.error('Failed to delete the super segment:', error);
            }
        }
    };

    return (
        <Row style={{ overflow: 'auto' }}>
            <Col>
                <Card>
                    <Card.Header className='text-capitalize'>
                        {provName} super segments{' '}
                        <Button
                            className='float-right'
                            size='sm'
                            onClick={(e) => {
                                setShowNewSuperSeg(true);
                            }}
                        >
                            Create New Super Segment
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <Table bordered hover size='sm'>
                            <thead>
                                <tr>
                                    <th>Super Segment Name</th>
                                    <th>Province</th>
                                    <th>Country</th>
                                    <th>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuperSegments?.map((segment) => (
                                    <tr key={segment.superSegId}>
                                        {String(segment.superSegId) !== hideSuperControls ? (
                                            <>
                                                <td>
                                                    {segment.name
                                                        ? capitalizeFirstLetterEachWord(segment.name.toLowerCase())
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
                                                        <Dropdown.Item
                                                            onClick={() =>
                                                                setHideSuperControls(String(segment.superSegId))
                                                            }
                                                        >
                                                            Edit
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={() => handleDeleteSuperSegment(segment.superSegId)}
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
                                                        onClick={() => setHideSuperControls('')}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size='sm'
                                                        onClick={async () => {
                                                            setHideControls('');
                                                            await handleSuperSegSubmit(segment);

                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {showNewSuperSeg && (
                                    <tr>
                                        <td>
                                            <Form.Control
                                                type='text'
                                                onChange={(e) => {
                                                    setNewSuperSegment((prev) => ({
                                                        ...prev,
                                                        name: e.target.value.toLowerCase()
                                                    }));
                                                }}
                                            ></Form.Control>
                                        </td>
                                        <td>
                                            <Button
                                                type='button'
                                                size='sm'
                                                onClick={async () => {
                                                    await handleSuperSegSubmit();
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
    );
};

export default SuperSegmentTable;
