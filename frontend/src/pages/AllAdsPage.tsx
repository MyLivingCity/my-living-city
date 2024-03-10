import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import AllAdsPageContent from '../components/content/AllAdsPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAdvertisements } from '../hooks/advertisementHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useContext } from 'react';

// Extends Route component props with idea title route param
interface AllAdsPageProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const AllAdsPage: React.FC<AllAdsPageProps> = ({}) => {
    const { token } = useContext(UserProfileContext);

    const { data, isLoading} = useAdvertisements();

  
    if (isLoading) {
        <div className='wrapper'>
            <LoadingSpinner />
        </div>;
    }

    // TODO: Create non blocking error handling

    return (
        <div className='wrapper'>
            <AllAdsPageContent token={token} AllAdvertisement={data}/>
        </div>
    );
};

export default AllAdsPage;