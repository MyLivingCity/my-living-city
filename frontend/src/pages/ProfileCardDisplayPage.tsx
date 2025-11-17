import React, { useState } from 'react';
import { Container, Row, Col, Card as BootstrapCard, Button, Badge } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import PublicProfileCard from '../components/tiles/PublicProfileCard';
import { PublicCommunityBusinessProfile, PublicMunicipalProfile } from '../lib/types/data/publicProfile.type';
import { USER_TYPES, ROUTES } from '../lib/constants';

// Use the same type as PublicProfileCard expects
type PublicProfile = (PublicCommunityBusinessProfile | PublicMunicipalProfile) & {
    user: {
        id: string;
        fname?: string;
        lname?: string;
        userType: string;
        organizationName?: string;
    }
};

// Helper to determine if profile is municipal
const isMunicipalProfile = (profile: PublicProfile): boolean => {
    return 'responsibility' in profile;
};

const getProfileTypeColor = (profile: PublicProfile) => {
    return isMunicipalProfile(profile) ? 'primary' : 'success';
};

const ProfileCardDisplayPage: React.FC = () => {
    const location = useLocation();
    const history = useHistory();
    const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(
        (location.state as any)?.publicProfile || null
    );

    const handleCardClick = (publicProfile: PublicProfile) => {
        setSelectedProfile(publicProfile);
    };

    const handleBackToCards = () => {
        // Navigate back to the public profiles page
        history.push(ROUTES.PUBLIC_PROFILES);
    };

    // If no profile data is available, redirect to public profiles page
    if (!selectedProfile) {
        return (
            <Container className='mt-4'>
                <Row className='mb-4'>
                    <Col className='text-center'>
                        <h3>No Profile Selected</h3>
                        <p className='text-muted mb-4'>
                            No profile data was provided. Please select a profile from the main page.
                        </p>
                        <Button variant='primary' onClick={() => history.push(ROUTES.PUBLIC_PROFILES)}>
                            Go to Public Profiles
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className='mt-4'>
            {/* Profile Detail View */}
            <Row className='mb-4'>
                <Col>
                    <Button variant='secondary' onClick={handleBackToCards}>
                        ← Back to Public Profiles
                    </Button>
                </Col>
            </Row>
            
            <Row>
                <Col lg={8} className='mx-auto'>
                    <BootstrapCard>
                        <BootstrapCard.Header>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h2>Public Profile</h2>
                                <Badge variant={getProfileTypeColor(selectedProfile)}>
                                    {isMunicipalProfile(selectedProfile) ? 'Municipal' : 'Community Business'}
                                </Badge>
                            </div>
                        </BootstrapCard.Header>
                        <BootstrapCard.Body>
                            <Row>
                                {/* Avatar/Logo Section */}
                                <Col md={4} className='text-center mb-4'>
                                    <div 
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '10px',
                                            backgroundColor: '#f8f9fa',
                                            border: '2px solid #dee2e6',
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: '#6c757d'
                                        }}
                                    >
                                        {selectedProfile.user?.organizationName ? 
                                            selectedProfile.user.organizationName.substring(0, 2).toUpperCase() :
                                            'PU'
                                        }
                                    </div>
                                    <small className='text-muted d-block mt-2'>
                                        Avatar/Organization Logo
                                    </small>
                                </Col>
                                
                                {/* Entity Info */}
                                <Col md={8}>
                                    <h4>
                                        {selectedProfile.user?.organizationName || 'Public Profile'}
                                    </h4>
                                    <p className='text-muted'>
                                        {selectedProfile.user ? `${selectedProfile.user.fname} ${selectedProfile.user.lname}` : 'No contact person'}
                                    </p>
                                    
                                    {/* Mission Statement */}
                                    <div className='mb-3'>
                                        <h6>Statement</h6>
                                        <p>{selectedProfile.statement || 'No statement provided'}</p>
                                    </div>
                                    
                                    {/* Service/Product Description */}
                                    <div className='mb-3'>
                                        <h6>
                                            {isMunicipalProfile(selectedProfile) ? 
                                                'Service Responsibility' : 'Product/Service Description'}
                                        </h6>
                                        <p>
                                            {isMunicipalProfile(selectedProfile) 
                                                ? (selectedProfile as any).responsibility || 'No responsibility description provided'
                                                : (selectedProfile as any).description || 'No product/service description provided'
                                            }
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                            
                            <hr />
                            
                            {/* Contact Information */}
                            <Row>
                                <Col md={6}>
                                    <h5>Contact Information</h5>
                                    <p><strong>Email:</strong> {selectedProfile.contactEmail || 'Not provided'}</p>
                                    <p><strong>Phone:</strong> {selectedProfile.contactPhone || 'Not provided'}</p>
                                    <p><strong>Address:</strong> {selectedProfile.address || 'Not provided'}</p>
                                </Col>
                                
                                {/* Links */}
                                <Col md={6}>
                                    <h5>Links & Resources</h5>
                                    {selectedProfile.links && selectedProfile.links.length > 0 ? (
                                        <div>
                                            <ul>
                                                {selectedProfile.links.map((link: any, index: number) => (
                                                    <li key={index}>
                                                        <a href={link.link} target='_blank' rel='noopener noreferrer'>
                                                            {link.linkType} - {link.link}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className='text-muted'>No links provided</p>
                                    )}
                                    
                                    {/* Data availability note */}
                                    <div className='mt-3'>
                                        <small className='text-muted'>
                                            <em>Note: This is a summary view. Full contact details and links may not be available.</em>
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                        </BootstrapCard.Body>
                    </BootstrapCard>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfileCardDisplayPage;