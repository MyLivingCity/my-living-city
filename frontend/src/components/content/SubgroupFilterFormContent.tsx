import { PrivacyField, TypeField } from 'src/lib/constants';
import React from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import SubgroupLocationSelector from './SubgroupLocationSelector';
import { ISegment } from '../../lib/types/data/segment.type';

interface SubgroupFilterFormContentProps {
  segments: ISegment[] | undefined
  token: string
  countryName: string
  provName: string
  setCountryName: React.Dispatch<React.SetStateAction<string>>
  setProvName: React.Dispatch<React.SetStateAction<string>>
  nameFilter: string
  setNameFilter: React.Dispatch<React.SetStateAction<string>>
  subgroupTypeFilter: string
  setSubgroupTypeFilter: React.Dispatch<React.SetStateAction<string>>
  subgroupPriv: string
  setSubgroupPriv: React.Dispatch<React.SetStateAction<string>>
}

const SubgroupFilterFormContent: React.FC<SubgroupFilterFormContentProps> = ({
    segments = [],
    countryName,
    provName,
    setCountryName,
    setProvName,
    nameFilter,
    setNameFilter,
    subgroupTypeFilter,
    setSubgroupTypeFilter,
    subgroupPriv,
    setSubgroupPriv
}) => {
    const handleClearFilters = () => {
        setNameFilter('');
        setSubgroupTypeFilter('');
        setSubgroupPriv('');
        setCountryName('');
        setProvName('');
    };
    return (
        <Form>
            <Row>
                <Col>
                    <Form.Group>
                        <Card>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <span>Filter Subgroups</span>
                                <Button
                                    variant='primary'
                                    size='sm'
                                    onClick={handleClearFilters}
                                >
                                    Clear
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {/* Name Filter */}
                                    <Col>
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type='text'
                                            placeholder='Filter Name'
                                            size='sm'
                                            value={nameFilter}
                                            onChange={(e) => setNameFilter(e.target.value)}
                                        />
                                    </Col>

                                    {/* Subgroup Type Filter */}
                                    <Col>
                                        <Form.Label>Subgroup Type</Form.Label>
                                        <Form.Control
                                            as='select'
                                            value={subgroupTypeFilter}
                                            onChange={(e) => setSubgroupTypeFilter(e.target.value)}
                                            size='sm'
                                        >
                                            <option value=''>All</option>
                                            {Object.values(TypeField).map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Col>

                                    {/* Subgroup Visibility Filter */}
                                    <Col>
                                        <Form.Label>Subgroup Visibility</Form.Label>
                                        <Form.Control
                                            as='select'
                                            size='sm'
                                            name='privacy'
                                            value={subgroupPriv}
                                            onChange={(e) => setSubgroupPriv(e.target.value)}
                                        >
                                            <option value=''>All</option>
                                            {Object.values(PrivacyField).map((privacy) => (
                                                <option key={privacy} value={privacy}>
                                                    {privacy}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Row>

                                <Row className='mt-3'>
                                    <Col>
                                        {subgroupTypeFilter === 'NESTED' && (
                                            <SubgroupLocationSelector
                                                segments={segments}
                                                countryName={countryName}
                                                provName={provName}
                                                setCountryName={setCountryName}
                                                setProvName={setProvName}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default SubgroupFilterFormContent;
