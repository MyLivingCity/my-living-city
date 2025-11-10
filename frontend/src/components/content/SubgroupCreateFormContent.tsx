import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Card, Form } from 'react-bootstrap';
import SubgroupLocationSelector from './SubgroupLocationSelector';
import { PrivacyField, TypeField } from 'src/lib/constants';
import { ISegment } from '../../lib/types/data/segment.type';
import { createSubgroup } from 'src/lib/api/subgroupCreationRoutes';
import { getAllUsers } from 'src/lib/api/userRoutes'; // ✅ use your /user/getAll API

interface CreateSubgroupFormContentProps {
    segments: ISegment[] | undefined;
    token: string;
    countryName: string;
    provName: string;
    setCountryName: React.Dispatch<React.SetStateAction<string>>;
    setProvName: React.Dispatch<React.SetStateAction<string>>;
    onCancel: () => void;
    onCreated: (subgroup: any) => void;
}

const SubgroupCreateFormContent: React.FC<CreateSubgroupFormContentProps> = ({
    segments: segs,
    token,
    onCancel,
    onCreated,
}) => {
    const [segments, setSegments] = useState<ISegment[]>(segs || []);
    const [countryName, setCountryName] = useState('');
    const [provName, setProvName] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacyField, setPrivacyField] = useState('');
    const [typeField, setTypeField] = useState('');
    const [managerId, setManagerId] = useState('');
    const [users, setUsers] = useState<{ id: string; email: string }[] | undefined>(undefined);

    useEffect(() => {
        if (segments.length > 0) {
            setCountryName(segments[0].country);
            setProvName(segments[0].province);
        }
    }, [segments]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers(token);
                const userList = data.map((u: any) => ({
                    id: u.id,
                    email: u.email,
                }));
                setUsers(userList);
            } catch (err) {
                console.error('Failed to load users', err);
            }
        };
        fetchUsers();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const newSubgroup = await createSubgroup(
                {
                    name,
                    description,
                    typeField,
                    privacyField,
                    managerId,
                },
                token
            );

            console.log('Created subgroup:', newSubgroup);

            setName('');
            setDescription('');
            setPrivacyField('');
            setTypeField('');
            setManagerId('');

            onCreated(newSubgroup);
            onCancel();
        } catch (err) {
            console.error('Failed to create subgroup:', err);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>Create a New Subgroup</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Subgroup Name'
                                        size='sm'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Col>

                                <Col>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Subgroup Description'
                                        size='sm'
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Col>

                                <Col>
                                    <Form.Label>Subgroup Type</Form.Label>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        value={typeField}
                                        onChange={(e) => setTypeField(e.target.value)}
                                    >
                                        <option value=''>All</option>
                                        {Object.values(TypeField).map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>

                                <Col>
                                    <Form.Label>Subgroup Visibility</Form.Label>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        value={privacyField}
                                        onChange={(e) => setPrivacyField(e.target.value)}
                                    >
                                        <option value=''>Select</option>
                                        {Object.values(PrivacyField).map((privacy) => (
                                            <option key={privacy} value={privacy}>
                                                {privacy}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>

                                {/* Manager dropdown using fetched users */}
                                <Col>
                                    <Form.Label>Subgroup Manager</Form.Label>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        value={managerId}
                                        onChange={(e) => setManagerId(e.target.value)}
                                    >
                                        <option value=''>Select Manager</option>
                                        {users?.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.email}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                            </Row>

                            {typeField === 'NESTED' && (
                                <Row className='mt-3'>
                                    <Col>
                                        <SubgroupLocationSelector
                                            segments={segments}
                                            countryName={countryName}
                                            provName={provName}
                                            setCountryName={setCountryName}
                                            setProvName={setProvName}
                                        />
                                    </Col>
                                </Row>
                            )}

                            <Row className='mt-3'>
                                <Col className='d-flex justify-content-end gap-2'>
                                    <Button variant='primary' type='submit'>
                                        Submit
                                    </Button>
                                    <Button
                                        variant='danger'
                                        type='button'
                                        onClick={() => {
                                            setName('');
                                            setDescription('');
                                            setPrivacyField('');
                                            setTypeField('');
                                            setManagerId('');
                                            onCancel();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
};

export default SubgroupCreateFormContent;
