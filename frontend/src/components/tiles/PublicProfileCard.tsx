import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { PublicCommunityBusinessProfile, PublicMunicipalProfile } from '../../lib/types/data/publicProfile.type';
import { PublicProfileWithStats } from '../../lib/api/publicProfileRoutes';

// Union type for public profiles
type PublicProfile = (PublicCommunityBusinessProfile | PublicMunicipalProfile) & {
    user: {
        id: string;
        fname?: string;
        lname?: string;
        userType: string;
        organizationName?: string;
    }
};

// Props that can accept either full profile data or summary stats data
interface PublicProfileCardProps {
    publicProfile?: PublicProfile;
    profileWithStats?: PublicProfileWithStats;
    onClick?: (publicProfile: PublicProfile | PublicProfileWithStats) => void;
    showStats?: boolean; // New prop to show endorsement/post stats
}



// Helper to determine if profile is municipal
const isMunicipalProfile = (profile: PublicProfile): boolean => {
    return 'responsibility' in profile;
};

const getProfileTypeColor = (profile: PublicProfile) => {
    return isMunicipalProfile(profile) ? 'primary' : 'success';
};

// Maps the profile type to a user-friendly display string
const getProfileTypeDisplay = (profile: PublicProfile) => {
    return isMunicipalProfile(profile) ? 'Municipal' : 'Business';
};


// Props that this card will use takes only a subset of the data passed in.
// This is to not display too much on the card, but to have all of the data passed
// in to the public profile page when the card is clicked.
const PublicProfileCard: React.FC<PublicProfileCardProps> = ({ 
    publicProfile, 
    profileWithStats,
    onClick,
    showStats = false
}) => {
    // Handle both profile types
    const profile = profileWithStats || publicProfile;
    if (!profile) return null;

    let displayName: string;
    let fname: string | undefined;
    let lname: string | undefined;
    let organizationName: string | undefined;

    if (profileWithStats) {
        // Using PublicProfileWithStats
        displayName = profileWithStats.businessName || profileWithStats.municipalityName || 
                     `${profileWithStats.fname || ''} ${profileWithStats.lname || ''}`.trim() || 'Anonymous User';
        fname = profileWithStats.fname;
        lname = profileWithStats.lname;
    } else if (publicProfile) {
        // Using full PublicProfile
        fname = publicProfile.user.fname;
        lname = publicProfile.user.lname;
        organizationName = publicProfile.user.organizationName;
        displayName = organizationName || `${fname || ''} ${lname || ''}`.trim() || 'Anonymous User';
    } else {
        return null;
    }

    const handleCardClick = () => {
        if (onClick && profile) {
            onClick(profile);
        }
    };

    return (
        <Card 
            style={{ 
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
            }}
            className={onClick ? 'shadow-sm user-profile-card h-100' : 'h-100'}
            onClick={handleCardClick}
        >
            <style>
                {`
                    .user-profile-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.12);
                        transition: all 0.2s ease-in-out;
                    }
                    .avatar-placeholder {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background-color: #f8f9fa;
                        border: 2px solid #dee2e6;
                        margin: 0 auto 1rem auto;
                    }
                `}
            </style>
            
            <Card.Body className='text-center'>
                {/* Avatar Placeholder */}
                <div className='avatar-placeholder'></div>

                {/* User Name */}
                <Card.Title className='mb-2'>
                    {displayName}
                </Card.Title>

                {/* Profile Type Badge */}
                <Badge 
                    variant={profileWithStats ? 
                        (profileWithStats.profileType === 'municipal' ? 'info' : 'success') : 
                        getProfileTypeColor(publicProfile!)} 
                    className='user-select-none'
                >
                    {profileWithStats ? 
                        (profileWithStats.profileType === 'municipal' ? 'Municipal' : 'Business') :
                        getProfileTypeDisplay(publicProfile!)}
                </Badge>

                {/* Stats Display */}
                {showStats && (
                    <div className='mt-3 d-flex justify-content-around text-muted small'>
                        <div className='text-center'>
                            <div className='fw-bold text-dark'>
                                {profileWithStats ? 
                                    (profileWithStats.endorsements || 0) : 
                                    ((publicProfile?.user as any)?.endorsementCount || 0)}
                            </div>
                            <div>Endorsements</div>
                        </div>
                        <div className='text-center'>
                            <div className='fw-bold text-dark'>
                                {profileWithStats ? 
                                    (profileWithStats.postsCount || 0) : 
                                    ((publicProfile?.user as any)?.postCount || 0)}
                            </div>
                            <div>Posts</div>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default PublicProfileCard;