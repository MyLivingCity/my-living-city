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
    let {
        match: {
            params: { segId },
        },
    } = props;

    const { logout, user, token } = useContext(UserProfileContext);
    const { data: userData } = useUserWithJwtVerbose({
      jwtAuthToken: token!,
      shouldTrigger: token != null,
    });

    const {
        data: userSegments,
        isLoading: isUserSegmentsLoading,
        isError: isUserSegmentsError
    } = useAllUserSegments(token, user?.id || null);

    // if segId == 0 then use userSegments to set segId to the home segment
    if (parseInt(segId, 10) === 0 && userSegments) {
        let home_segment_id = (userSegments || []).filter((seg: any) => seg.segType === "Segment" && seg.userType == "Resident")[0].id;

        console.log("home_segment_id: ", home_segment_id);
        props.history.push(`/community-dashboard/${home_segment_id}`);
        // segId = home_segment_id.toString();
        window.location.reload();
    }


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

    if (segId === "0") {
        return (
            <div className="wrapper">
                <LoadingSpinner />
            </div>
        );
    }


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
            if (idea.segId && idea.segId === segmentId || (idea.segId == null && idea.superSegId == segmentInfoData?.superSegId )) {
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