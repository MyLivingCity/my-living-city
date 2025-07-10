import React from 'react';
import { Row, Col, Form, Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { SubGroup } from '../../pages/SubGroupManagementPage';

interface SubGroupSelectorProps {
    subGroups: SubGroup[];
    subGroupName: string;
    setSubGroupName: React.Dispatch<React.SetStateAction<string>>;
    selectedSubGroup: SubGroup | null;
}

export const SubGroupSelector: React.FC<SubGroupSelectorProps> = ({
    subGroups,
    subGroupName,
    setSubGroupName,
    selectedSubGroup,
}) => {

    const fields = selectedSubGroup
        ? [
            { label: 'Group Name', value: selectedSubGroup.name },
            { label: 'Created At', value: selectedSubGroup.createdAt },
            { label: 'Visibility', value: selectedSubGroup.visibility },
            { label: 'Group Type', value: selectedSubGroup.groupType },
            { label: 'Nested Under', value: selectedSubGroup.nestedUnder },
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
                                <Col xs={12} md={5}>
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