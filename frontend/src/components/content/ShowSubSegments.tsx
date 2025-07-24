import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Card, Alert, NavDropdown, Dropdown } from 'react-bootstrap';
import { capitalizeString } from 'src/lib/utilityFunctions';
import {
    createSubSegment,
    updateSubSegment,
} from 'src/lib/api/segmentRoutes';
import { ISubSegment } from 'src/lib/types/data/segment.type';
import { IFetchError } from 'src/lib/types/types';

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
    const [subSegments, setSubSegments] = useState<ISubSegment[]>([]);
    const [hideControls, setHideControls] = useState('');
    const [showNewSubSeg, setShowNewSubSeg] = useState(false);
    const [error, setError] = useState<IFetchError | null>(null);
    const [createData] = useState<ISubSegment>({} as ISubSegment);
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

                if (subSegments) {
                    setSubSegments(prevValue => [...prevValue, createData]);
                }
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

    useEffect(() => {
        if (data) {
            setSubSegments(data);
        } else {
            setSubSegments([]);
        }
    }, [data]);

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
                        {subSegments?.map((segment: ISubSegment) => (
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
                                        onChange={(e) => {
                                            createData.name = e.target.value;
                                        }}
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        type='number'
                                        onChange={(e) => {
                                            createData.lat = parseFloat(e.target.value) ?? 0;
                                        }}
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        type='number'
                                        onChange={(e) => {
                                            createData.lon = parseFloat(e.target.value) ?? 0;
                                        }}
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        type='number'
                                        onChange={(e) => {
                                            createData.radius = parseFloat(e.target.value) ?? 0;
                                        }}
                                    ></Form.Control>
                                </td>
                                <td>
                                    <Button
                                        type='submit'
                                        size='sm'
                                        onClick={() => {
                                            handleSubSegSubmit();
                                            sleep(6000);
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

export default ShowSubSegments;
