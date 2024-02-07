import { useQuery } from 'react-query';
import { IAdvertisement } from '../lib/types/data/advertisement.type';
import { IFetchError } from '../lib/types/types';
import { getPublishedAdvertisement } from '../lib/api/advertisementRoutes';
import { getAdsByUserId } from '../lib/api/advertisementRoutes';
import { getAllAdvertisement } from '../lib/api/advertisementRoutes';

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