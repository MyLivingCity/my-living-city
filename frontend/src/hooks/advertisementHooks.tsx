import { useQuery } from 'react-query';
import { IFetchError } from '../lib/types/types';
import { IAdvertisement, ISegmentAdPrice, IDefaultAdPrice } from '../lib/types/data/advertisement.type';
import { getPublishedAdvertisement, getAdsByUserId, getAllAdvertisement, getSegmentAdPrices, getDefaultAdPrice } from '../lib/api/advertisementRoutes';


export const useAdvertisements = () => {
    return useQuery<IAdvertisement[], IFetchError>(
        'AllAdvertisement',getAllAdvertisement,
    );
};

export const usePublishedAds = () => {
    return useQuery<IAdvertisement[], IFetchError>(
        'AllPublished',getPublishedAdvertisement,
    );
};

export const useGetUserAds = (ownerId: any) => {
    return useQuery<IAdvertisement[], IFetchError>(
        ['AllUserAds', ownerId],
        () => getAdsByUserId(ownerId),
    );
};

export const useSegmentAdPrices = () => {
    return useQuery<ISegmentAdPrice[], IFetchError>('SegmentAdPrices', getSegmentAdPrices);
};

export const useDefaultAdPrice = () => {
    return useQuery<IDefaultAdPrice, IFetchError>('DefaultAdPrice', getDefaultAdPrice);
};