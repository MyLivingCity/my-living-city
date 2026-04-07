import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import AllAdsPageContent from '../components/content/AllAdsPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useGetUserAds } from '../hooks/advertisementHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useContext } from 'react';
import { useUserWithJwtVerbose } from 'src/hooks/userHooks';

// Extends Route component props with idea title route param
interface AllAdsPageProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const UserAdsPage: React.FC<AllAdsPageProps> = ({}) => {
    const { token, user } = useContext(UserProfileContext);
    const { data: aUser, isError, error } = useUserWithJwtVerbose({
        jwtAuthToken: token!,
        shouldTrigger: token != null
    });

    const { data, isLoading} = useGetUserAds(aUser?.id);
  
    if (isLoading) {
        <div className='wrapper'>
            <LoadingSpinner />
        </div>;
    }

    // TODO: Create non blocking error handling

    return (
        <div className='wrapper'>
            <AllAdsPageContent token={token} user={user} AllAdvertisement={data}/>
        </div>
    );
};

export default UserAdsPage;