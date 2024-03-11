import { useQuery } from 'react-query';
import { IAdvertisement } from '../lib/types/data/advertisement.type';
import { IFetchError } from '../lib/types/types';
import { getAdvertisementById } from '../lib/api/advertisementRoutes';

export const useSingleAdvertisement = (adsId: any) => {
    return useQuery<IAdvertisement, IFetchError>(
        ['SingleAdvertisement', adsId],
        () => getAdvertisementById(adsId),
    );
};