import React, { useContext } from 'react'
import AdsSection from 'src/components/partials/LandingContent/AdsSection';
import LoadingSpinner from 'src/components/ui/LoadingSpinner';
import { useAdvertisements } from 'src/hooks/advertisementHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';


export const AdsSectionPage = () => {
    const { token } = useContext(UserProfileContext);
    const {data} = useAdvertisements(token!);
    return (
        <div>
            <AdsSection ads={data}/>
        </div>
    )
}