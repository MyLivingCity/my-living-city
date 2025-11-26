import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { PublicCommunityBusinessProfile, PublicMunicipalProfile, LinkType } from '../../lib/types/data/publicProfile.type';

interface EditPublicProfileModalProps {
    show: boolean;
    onHide: () => void;
    profile: PublicCommunityBusinessProfile | PublicMunicipalProfile | null;
    profileType: 'community' | 'municipal' | 'residential';
    onSave: (updatedProfile: any) => Promise<void>;
}

const EditPublicProfileModal: React.FC<EditPublicProfileModalProps> = ({
    show,
    onHide,
    profile,
    profileType,
    onSave
}) => {
    const [formData, setFormData] = useState<any>({
        statement: '',
        description: '',
        responsibility: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        links: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newLink, setNewLink] = useState({ link: '', linkType: LinkType.WEBSITE });

    // Initialize form data when profile changes
    useEffect(() => {
        if (profile) {
            setFormData({
                statement: profile.statement || '',
                description: (profile as PublicCommunityBusinessProfile).description || '',
                responsibility: (profile as PublicMunicipalProfile).responsibility || '',
                address: profile.address || '',
                contactEmail: profile.contactEmail || '',
                contactPhone: profile.contactPhone || '',
                links: profile.links || []
            });
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Validate phone number to only allow digits, (), +, and -
        if (name === 'contactPhone') {
            const phoneRegex = /^[0-9()+\-\s]*$/;
            if (!phoneRegex.test(value)) {
                return; // Don't update if invalid characters
            }
        }
        
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddLink = () => {
        if (newLink.link.trim()) {
            setFormData((prev: any) => ({
                ...prev,
                links: [...prev.links, { ...newLink }]
            }));
            setNewLink({ link: '', linkType: LinkType.WEBSITE });
        }
    };

    const handleRemoveLink = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            links: prev.links.filter((_: any, i: number) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updatedProfile = {
                ...profile,
                ...formData
            };
            await onSave(updatedProfile);
            onHide();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isMunicipal = profileType === 'municipal';

    return (
        <Modal show={show} onHide={onHide} size='lg' backdrop='static'>
            <Modal.Header closeButton>
                <Modal.Title>Edit Public Profile</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant='danger'>{error}</Alert>}

                    {/* Statement */}
                    <Form.Group className='mb-3'>
                        <Form.Label>Statement</Form.Label>
                        <Form.Control
                            as='textarea'
                            rows={3}
                            name='statement'
                            value={formData.statement}
                            onChange={handleInputChange}
                            placeholder='Enter your profile statement...'
                        />
                    </Form.Group>

                    {/* Description (Community/Business only) */}
                    {!isMunicipal && (
                        <Form.Group className='mb-3'>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder='Enter a description...'
                            />
                        </Form.Group>
                    )}

                    {/* Responsibility (Municipal only) */}
                    {isMunicipal && (
                        <Form.Group className='mb-3'>
                            <Form.Label>Service Responsibility</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                name='responsibility'
                                value={formData.responsibility}
                                onChange={handleInputChange}
                                placeholder='Enter service responsibilities...'
                            />
                        </Form.Group>
                    )}

                    {/* Contact Email */}
                    <Form.Group className='mb-3'>
                        <Form.Label>Contact Email</Form.Label>
                        <Form.Control
                            type='email'
                            name='contactEmail'
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            placeholder='contact@example.com'
                        />
                    </Form.Group>

                    {/* Contact Phone */}
                    <Form.Group className='mb-3'>
                        <Form.Label>Contact Phone</Form.Label>
                        <Form.Control
                            type='tel'
                            name='contactPhone'
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            maxLength={30}
                            placeholder='(555) 123-4567'
                        />
                    </Form.Group>

                    {/* Address */}
                    <Form.Group className='mb-3'>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type='text'
                            name='address'
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder='123 Main St, City, Province'
                        />
                    </Form.Group>

                    {/* Links & Resources */}
                    <Form.Group className='mb-3'>
                        <Form.Label>Links & Resources</Form.Label>
                        
                        {/* Existing Links */}
                        {formData.links.length > 0 && (
                            <div className='mb-2'>
                                {formData.links.map((link: any, index: number) => (
                                    <div key={index} className='d-flex align-items-center mb-2'>
                                        <span className='flex-grow-1'>
                                            <strong>{link.linkType}:</strong> {link.link}
                                        </span>
                                        <Button
                                            variant='outline-danger'
                                            size='sm'
                                            onClick={() => handleRemoveLink(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Link */}
                        <div className='d-flex gap-2'>
                            <Form.Control
                                as='select'
                                value={newLink.linkType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewLink({ ...newLink, linkType: e.target.value as LinkType })}
                                style={{ maxWidth: '150px' }}
                            >
                                <option value={LinkType.WEBSITE}>Website</option>
                                <option value={LinkType.FACEBOOK}>Facebook</option>
                                <option value={LinkType.TWITTER}>Twitter</option>
                                <option value={LinkType.INSTAGRAM}>Instagram</option>
                                <option value={LinkType.LINKEDIN}>LinkedIn</option>
                                <option value={LinkType.OTHER}>Other</option>
                            </Form.Control>
                            <Form.Control
                                type='url'
                                placeholder='https://example.com'
                                value={newLink.link}
                                onChange={(e) => setNewLink({ ...newLink, link: e.target.value })}
                            />
                            <Button
                                variant='outline-primary'
                                onClick={handleAddLink}
                                disabled={!newLink.link.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant='secondary' onClick={onHide} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant='primary' type='submit' disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation='border' size='sm' className='me-2' />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditPublicProfileModal;
