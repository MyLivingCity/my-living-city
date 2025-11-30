import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { IAdPrice } from '../types/data/adPrice.type';

// GET all ad prices
export const getAdPrice = async (): Promise<IAdPrice[]> => {
    const res = await axios.get<IAdPrice[]>(`${API_BASE_URL}/advertisement/getPrices`);
    return res.data;
};

// PUT update a single ad price entry
export const updateAdPrice = async (id: number, data: { lengthWeeks: number; priceCadDollars: string }, token: string): Promise<IAdPrice> => {
    const res = await axios.put<IAdPrice>(
        `${API_BASE_URL}/advertisement/updatePrice/${id}`,
        data,
        { headers: { 'x-auth-token': token} }
    );
    return res.data;
};

// POST add a new ad price entry
export const addAdPrice = async (data: { lengthWeeks: number; priceCadDollars: string }, token: string): Promise<IAdPrice> => {
    const res = await axios.post<IAdPrice>(
        `${API_BASE_URL}/advertisement/addPrice`,
        data,
        { headers: { 'x-auth-token': token} }
    );
    return res.data;
};

// DELETE a single ad price entry
export const deleteAdPrice = async (id: number, token: string): Promise<void> => {
    await axios.delete(
        `${API_BASE_URL}/advertisement/deletePrice/${id}`,
        { headers: { 'x-auth-token': token} }
    );
};
