import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import { COUNTRIES, PROVINCES } from 'src/lib/constants';
import { getAllSuperSegmentsByCountryProvince } from '../../lib/api/segmentRoutes';
import { ISegment, ISuperSegment, ISegmentRequest, SegmentType } from '../../lib/types/data/segment.type';
import { capitalizeFirstLetterEachWord } from 'src/lib/utilityFunctions';


interface SubgroupLocationSelectorProps {
    countryName: string;
    provName: string;
    setCountryName: React.Dispatch<React.SetStateAction<string>>;
    setProvName: React.Dispatch<React.SetStateAction<string>>;
    segments: ISegment[] | undefined;
}

const SubgroupLocationSelector: React.FC<SubgroupLocationSelectorProps> = ({
    countryName,
    provName,
    setCountryName,
    setProvName,
    segments,
}) => {
    const [segName, setSegName] = useState<string>('');
    const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
    const [selectedSuperSegId, setSelectedSuperSegId] = useState<number | ''>('');
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        const fetchSuperSegments = async () => {
            try {
                const data = await getAllSuperSegmentsByCountryProvince(
                    countryName.toLowerCase(),
                    provName.toLowerCase()
                );
                setSuperSegments(data);
                if (data.length > 0) {
                    setSelectedSuperSegId(data[0].superSegId);
                } else {
                    setSelectedSuperSegId('');
                }
            } catch (error) {
                console.error('Error fetching super segments:', error);
            }
        };

        fetchSuperSegments();
    }, [countryName, provName]);

    useEffect(() => {
        setSegName('');
    }, [countryName, provName]);
    const filteredSegments = (segments ?? []).filter(
        (segment) =>
            segment.province.toLowerCase() === provName &&
            segment.country.toLowerCase() === countryName.toLowerCase()
    );

    if (!showForm) return null;

    return (
        <Row>
            <Col>
                <Form.Group>
                    <Card>
                        <Card.Header className='d-flex justify-content-between align-items-center'>
                            <span>
                                Select a location
                            </span>
                            <Button 
                                variant='primary' 
                                size='sm'
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col>
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control
                                        size='sm'
                                        as='select'
                                        name='country'
                                        value={countryName}
                                        onChange={(e) => {
                                            setCountryName(e.target.value.toLowerCase());
                                        }}
                                    >
                                        {COUNTRIES.map((country) => (
                                            <option key={country} value={country.toLowerCase()}>
                                                {country}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                                <Col>
                                    <Form.Label>Province</Form.Label>
                                    <Form.Control
                                        size='sm'
                                        as='select'
                                        name='prov'
                                        value={provName}
                                        onChange={(e) => {
                                            setProvName(e.target.value.toLowerCase());
                                        }}
                                    >
                                        {PROVINCES.map((prov) => (
                                            <option key={prov} value={prov.toLowerCase()}>
                                                {prov}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                                {/* SuperSegment Selector */}
                                <Col>
                                    <Form.Label>SuperSegment</Form.Label>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        value={selectedSuperSegId}
                                        onChange={(e) => setSelectedSuperSegId(Number(e.target.value))}
                                        disabled={superSegments.length === 0}
                                    >
                                        {superSegments.length === 0 ? (
                                            <option disabled>No SuperSegment matches this location</option>
                                        ) : (
                                            <>
                                                <option value=''>All</option>
                                                {superSegments.map((superSeg) => (
                                                    <option key={superSeg.superSegId} value={superSeg.superSegId}>
                                                        {capitalizeFirstLetterEachWord(superSeg.name)}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </Form.Control>
                                </Col>
                                <Col>
                                    <Form.Label>Segment</Form.Label>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        value={segName}
                                        onChange={(e) => setSegName(e.target.value)}
                                        disabled={filteredSegments.length === 0}
                                    >
                                        {filteredSegments.length === 0 ? (
                                            <option disabled>No segments match this location</option>
                                        ) : (
                                            <>
                                                <option value=''>All</option>
                                                {filteredSegments.map((segment) => (
                                                    <option key={segment.segId} value={segment.name}>
                                                        {segment.name ? capitalizeFirstLetterEachWord(segment.name) : ''}
                                                    </option>
                                        
                                                ))}
                                            </>
                                            
                                        )}
                                    </Form.Control>
                                </Col>
                                <Col>
                                    <Form.Label>SubSegment</Form.Label>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        disabled
                                    >
                                        <option value=''></option>
                                        
                                    </Form.Control>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Form.Group>
            </Col>
        </Row>
    );
};

export default SubgroupLocationSelector;
