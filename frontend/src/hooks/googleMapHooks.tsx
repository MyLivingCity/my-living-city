import { useQuery } from 'react-query';
import { searchForLocation } from 'src/lib/api/googleMapQuery';
import { IFetchError } from 'src/lib/types/types';

export const useGoogleMapSearchLocation = (coords: any, trigger: boolean) => {
    return useQuery<any, IFetchError>('use-gmap-search-location', 
        () => searchForLocation(coords),
        {
            enabled: trigger
        });
};