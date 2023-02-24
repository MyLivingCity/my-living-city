import { RouteComponentProps } from "react-router-dom";
import CommunityDashboardContent from "./../components/content/CommunityDashboardContent";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useSegmentInfoAggregate, useSingleSegmentBySegmentId } from "./../hooks/segmentHooks";
import { useIdeasHomepage } from "src/hooks/ideaHooks";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import { useUserWithJwtVerbose } from "src/hooks/userHooks";
import { useContext } from "react";
import { UserProfileContext } from "src/contexts/UserProfile.Context";
import { useAllUserSegments } from "src/hooks/userSegmentHooks";

interface CommunityDashboardPageProps extends RouteComponentProps<{
    segId: string;
}>{}

const CommunityDashboardPage: React.FC<CommunityDashboardPageProps> = (props) => {
    const {
        match: {
            params: { segId },
        },
    } = props;

    const { logout, user, token } = useContext(UserProfileContext);
    const { data: userData } = useUserWithJwtVerbose({
      jwtAuthToken: token!,
      shouldTrigger: token != null,
    });

    const {data: segmentAggregatData,
            error, 
            isLoading: isAggregateLoading, 
            isError: isAggregateError
        } = useSegmentInfoAggregate(parseInt(segId));
    const {data: segmentInfoData,
        error: segmentInfoError,
        isLoading: isSegmentInfoLoading,
        isError: isSegmentInfoError,
        } = useSingleSegmentBySegmentId(parseInt(segId));

    const {
        data: iData,
        error: iError,
        isLoading: iLoading,
        isError: iIsError,
        } = useIdeasHomepage();

    const {
        data: userSegments,
        isLoading: isUserSegmentsLoading,
        isError: isUserSegmentsError
    } = useAllUserSegments(token, user?.id || null);
    

    if (isAggregateError || isSegmentInfoError || iError || isUserSegmentsError) {
        return (
          <div className="wrapper">
            <p>
              Error occured while trying to retrieve community info. Please try again later.
            </p>
          </div>
        );
    }

    if (isAggregateLoading || isSegmentInfoLoading || iLoading || userData === null || userData === undefined || isUserSegmentsLoading) {
        return (
          <div className="wrapper">
            <LoadingSpinner />
          </div>
        );
    }

    const filteredTopIdeas = () => {
        const segmentId = segmentInfoData?.segId;
        const filteredTopIdeas: IIdeaWithAggregations[] = [];
        iData && iData.forEach(idea => {
            if (idea.segId && idea.segId === segmentId) {
                filteredTopIdeas.push(idea);
            }
        });
        return filteredTopIdeas;
    }

    return (
        <>
            <div className="wrapper">
                <CommunityDashboardContent userData ={userData!} topIdeas={filteredTopIdeas()} data={segmentAggregatData!} segmenData={segmentInfoData!} segmentIds={userSegments} />
            </div>
        </>
    );
}

export default CommunityDashboardPage;