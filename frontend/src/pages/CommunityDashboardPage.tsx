import { RouteComponentProps } from "react-router-dom";
import CommunityDashboardContent from "./../components/content/CommunityDashboardContent";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useSegmentInfoAggregate, useSingleSegmentBySegmentId } from "./../hooks/segmentHooks";
import { useIdeasHomepage } from "src/hooks/ideaHooks";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import { useContext } from "react";
import { UserProfileContext } from "src/contexts/UserProfile.Context";
import { useAllUserSegments } from "src/hooks/userSegmentHooks";

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
    const {
      data: segmentInfoData,
      isLoading: isSegmentInfoLoading,
      isError: isSegmentInfoError,
    } = useSingleSegmentBySegmentId(parseInt(segId));
    const {
      data: iData,
      isLoading: iIsLoading,
      isError: iIsError,
    } = useIdeasHomepage();
    const allUserSegmentsQueryResult = useAllUserSegments(token, user?.id || null);
    const segmentInfoAggregateQueryResult = useSegmentInfoAggregate(parseInt(segId));
    // if segId == 0 then use segmentIds to set segId to the home segment
    if (parseInt(segId) === 0 && allUserSegmentsQueryResult.data?.homeSegmentId) {
      props.history.push(`/community-dashboard/${allUserSegmentsQueryResult.data.homeSegmentId}`);
      window.location.reload();
    }

    if (segId === "0") {
        return (
            <div className="wrapper">
                <LoadingSpinner />
            </div>
        );
    }


    if (isSegmentInfoError || iIsError) {
        return (
          <div className="wrapper">
            <p>
              Error occured while trying to retrieve community info. Please try again later.
            </p>
          </div>
        );
    }

    if (isSegmentInfoLoading || iIsLoading) {
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
            if (idea.segId && idea.segId === segmentId || (idea.segId == null && idea.superSegId == segmentInfoData?.superSegId )) {
                filteredTopIdeas.push(idea);
            }

        });
        return filteredTopIdeas;
    }

    return (
      <>
        <div className="wrapper">
          <CommunityDashboardContent
            topIdeas={filteredTopIdeas()}
            segmentData={segmentInfoData!}
            allUserSegmentsQueryResult={allUserSegmentsQueryResult}
            segmentInfoAggregateQueryResult={segmentInfoAggregateQueryResult}
          />
        </div>
      </>
    );
}

export default CommunityDashboardPage;