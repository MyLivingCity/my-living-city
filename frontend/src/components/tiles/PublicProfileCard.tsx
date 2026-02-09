import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { PublicProfileWithStats } from '../../lib/api/publicProfileRoutes';

// Props for the public profile card component
interface PublicProfileCardProps {
    profileWithStats: PublicProfileWithStats;
    onClick?: (profile: PublicProfileWithStats) => void;
    showStats?: boolean;
}

// Props that this card will use takes only a subset of the data passed in.
// This is to not display too much on the card, but to have all of the data passed
// in to the public profile page when the card is clicked.
const PublicProfileCard: React.FC<PublicProfileCardProps> = ({ 
    profileWithStats,
    onClick,
    showStats = false
}) => {
    if (!profileWithStats) return null;

    // Using PublicProfileWithStats
    const displayName = profileWithStats.businessName || 
                        profileWithStats.municipalityName || 
                        profileWithStats.userName ||
                        `${profileWithStats.fname || ''} ${profileWithStats.lname || ''}`.trim() || 
                        'Anonymous User';

    const getBadgeVariant = () => {
        switch (profileWithStats.profileType) {
            case 'municipal':
                return 'primary';
            case 'residential':
                return 'secondary';
            case 'community':
                return 'success';
            case 'business':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    const getBadgeLabel = () => {
        switch (profileWithStats.profileType) {
            case 'municipal':
                return 'Municipal';
            case 'residential':
                return 'Residential';
            case 'community':
                return 'Community';
            case 'business':
                return 'Business';
            default:
                return 'Business';
        }
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick(profileWithStats);
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
                    variant={getBadgeVariant()} 
                    className='user-select-none'
                >
                    {getBadgeLabel()}
                </Badge>

                {/* Stats Display */}
                {showStats && (
                    <div className='mt-3 d-flex justify-content-around text-muted small'>
                        <div className='text-center'>
                            <div className='fw-bold text-dark'>
                                {profileWithStats.endorsements || 0}
                            </div>
                            <div>Endorsements</div>
                        </div>
                        <div className='text-center'>
                            <div className='fw-bold text-dark'>
                                {profileWithStats.postsCount || 0}
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