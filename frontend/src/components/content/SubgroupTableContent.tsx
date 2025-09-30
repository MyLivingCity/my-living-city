import { useState } from 'react';
import { Table, NavDropdown, Dropdown, Button, Form, Modal } from 'react-bootstrap';
import { ISubGroup } from 'src/lib/types/data/subgroup.type';
import { updateSubGroup, deleteSubgroupById } from 'src/lib/api/subgroupRoutes';
import { PrivacyField, TypeField } from 'src/lib/constants';

interface SubgroupTableContentProps {
    token: string;
    subgroups: ISubGroup[];
    nameFilter: string;
    subgroupTypeFilter: string;
    subgroupPriv: string;
    onUpdateSubgroups: (updated: ISubGroup[]) => void;
}

const SubgroupTableContent: React.FC<SubgroupTableContentProps> = ({
    token,
    subgroups,
    nameFilter,
    subgroupTypeFilter,
    subgroupPriv,
    onUpdateSubgroups,
}) => {
    const [editingSubgroupId, setEditingSubgroupId] = useState<string | null>(null);
    const [editedSubgroup, setEditedSubgroup] = useState<Partial<ISubGroup>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subgroupToDelete, setSubgroupToDelete] = useState<ISubGroup | null>(null);

    const handleEditClick = (sg: ISubGroup) => {
        setEditingSubgroupId(sg.id);
        setEditedSubgroup({ ...sg });
    };

    const handleDeleteClick = (sg: ISubGroup) => {
        setSubgroupToDelete(sg);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!subgroupToDelete) return;
        try {
            await deleteSubgroupById(subgroupToDelete.id, token);
            const updated = subgroups.filter((sg) => sg.id !== subgroupToDelete.id);
            onUpdateSubgroups(updated);
        } catch (err) {
            console.error('Failed to delete subgroup:', err);
        } finally {
            setShowDeleteModal(false);
            setSubgroupToDelete(null);
        }
    };

    const handleCancelClick = () => {
        setEditingSubgroupId(null);
        setEditedSubgroup({});
    };

    const handleSaveClick = async () => {
        if (!editingSubgroupId) return;
        try {
            const updated = await updateSubGroup(editingSubgroupId, editedSubgroup, token);
            const newList = subgroups.map((sg) =>
                sg.id === editingSubgroupId ? updated : sg
            );
            onUpdateSubgroups(newList);
            setEditingSubgroupId(null);
            setEditedSubgroup({});
        } catch (err) {
            console.error('Failed to update subgroup:', err);
        }
    };

    const handleChange = (field: keyof ISubGroup, value: any) => {
        setEditedSubgroup((prev) => ({ ...prev, [field]: value }));
    };

    const filteredSubgroups = subgroups.filter((sg) => {
        const matchesName = sg.name.toLowerCase().includes(nameFilter.toLowerCase());
        const matchesType = subgroupTypeFilter ? sg.typeField === subgroupTypeFilter : true;
        const matchesPrivacy = subgroupPriv ? sg.privacyField === subgroupPriv : true;
        return matchesName && matchesType && matchesPrivacy;
    });

    return (
        <>
            <Table bordered hover size='sm' style={{ fontSize: '0.8rem' }}>
                <thead className='table-active'>
                    <tr>
                        <th className='text-center align-middle'>Name</th>
                        <th className='text-center align-middle'>Description</th>
                        <th className='text-center align-middle'>Type</th>
                        <th className='text-center align-middle'>Visibility</th>
                        <th className='text-center align-middle'>SuperSegment</th>
                        <th className='text-center align-middle'>Segment</th>
                        <th className='text-center align-middle'>Subsegment</th>
                        <th className='text-center align-middle'>Manager</th>
                        <th className='text-center align-middle' style={{ width: 160 }}>
                            Controls
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSubgroups.map((sg) =>
                        editingSubgroupId === sg.id ? (
                            <tr key={sg.id}>
                                <td>
                                    <Form.Control
                                        size='sm'
                                        value={editedSubgroup.name || ''}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        size='sm'
                                        value={editedSubgroup.description || ''}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        value={editedSubgroup.typeField}
                                        onChange={(e) => handleChange('typeField', e.target.value)}
                                    >
                                        {Object.values(TypeField).map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        as='select'
                                        size='sm'
                                        value={editedSubgroup.privacyField}
                                        onChange={(e) => handleChange('privacyField', e.target.value)}
                                    >
                                        {Object.values(PrivacyField).map((privacy) => (
                                            <option key={privacy} value={privacy}>
                                                {privacy}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </td>
                                <td>
                                    <Form.Control
                                        size='sm'
                                        value={editedSubgroup.region?.name || ''}
                                        onChange={(e) => handleChange('region', { name: e.target.value })}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        size='sm'
                                        value={editedSubgroup.segmentId || ''}
                                        onChange={(e) => handleChange('segmentId', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        size='sm'
                                        value={editedSubgroup.subSegmentId || ''}
                                        onChange={(e) => handleChange('subSegmentId', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        size='sm'
                                        value={editedSubgroup.manager?.adminmodEmail || ''}
                                        onChange={(e) =>
                                            handleChange('manager', { adminmodEmail: e.target.value })
                                        }
                                    />
                                </td>
                                <td className='text-center align-middle' style={{ whiteSpace: 'nowrap' }}>
                                    <Button size='sm' variant='outline-danger' onClick={handleCancelClick} className='mr-2'>
                                        Cancel
                                    </Button>
                                    <Button size='sm' onClick={handleSaveClick}>
                                        Save
                                    </Button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={sg.id}>
                                <td className='text-center align-middle'>{sg.name}</td>
                                <td className='text-center align-middle'>{sg.description}</td>
                                <td className='text-center align-middle'>{sg.typeField}</td>
                                <td className='text-center align-middle'>{sg.privacyField}</td>
                                <td className='text-center align-middle'>{sg.region?.name ?? 'NA'}</td>
                                <td className='text-center align-middle'>{sg.segmentId ?? 'NA'}</td>
                                <td className='text-center align-middle'>{sg.subSegmentId ?? 'NA'}</td>
                                <td className='text-center align-middle'>{sg.manager?.adminmodEmail}</td>
                                <td>
                                    <NavDropdown title='Controls' id={`nav-dropdown-${sg.id}`}>
                                        <Dropdown.Item onClick={() => handleEditClick(sg)} className='text-warning'>
                                            Edit
                                        </Dropdown.Item>
                                        <Dropdown.Item className='text-danger' onClick={() => handleDeleteClick(sg)}>
                                            Delete
                                        </Dropdown.Item>
                                    </NavDropdown>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </Table>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete subgroup <strong>{subgroupToDelete?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant='danger' onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SubgroupTableContent;
