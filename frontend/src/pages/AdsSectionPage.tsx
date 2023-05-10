import React from 'react'
import AdsSection from 'src/components/partials/LandingContent/AdsSection';
import { useAdvertisements } from 'src/hooks/advertisementHooks';



export const AdsSectionPage = () => {
    // const { token } = useContext(UserProfileContext);
    const {data} = useAdvertisements();
    return (
        <div>
            <AdsSection ads={data}/>
        </div>
    )
}