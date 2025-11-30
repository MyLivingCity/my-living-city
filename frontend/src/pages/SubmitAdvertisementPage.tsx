import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { USER_TYPES } from 'src/lib/constants';
import { ISegment } from 'src/lib/types/data/segment.type';
import { IAdPrice } from 'src/lib/types/data/adPrice.type';
import { delay } from 'src/lib/utilityFunctions';
import SubmitAdvertisementPageContent from '../components/content/SubmitAdvertisementPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCategories } from '../hooks/categoryHooks';
import { useAllAdPrices } from '../hooks/adPriceHooks';
import { useAllSegments } from '../hooks/segmentHooks';
import { getAllSegments } from './../lib/api/segmentRoutes';
import { getMyUserSegmentInfo } from './../lib/api/userSegmentRoutes';
//import { getAdPrice } from './../lib/api/adPriceRoutes';
// Extends Route component props with advertisement title route param
interface SubmitAdvertisementPageProps extends RouteComponentProps<{}> {
    // Add custom added props here 
}

const SubmitAdvertisementPage: React.FC<SubmitAdvertisementPageProps> = ({ }) => {
    const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();
    const { data: adPriceData, isLoading: adPricesLoading, error: adPriceError} = useAllAdPrices();
    const { data: segmentsData, isLoading: segmentsLoading, error: segmentsError} = useAllSegments();
    const { token, user } = useContext(UserProfileContext);

    let isLoading = categoriesLoading || adPricesLoading;

    if (isLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>
        );

    }

    // TODO: Create non blocking error handling

    return (
        <div className='wrapper'>
            <SubmitAdvertisementPageContent
                segmentOptions={segmentsData}
                adPriceOptions={adPriceData}
            />
        </div>
    );
};

export default SubmitAdvertisementPage;