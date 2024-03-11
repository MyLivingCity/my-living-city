import React from 'react';
import AdsSection from 'src/components/partials/LandingContent/AdsSection';
import { usePublishedAds } from 'src/hooks/advertisementHooks';



export const AdsSectionPage = () => {
    // const { token } = useContext(UserProfileContext);
    const {data} = usePublishedAds();
    return (
        <div>
            <AdsSection ads={data}/>
        </div>
    );
};