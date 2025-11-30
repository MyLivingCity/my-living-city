import React, { useContext, useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal } from 'react-bootstrap';
import { IAdPrice } from 'src/lib/types/data/adPrice.type';
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { addAdPrice, updateAdPrice, deleteAdPrice } from 'src/lib/api/adPriceRoutes';

interface EditAdPricingPageContentProps {
    adPriceOptions: IAdPrice[] | undefined;
}

const EditAdPricingPageContent: React.FC<EditAdPricingPageContentProps> = ({ adPriceOptions }) => {
    const { token } = useContext(UserProfileContext);

    if (!token) {
        console.error('No token available!');
        return null;
    }

    // Local copy of adPriceOptions so we can edit in place
    const [rows, setRows] = useState<IAdPrice[]>(adPriceOptions || []);
    const [showModal, setShowModal] = useState(false);
    const [currentRow, setCurrentRow] = useState<IAdPrice | null>(null);
    const [newRow, setNewRow] = useState({ lengthWeeks: '', priceCadDollars: '' });

    const handleEditClick = (row: IAdPrice) => {
        setCurrentRow({ ...row });
        setShowModal(true);
    };

    const handleDeleteClick = async (id: number) => {
        try {
            await deleteAdPrice(id, token);
            setRows(rows.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveEdit = async () => {
        if (!currentRow) return;
        try {
            const updated = await updateAdPrice(currentRow.id, currentRow, token);
            setRows(rows.map(r => r.id === updated.id ? updated : r));
            setShowModal(false);
            setCurrentRow(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddRow = async () => {
        if (!newRow.lengthWeeks || !newRow.priceCadDollars) return;
        try {
            const added = await addAdPrice({
                lengthWeeks: parseInt(newRow.lengthWeeks),
                priceCadDollars: newRow.priceCadDollars
            }, token);
            setRows([...rows, added]);
            setNewRow({ lengthWeeks: '', priceCadDollars: '' });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Container className='edit-ad-pricing-page-content'>
            <h2>Ad Pricing</h2>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Weeks</th>
                        <th>Price (CAD)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <tr key={row.id}>
                            <td>{row.lengthWeeks}</td>
                            <td>{row.priceCadDollars}</td>
                            <td>
                                <Button variant='primary' size='sm' onClick={() => handleEditClick(row)}>Edit</Button>{' '}
                                <Button variant='danger' size='sm' onClick={() => handleDeleteClick(row.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <Form.Control
                                type='number'
                                value={newRow.lengthWeeks}
                                onChange={e => setNewRow({ ...newRow, lengthWeeks: e.target.value })}
                                placeholder='Weeks'
                            />
                        </td>
                        <td>
                            <Form.Control
                                type='text'
                                value={newRow.priceCadDollars}
                                onChange={e => setNewRow({ ...newRow, priceCadDollars: e.target.value })}
                                placeholder='Price'
                            />
                        </td>
                        <td>
                            <Button variant='success' size='sm' onClick={handleAddRow}>Add</Button>
                        </td>
                    </tr>
                </tbody>
            </Table>

            {/* Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Ad Price</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Weeks</Form.Label>
                        <Form.Control
                            type='number'
                            value={currentRow?.lengthWeeks || ''}
                            onChange={e => currentRow && setCurrentRow({ ...currentRow, lengthWeeks: parseInt(e.target.value) })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Price (CAD)</Form.Label>
                        <Form.Control
                            type='text'
                            value={currentRow?.priceCadDollars || ''}
                            onChange={e => currentRow && setCurrentRow({ ...currentRow, priceCadDollars: e.target.value })}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant='primary' onClick={handleSaveEdit}>Save</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default EditAdPricingPageContent;
