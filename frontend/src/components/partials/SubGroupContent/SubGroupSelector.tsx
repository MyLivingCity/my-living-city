/**
 * SubGroupSelector.tsx
 * 
 * Displays a selector dropdown to choose a subgroup to manage,
 * and renders details of the currently selected subgroup.
 */

import React from 'react';
import { Row, Col, Form, Card, ListGroup, ListGroupItem } from 'react-bootstrap';

// Types
import { ISubGroup } from 'src/lib/types/data/subGroup.type';

// Utility functions 
import { formatDateString } from 'src/lib/utilityFunctions';

interface SubGroupSelectorProps {
    subGroupName: string;
    selectedSubGroup: ISubGroup | null;
    subGroups: ISubGroup[];
    setSubGroupName: React.Dispatch<React.SetStateAction<string>>;
}

export const SubGroupSelector: React.FC<SubGroupSelectorProps> = ({
    subGroupName,
    selectedSubGroup,
    subGroups,
    setSubGroupName,
}) => {
    // Define fields to display in the subgroup details
    const fields = selectedSubGroup
        ? [
            { label: 'Group Name', value: selectedSubGroup.name },
            { label: 'Created At', value: formatDateString(selectedSubGroup.createdAt) },
            { label: 'Visibility', value: selectedSubGroup.privacyField },
            { label: 'Group Type', value: selectedSubGroup.isVirtual ? 'Virtual' : 'Nested' },
            { label: 'Nested Under', value: selectedSubGroup.regionId || 'None' },
        ]
        : [];

    return (
        <Row>
            <Col>
                <Form.Group>
                    <Card>
                        <Card.Header>Enter SubGroup to Manage</Card.Header>
                        <Card.Body>
                            <Row>
                                {/* Selector */}
                                <Col xs={12} md={6}>
                                    <Form.Label>SubGroup Name</Form.Label>
                                    <Form.Control
                                        size='sm'
                                        as='select'
                                        name='subGroupName'
                                        value={subGroupName}
                                        onChange={(e) => {
                                            const selected = e.target.value.toLowerCase();
                                            setSubGroupName(selected);
                                        }}
                                    >
                                        {subGroups.map((subGroup, index) => (
                                            <option key={index} value={subGroup.name.toLowerCase()}>
                                                {subGroup.name}
                                            </option>
                                        ))}
                                    </Form.Control>

                                    {/* Description */}
                                    {selectedSubGroup?.description && (
                                        <div className='mt-3'>
                                            <Form.Label>Description</Form.Label>
                                            <Card.Text>{selectedSubGroup.description}</Card.Text>
                                        </div>
                                    )}
                                </Col>

                                {/* Labels + Values */}
                                <Col xs={12} md={6} className='mt-sm-4 mt-md-0'>
                                    <Row>

                                        {/* Labels */}
                                        <Col xs='auto'>
                                            <ListGroup variant='flush'>
                                                {fields.map((field, i) => (
                                                    <ListGroupItem key={i}>
                                                        <strong>{field.label}: </strong>
                                                    </ListGroupItem>
                                                ))}
                                            </ListGroup>
                                        </Col>

                                        {/* Values */}
                                        <Col className='flex-grow-1'>
                                            <ListGroup variant='flush'>
                                                {fields.map((field, i) => (
                                                    <ListGroupItem key={i}>
                                                        {field.value}
                                                    </ListGroupItem>
                                                ))}
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Form.Group>
            </Col>
        </Row>
    );
};