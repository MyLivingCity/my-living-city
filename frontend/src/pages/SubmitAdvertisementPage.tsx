import React from 'react'
import { RouteComponentProps } from 'react-router-dom';
import SubmitAdvertisementPageContent from '../components/content/SubmitAdvertisementPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCategories } from '../hooks/categoryHooks';

// Extends Route component props with advertisement title route param
interface SubmitAdvertisementPageProps extends RouteComponentProps<{}> {
    // Add custom added props here 
}

const SubmitAdvertisementPage: React.FC<SubmitAdvertisementPageProps> = ({}) => {
    const { data, isLoading, error, isError } = useCategories();
  
    if (isLoading) {
      return(
        <div className="wrapper">
        <LoadingSpinner />
        </div>
      )

    }
  
    // TODO: Create non blocking error handling
  
    return (
      <div className="wrapper">
        <SubmitAdvertisementPageContent/>
      </div>
    );
  }
  
  export default SubmitAdvertisementPage;