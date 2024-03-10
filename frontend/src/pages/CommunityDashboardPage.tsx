import { RouteComponentProps } from 'react-router-dom';
import CommunityDashboardContent from './../components/content/CommunityDashboardContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSegmentInfoAggregate, useSingleSegmentBySegmentId } from './../hooks/segmentHooks';
import { useIdeasHomepage } from 'src/hooks/ideaHooks';
import { useContext } from 'react';
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
    const allUserSegmentsQueryResult = useAllUserSegments(token, user?.id || null);
    const segmentInfoAggregateQueryResult = useSegmentInfoAggregate(parseInt(segId));
    const singleSegmentBySegmentIdQueryResult = useSingleSegmentBySegmentId(parseInt(segId));
    const ideasHomepageQueryResult = useIdeasHomepage();
    // if segId == 0 then use segmentIds to set segId to the home segment
    if (parseInt(segId) === 0 && allUserSegmentsQueryResult.data?.homeSegmentId) {
        props.history.push(`/community-dashboard/${allUserSegmentsQueryResult.data.homeSegmentId}`);
        window.location.reload();
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
                ideasHomepageQueryResult={ideasHomepageQueryResult}
            />
        </div>
    );
};

export default CommunityDashboardPage;