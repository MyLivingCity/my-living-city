import React, { useContext } from 'react';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { RouteComponentProps } from 'react-router-dom';
import { SegmentContent } from 'src/components/content/SegmentContent';

interface SegmentPageProps extends RouteComponentProps<{
    segId: string;
}>{}

export const SegmentPage: React.FC<SegmentPageProps> = (props) => {
    let {
        match: {
            params: { segId },
        },
    } = props;
    const { token, user } = useContext(UserProfileContext);

    return (    
        <div className='wrapper'>
            <SegmentContent 
                user={user!}
                token={token!} 
                segId={Number(segId)}
            />
        </div>
    );
};
