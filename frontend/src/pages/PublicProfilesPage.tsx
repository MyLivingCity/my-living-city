import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import PublicProfileCard from '../components/tiles/PublicProfileCard';
import PublicProfileSearch from '../components/search/PublicProfileSearch';
import { getAllPublicProfiles, PublicProfileWithStats } from '../lib/api/publicProfileRoutes';
import { SearchFilters } from '../lib/types/data/publicProfile.type';
import { UserProfileContext } from '../contexts/UserProfile.Context';


const PublicProfilesPage: React.FC = () => {
    const history = useHistory();
    const { token } = useContext(UserProfileContext);
    const [profiles, setProfiles] = useState<PublicProfileWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [filters, setFilters] = useState<SearchFilters>({});

    const fetchProfiles = async (searchFilters: SearchFilters = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            // Map profile types to match API expectations
            let profileTypeParam: 'community' | 'municipal' | 'residential' | undefined;
            if (searchFilters.profileType === 'BUSINESS') {
                profileTypeParam = 'community';
            } else if (searchFilters.profileType === 'MUNICIPAL') {
                profileTypeParam = 'municipal';
            } else if (searchFilters.profileType === 'RESIDENTIAL') {
                profileTypeParam = 'residential';
            } else {
                profileTypeParam = undefined;
            }

            const response = await getAllPublicProfiles(
                searchFilters.searchQuery || '',
                profileTypeParam,
                searchFilters.community ? Number(searchFilters.community) : undefined,
                searchFilters.neighbourhood ? Number(searchFilters.neighbourhood) : undefined,
                token || null
            );
            
            setProfiles(response.profiles || []);
            setTotalResults(response.totalCount);
        } catch (err) {
            console.error('Error fetching public profiles:', err);
            setError('Failed to load public profiles. Please try again later.');
            setProfiles([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles(filters);
    }, [filters, token]);

    const handleSearch = (searchQuery: string, searchFilters: SearchFilters) => {
        const newFilters = { ...searchFilters, searchQuery };
        setFilters(newFilters);
    };

    const handleProfileClick = (profile: PublicProfileWithStats) => {
        // Transform PublicProfileWithStats to a basic format for ProfileCardDisplayPage
        // Note: Some fields will be empty as they're not provided by the summary API, 
        // Will need to fetch the PublicProfile information when it exists.
        const transformedProfile = {
            statement: '', // Not available in summary data
            contactEmail: '', // Not available in summary data
            contactPhone: '', // Not available in summary data
            address: profile.location || '', // Use location as address
            links: [], // Not available in summary data
            responsibility: profile.profileType === 'municipal' ? 'Municipal services and administration' : undefined,
            description:
                profile.profileType === 'residential'
                    ? ''
                    : profile.profileType !== 'municipal'
                        ? 'Community business services'
                        : undefined,
            user: {
                id: profile.userId || '',
                fname: profile.fname || '',
                lname: profile.lname || '',
                userType: 
                    profile.profileType === 'municipal' ? 'MUNICIPAL'
                        : profile.profileType === 'residential' ? 'RESIDENTIAL'
                            : profile.profileType === 'community' ? 'COMMUNITY'
                                : 'BUSINESS',
                organizationName: profile.businessName || profile.municipalityName || '',
            }
        };

        // Navigate to profile detail page with the transformed profile data
        history.push('/profile-card-display', { publicProfile: transformedProfile });
    };

    return (
        <Container className='mt-4'>
            {/* Header */}
            <Row className='mb-4'>
                <Col>
                    <h1>Public Profiles</h1>
                    <p className='text-muted'>
                        Discover municipal departments and community businesses in your area. 
                        Profiles are ranked by community engagement and contributions.
                    </p>
                </Col>
            </Row>

            {/* Search and Filter */}
            <Row className='mb-4'>
                <Col>
                    <PublicProfileSearch onSearch={handleSearch} />
                </Col>
            </Row>

            {/* Results Summary */}
            {!loading && (
                <Row className='mb-3'>
                    <Col>
                        <p className='text-muted'>
                            {totalResults === 0 
                                ? 'No profiles found' 
                                : `Showing ${profiles.length} of ${totalResults} profile${totalResults !== 1 ? 's' : ''}`
                            }
                            {filters.searchQuery && ` for '${filters.searchQuery}'`}
                        </p>
                    </Col>
                </Row>
            )}

            {/* Error Alert */}
            {error && (
                <Row className='mb-4'>
                    <Col>
                        <Alert variant='danger'>{error}</Alert>
                    </Col>
                </Row>
            )}

            {/* Loading Spinner */}
            {loading && (
                <Row className='mb-4'>
                    <Col className='text-center'>
                        <Spinner animation='border' role='status'>
                            <span className='sr-only'>Loading profiles...</span>
                        </Spinner>
                        <p className='mt-2 text-muted'>Loading public profiles...</p>
                    </Col>
                </Row>
            )}

            {/* Profile Cards Grid */}
            {!loading && profiles.length > 0 && (
                <Row>
                    {profiles.map((profile) => (
                        <Col 
                            key={profile.userId || (profile as any).id}
                            lg={4}
                            md={6}
                            sm={12}
                            xs={12}
                            className='pt-3 align-items-stretch mb-4'
                        >
                            <PublicProfileCard 
                                profileWithStats={profile}
                                onClick={(profile) => handleProfileClick(profile as any)}
                                showStats={true}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            {/* No Results Message */}
            {!loading && profiles.length === 0 && !error && (
                <Row>
                    <Col className='text-center py-5'>
                        <div className='text-center'>
                            <div className='text-muted'>
                                No public profiles found.
                            </div>
                            <p className='text-muted'>
                                {filters.searchQuery || Object.keys(filters).length > 0
                                    ? 'Try adjusting your search criteria or filters.'
                                    : 'There are no public profiles available at this time.'
                                }
                            </p>
                        </div>
                    </Col>
                </Row>
            )}


        </Container>
    );
};

export default PublicProfilesPage;