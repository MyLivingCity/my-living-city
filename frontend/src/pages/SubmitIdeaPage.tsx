import React, { useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import SubmitIdeaPageContent from '../components/content/SubmitIdeaPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCategories } from '../hooks/categoryHooks';
// import { getUserHomeSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import {  useAllUserSegments, useAllUserSegmentsRefined } from 'src/hooks/userSegmentHooks';

// Extends Route component props with idea title route param
interface SubmitIdeaPageProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const SubmitIdeaPage: React.FC<SubmitIdeaPageProps> = ({}) => {
  const { token, user } = useContext(UserProfileContext);
  const { data, isLoading, error, isError } = useCategories();
  const segData = useAllUserSegmentsRefined(token, user!.id);
  if (isLoading || segData.isLoading) {
    return(
      <div className="wrapper">
      <LoadingSpinner />
      </div>
    )

  }

  // TODO: Create non blocking error handling

  return (
    <div className="wrapper">
      <SubmitIdeaPageContent categories={data} segData={segData.data}/>
    </div>
  );
}

export default SubmitIdeaPage