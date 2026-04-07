import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import AllAdsPageContent from '../components/content/AllAdsPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAdvertisements } from '../hooks/advertisementHooks';
import { useQuery, useQueryClient } from 'react-query';
import { getSegmentAdPrices, getDefaultAdPrice } from '../lib/api/advertisementRoutes';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useContext } from 'react';

// Extends Route component props with idea title route param
interface AllAdsPageProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const AllAdsPage: React.FC<AllAdsPageProps> = ({}) => {
    const { token, user } = useContext(UserProfileContext);
    const queryClient = useQueryClient();

    const { data, isLoading} = useAdvertisements();
    const { data: segmentAdPrices } = useQuery('SegmentAdPrices', getSegmentAdPrices);
    const { data: defaultAdPrice } = useQuery('DefaultAdPrice', getDefaultAdPrice);

  
    if (isLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );
    }

    const refetchPricing = () => {
        queryClient.invalidateQueries('SegmentAdPrices');
        queryClient.invalidateQueries('DefaultAdPrice');
    };

    // TODO: Create non blocking error handling

    return (
        <div className='wrapper'>
            <AllAdsPageContent 
                token={token} 
                user={user}
                AllAdvertisement={data}
                segmentAdPrices={segmentAdPrices}
                defaultAdPrice={defaultAdPrice}
                refetchPricing={refetchPricing}
            />
        </div>
    );
};

export default AllAdsPage;