import { RouteComponentProps } from 'react-router-dom';
import CommunityDashboardContent from './../components/content/CommunityDashboardContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSegmentInfoAggregate, useSingleSegmentBySegmentId } from './../hooks/segmentHooks';
// import { useIdeasHomepage } from 'src/hooks/ideaHooks';
import {useIdeasBySegmentId} from 'src/hooks/ideaHooks'; //new one
import { useContext, useState } from 'react';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { useAllUserSegments } from 'src/hooks/userSegmentHooks';

interface CommunityDashboardPageProps extends RouteComponentProps<{
    segId: string;
}>{}

const CommunityDashboardPage: React.FC<CommunityDashboardPageProps> = (props) => {
    let {
        match: {
            params: { segId },
        },
    } = props;

    const { user, token } = useContext(UserProfileContext);
    // const [currentSegmentId, setCurrentSegmentId] = useState(parseInt(segId));
    const allUserSegmentsQueryResult = useAllUserSegments(token, user?.id || null);
    const segmentInfoAggregateQueryResult = useSegmentInfoAggregate(parseInt(segId));
    const singleSegmentBySegmentIdQueryResult = useSingleSegmentBySegmentId(parseInt(segId));
    // const ideasHomepageQueryResult = useIdeasHomepage();
    const ideasCommunityDashboardQueryResult = useIdeasBySegmentId(parseInt(segId));

    // if segId == 0 then try and set to one of the user home, work, or school segments
    if (parseInt(segId) === 0) {
        const { homeSegmentId, workSegmentId, schoolSegmentId } = allUserSegmentsQueryResult.data || {};
        const fallbackSegmentId = homeSegmentId || workSegmentId || schoolSegmentId;
        if (fallbackSegmentId) {
            props.history.push(`/community-dashboard/${fallbackSegmentId}`);
            window.location.reload();
        } else {
            return <p>No community data available. Please check your profile.</p>;
        }
    }

    if (segId === '0') {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className='wrapper'>
            <CommunityDashboardContent
                allUserSegmentsQueryResult={allUserSegmentsQueryResult}
                segmentInfoAggregateQueryResult={segmentInfoAggregateQueryResult}
                singleSegmentBySegmentIdQueryResult={
                    singleSegmentBySegmentIdQueryResult
                }
                // ideasHomepageQueryResult={ideasHomepageQueryResult}
                ideasCommunityDashboardQueryResult={ideasCommunityDashboardQueryResult} //NEW HOOK
                // onSegmentChange={(newSegmentId) => setCurrentSegmentId(newSegmentId)}   //CALLBACK 
            />
        </div>
    );
};

export default CommunityDashboardPage;