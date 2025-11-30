import { useQuery, useMutation, useQueryClient } from 'react-query';
import { IAdPrice } from '../lib/types/data/adPrice.type';
import { IFetchError } from '../lib/types/types';
import { getAdPrice, updateAdPrice, addAdPrice, deleteAdPrice } from '../lib/api/adPriceRoutes';

export const useAllAdPrices = () => {
    return useQuery<IAdPrice[], IFetchError>('AllAdPrices', getAdPrice);
};

export const useUpdateAdPrice = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ id, data, token }: { id: number; data: { lengthWeeks: number; priceCadDollars: string }; token: string }) =>
            updateAdPrice(id, data, token),
        {
            onSuccess: () => {
                // Refresh the ad prices list after updating
                queryClient.invalidateQueries('AllAdPrices');
            },
        }
    );
};

export const useAddAdPrice = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ data, token }: { data: { lengthWeeks: number; priceCadDollars: string }; token: string }) =>
            addAdPrice(data, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('AllAdPrices');
            },
        }
    );
};

export const useDeleteAdPrice = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ id, token }: { id: number; token: string }) => deleteAdPrice(id, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('AllAdPrices');
            },
        }
    );
};
