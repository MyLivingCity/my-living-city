import React, { useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { UserProfileContext } from "../contexts/UserProfile.Context";
import SubmitDirectProposalPageContent from "../components/content/SubmitDirectProposalPageContent";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useCategories } from "../hooks/categoryHooks";
// import { getUserHomeSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import {
  useAllUserSegments,
  useAllUserSegmentsRefined,
} from "src/hooks/userSegmentHooks";

// Extends Route component props with idea title route param
interface SubmitDirectProposalPageProps extends RouteComponentProps<{}> {
  // Add custom added props here
}

const SubmitDirectProposalPage: React.FC<
  SubmitDirectProposalPageProps
> = ({}) => {
  const { token, user } = useContext(UserProfileContext);
  const { data, isLoading, error, isError } = useCategories();
  const segData = useAllUserSegmentsRefined(token, user!.id);
  if (isLoading || segData.isLoading) {
    return (
      <div className="wrapper">
        <LoadingSpinner />
      </div>
    );
  }

  // TODO: Create non blocking error handling

  return (
    <div className="wrapper">
      <SubmitDirectProposalPageContent categories={data} segData={segData.data} />
    </div>
  );
};

export default SubmitDirectProposalPage;
