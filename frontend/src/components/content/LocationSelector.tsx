import React from 'react';
import { Row, Col, Form, Card } from 'react-bootstrap';
import { COUNTRIES, PROVINCES } from 'src/lib/constants';

interface LocationSelectorProps {
    countryName: string;
    provName: string;
    setCountryName: React.Dispatch<React.SetStateAction<string>>;
    setProvName: React.Dispatch<React.SetStateAction<string>>;
    setShowSub: React.Dispatch<React.SetStateAction<boolean>>;
    setShowNewSeg: React.Dispatch<React.SetStateAction<boolean>>;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
    countryName,
    provName,
    setCountryName,
    setProvName,
    setShowSub,
    setShowNewSeg,
}) => {
    return (
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
                                        value={countryName}
                                        onChange={(e) => {
                                            setCountryName(e.target.value.toLowerCase());
                                            setShowSub(false);
                                            setShowNewSeg(false);
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
                                            setShowSub(false);
                                            setShowNewSeg(false);
                                        }}
                                    >
                                        {PROVINCES.map((prov) => (
                                            <option key={prov} value={prov.toLocaleLowerCase()}>
                                                {prov}
                                            </option>
                                        ))}
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

export default LocationSelector;
