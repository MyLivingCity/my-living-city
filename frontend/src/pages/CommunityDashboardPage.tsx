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
        data: userSegments,
        isLoading: isUserSegmentsLoading,
        isError: isUserSegmentsError
    } = useAllUserSegments(token, user?.id || null);

    // if segId == 0 then use userSegments to set segId to the home segment
    if (parseInt(segId, 10) === 0 && userSegments) {
        let home_segment_id = 0
        if (Array.isArray(userSegments)) {
            home_segment_id = (userSegments).filter((seg: any) => seg.segType === "Segment" && seg.userType === "Resident")[0].homeSegmentId;
        } else {
            home_segment_id = userSegments.homeSegmentId
        }

        props.history.push(`/community-dashboard/${home_segment_id}`);
        window.location.reload();
    }


    const {
      data: segmentAggregateData,
      isLoading: isAggregateLoading,
      isError: isAggregateError,
    } = useSegmentInfoAggregate(parseInt(segId));
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

    if (segId === "0") {
        return (
            <div className="wrapper">
                <LoadingSpinner />
            </div>
        );
    }


    if (isAggregateError || isSegmentInfoError || iIsError || isUserSegmentsError) {
        return (
          <div className="wrapper">
            <p>
              Error occured while trying to retrieve community info. Please try again later.
            </p>
          </div>
        );
    }

    if (isAggregateLoading || isSegmentInfoLoading || iIsLoading || isUserSegmentsLoading) {
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
                <CommunityDashboardContent topIdeas={filteredTopIdeas()} data={segmentAggregateData!} segmentData={segmentInfoData!} segmentIds={userSegments} />
            </div>
        </>
    );
}

export default CommunityDashboardPage;