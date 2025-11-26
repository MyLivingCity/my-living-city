import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card as BootstrapCard, Button, Badge, Spinner, Alert, Carousel } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import { PublicCommunityBusinessProfile, PublicMunicipalProfile } from '../lib/types/data/publicProfile.type';
import { ROUTES } from '../lib/constants';
import { getCommunityBusinessProfile, getMunicipalProfile } from '../lib/api/publicProfileRoutes';
import { useUserIdeas, useUserEndorsedIdeas } from '../hooks/ideaHooks';
import { useAllProposals } from '../hooks/proposalHooks';
import IdeaTile from '../components/tiles/IdeaTile';
import ProposalTile from '../components/tiles/ProposalTile';

// Public profile type
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's posts using existing hook
    const { data: userPosts, isLoading: postsLoading } = useUserIdeas(selectedProfile?.user?.id || '');
    // Fetch user's endorsed posts using existing hook
    const { data: endorsedPosts, isLoading: endorsedLoading } = useUserEndorsedIdeas(selectedProfile?.user?.id || '');
    // Fetch all proposals to match with proposal-state ideas
    const { data: allProposals } = useAllProposals();

    // Filter created posts by type
    const userIdeas = userPosts?.filter(post => post.state !== 'PROPOSAL' && post.active) || [];
    const userProposalIdeas = userPosts?.filter(post => post.state === 'PROPOSAL') || [];

    // Filter endorsed posts by type
    const endorsedIdeas = endorsedPosts?.filter(post => post.state !== 'PROPOSAL' && post.active) || [];
    const endorsedProposalIdeas = endorsedPosts?.filter(post => post.state === 'PROPOSAL') || [];

    // Calculate carousel pages (6 items per page)
    const ideaTotalPages = Math.ceil(userIdeas.length / 6);
    const proposalTotalPages = Math.ceil(userProposalIdeas.length / 6);
    const endorsedIdeaTotalPages = Math.ceil(endorsedIdeas.length / 6);
    const endorsedProposalTotalPages = Math.ceil(endorsedProposalIdeas.length / 6);

    const handleBackToCards = () => {
        // Navigate back to the previous page
        history.goBack();
    };

    // Fetch full profile data when component mounts
    useEffect(() => {
        const fetchFullProfile = async () => {
            if (!selectedProfile?.user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const userId = selectedProfile.user.id;
                const userType = selectedProfile.user.userType;

                let fullProfileData;

                // Fetch the appropriate profile type based on user type
                if (userType === 'MUNICIPAL') {
                    fullProfileData = await getMunicipalProfile(userId, null);
                } else if (userType === 'BUSINESS' || userType === 'COMMUNITY') {
                    fullProfileData = await getCommunityBusinessProfile(userId, null);
                } else {
                    // If userType doesn't match, use the basic data we have
                    setLoading(false);
                    return;
                }

                // Check if we got profile data back
                if (fullProfileData && Object.keys(fullProfileData).length > 0) {
                    // Merge the fetched full profile data with existing user data
                    const mergedProfile = {
                        ...fullProfileData,
                        user: selectedProfile.user // Keep the user data we already have
                    };

                    setSelectedProfile(mergedProfile as PublicProfile);
                } else {
                    // No profile data found - user hasn't created their profile yet
                    console.log('No profile data found for user:', userId);
                    // Keep the basic profile data we have from the list
                }
            } catch (err: any) {
                // Only show error if it's a real error, not just missing profile
                if (err.response?.status === 404) {
                    // Profile doesn't exist yet - this is normal, just use basic data
                    console.log('Profile not found - using basic user info');
                } else {
                    // Real error - log it and show user message
                    console.error('Error fetching full profile:', err);
                    console.error('Error details:', err.response?.data || err.message);
                    setError('Failed to load complete profile information. Showing available data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFullProfile();
    }, [selectedProfile?.user?.id]); // Only re-fetch if userId changes

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
                        ← Back
                    </Button>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Row className='mb-4'>
                    <Col>
                        <Alert variant='warning' dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Loading Spinner */}
            {loading && (
                <Row className='mb-4'>
                    <Col className='text-center'>
                        <Spinner animation='border' role='status'>
                            <span className='sr-only'>Loading profile...</span>
                        </Spinner>
                        <p className='mt-2 text-muted'>Loading profile information...</p>
                    </Col>
                </Row>
            )}
            
            {/* Profile Content */}
            {!loading && (
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
                                            <h6><strong>Statement</strong></h6>
                                            <p>{selectedProfile.statement || 'No statement provided'}</p>
                                        </div>
                                        
                                        {/* Service/Product Description */}
                                        <div className='mb-3'>
                                            <h6>
                                                <strong>{isMunicipalProfile(selectedProfile) ? 
                                                    'Service Responsibility' : 'Product/Service Description'}</strong>
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
                                    </Col>
                                </Row>
                            </BootstrapCard.Body>
                        </BootstrapCard>
                    </Col>
                </Row>
            )}

            {/* User Posts Section - Proposals */}
            {!loading && selectedProfile && (
                <Row className='mt-4'>
                    <Col lg={12}>
                        <style>
                            {`
                            .carousel-item {
                                position: relative;
                            }
                            .carousel-control-next,
                            .carousel-control-prev {
                                position: absolute;
                                top: 50%;
                                transform: translateY(-50%);
                                width: auto;
                                filter: invert(100%);
                            }
                            .carousel-control-next {
                                right: 0rem;
                            }
                            .carousel-control-prev {
                                left: 0rem;
                            }
                            .carousel-item.active, .carousel-item-next, .carousel-item-prev {
                                display: flex;
                                flex-wrap: wrap;
                            }
                            .carousel-indicators {
                                display: none;
                            }
                            .carousel-inner {
                                padding: 1.5rem;
                            }
                            `}
                        </style>

                        <h3 style={{ paddingTop: '1rem' }}>Posts Created by {selectedProfile.user?.organizationName || 'User'}</h3>
                        <hr />

                        <h4 style={{ paddingTop: '1rem' }}>Proposals</h4>
                        <hr />
                        {postsLoading ? (
                            <div className='text-center py-4'>
                                <Spinner animation='border' role='status'>
                                    <span className='sr-only'>Loading proposals...</span>
                                </Spinner>
                            </div>
                        ) : userProposalIdeas && userProposalIdeas.length > 0 ? (
                            <Carousel controls={true} interval={null} slide={true} fade={false}>
                                {[...Array(proposalTotalPages)].map((x, i) => (
                                    <Carousel.Item key={i}>
                                        {userProposalIdeas.slice(i * 6, i * 6 + 6).map((idea) => {
                                            // Find the matching proposal from allProposals
                                            const matchingProposal = allProposals?.find(p => p.ideaId === idea.id);
                                            return (
                                                <Col
                                                    key={idea.id}
                                                    md={6}
                                                    lg={4}
                                                    className='pt-3 align-items-stretch'
                                                >
                                                    <ProposalTile
                                                        proposalData={{ 
                                                            id: matchingProposal?.id || 0, 
                                                            ideaId: idea.id, 
                                                            idea: idea 
                                                        }}
                                                        showFooter={true}
                                                        postType='Proposal'
                                                    />
                                                </Col>
                                            );
                                        })}
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <div>This user has not submitted any proposals yet.</div>
                        )}

                        <br />
                        <h4 style={{ paddingTop: '1rem' }}>Ideas</h4>
                        <hr />
                        {postsLoading ? (
                            <div className='text-center py-4'>
                                <Spinner animation='border' role='status'>
                                    <span className='sr-only'>Loading ideas...</span>
                                </Spinner>
                            </div>
                        ) : userIdeas && userIdeas.length > 0 ? (
                            <Carousel controls={true} interval={null} slide={true} fade={false}>
                                {[...Array(ideaTotalPages)].map((x, i) => (
                                    <Carousel.Item key={i}>
                                        {userIdeas.slice(i * 6, i * 6 + 6).map((post) => {
                                            return (
                                                <Col
                                                    key={post.id}
                                                    md={6}
                                                    lg={4}
                                                    className='pt-3 align-items-stretch'
                                                >
                                                    <IdeaTile
                                                        ideaData={post}
                                                        showFooter={true}
                                                        postType='Idea'
                                                    />
                                                </Col>
                                            );
                                        })}
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <div>This user has not submitted any ideas yet.</div>
                        )}
                    </Col>
                </Row>
            )}

            {/* User Endorsed Posts Section */}
            {!loading && selectedProfile && (
                <Row className='mt-5'>
                    <Col lg={12}>
                        <h3 style={{ paddingTop: '1rem' }}>Posts Endorsed by {selectedProfile.user?.organizationName || 'User'}</h3>
                        <hr />

                        <h4 style={{ paddingTop: '1rem' }}>Proposals Endorsed</h4>
                        <hr />
                        {endorsedLoading ? (
                            <div className='text-center py-4'>
                                <Spinner animation='border' role='status'>
                                    <span className='sr-only'>Loading endorsed proposals...</span>
                                </Spinner>
                            </div>
                        ) : endorsedProposalIdeas && endorsedProposalIdeas.length > 0 ? (
                            <Carousel controls={true} interval={null} slide={true} fade={false}>
                                {[...Array(endorsedProposalTotalPages)].map((x, i) => (
                                    <Carousel.Item key={i}>
                                        {endorsedProposalIdeas.slice(i * 6, i * 6 + 6).map((idea) => {
                                            // Find the matching proposal from allProposals
                                            const matchingProposal = allProposals?.find(p => p.ideaId === idea.id);
                                            return (
                                                <Col
                                                    key={idea.id}
                                                    md={6}
                                                    lg={4}
                                                    className='pt-3 align-items-stretch'
                                                >
                                                    <ProposalTile
                                                        proposalData={{ 
                                                            id: matchingProposal?.id || 0, 
                                                            ideaId: idea.id, 
                                                            idea: idea 
                                                        }}
                                                        showFooter={true}
                                                        postType='Proposal'
                                                    />
                                                </Col>
                                            );
                                        })}
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <div>This user has not endorsed any proposals yet.</div>
                        )}

                        <br />
                        <h4 style={{ paddingTop: '1rem' }}>Ideas Endorsed</h4>
                        <hr />
                        {endorsedLoading ? (
                            <div className='text-center py-4'>
                                <Spinner animation='border' role='status'>
                                    <span className='sr-only'>Loading endorsed ideas...</span>
                                </Spinner>
                            </div>
                        ) : endorsedIdeas && endorsedIdeas.length > 0 ? (
                            <Carousel controls={true} interval={null} slide={true} fade={false}>
                                {[...Array(endorsedIdeaTotalPages)].map((x, i) => (
                                    <Carousel.Item key={i}>
                                        {endorsedIdeas.slice(i * 6, i * 6 + 6).map((post) => {
                                            return (
                                                <Col
                                                    key={post.id}
                                                    md={6}
                                                    lg={4}
                                                    className='pt-3 align-items-stretch'
                                                >
                                                    <IdeaTile
                                                        ideaData={post}
                                                        showFooter={true}
                                                        postType='Idea'
                                                    />
                                                </Col>
                                            );
                                        })}
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <div>This user has not endorsed any ideas yet.</div>
                        )}
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default ProfileCardDisplayPage;