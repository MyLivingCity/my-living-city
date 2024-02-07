import axios from 'axios';
import { format } from 'prettier';
import { API_BASE_URL } from '../constants';
import { CreateAdvertisementInput } from '../types/input/advertisement.input';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
import { IAdvertisement } from '../types/data/advertisement.type';

// POST Create a new advertisement
export const postCreateAdvertisement = async (advertisementData:CreateAdvertisementInput, token: string | null) =>{
    const {adType,adTitle,adPosition, duration,externalLink, published,imagePath} = advertisementData;

   
    //if adType is not predifined value or missing 
    if(!adType||!(adType==='BASIC'||adType==='EXTRA')){
        throw new Error('You must choose a advertisement type, or something is wrong when accepting adType data.');
    }
    //if daTitle size is not correct or missing
    if(!adTitle||adTitle.length<2||adTitle.length>40){
        throw new Error('adTitle must be provided or something is wrong when accepting adTitle data.');
    }
    //if adPosition's size isn't correct or missing
    if(!adPosition||adPosition.length<1||adPosition.length>85){
        throw new Error('You must provide a target position for advertisement or your position length is invalid (longer or equal to 1, shorter than 85)');
    }
    //if duration is not valid or missing
    if(duration === undefined){
        throw new Error('You must provide a duration for your advertisement or your duration is invalid (must be bigger than 0)');
    }
    //if imagePath is missing
    if(!imagePath){
        throw new Error('You must provided a advertisement image for you advertisement.');
    }
    //if published field is invalid
    if(published==null || published==undefined){
        throw new Error('You must let us know if you want to publish you advertisement.');
    }
    //create a new form-data form and add all filed to it
    const advertisementForm = new FormData();
    advertisementForm.append('adType',adType);
    advertisementForm.append('adTitle',adTitle);
    advertisementForm.append('adPosition',adPosition);
    advertisementForm.append('adDuration', duration.toString());
    advertisementForm.append('externalLink', externalLink);
    advertisementForm.append('published', published ? 'true' : 'false');
    advertisementForm.append('imagePath', imagePath[0]);
    //advertisement api configuration and call
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/advertisement/create`,
        data: advertisementForm,
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token, 'Access-Control-Allow-Origin': '*' },
        withCredentials: true
    });
    //if not success, throw error which will stop form reset
    if(!(res.status==201 || res.status==200)){
        throw new Error(res.data);
    }
    //return response data
    return res.data;
};

// GET Retrieve all advertisement info
export const getAllAdvertisement = async () => {
    const res = await axios.get<IAdvertisement[]>(`${API_BASE_URL}/advertisement/getAll`);
    return res.data;
};
export const getPublishedAdvertisement = async () => {
    const res = await axios.get<IAdvertisement[]>(`${API_BASE_URL}/advertisement/getAllPublished`);
    return res.data;
};

export const getAdsByUserId = async (userId: any) => {
    const res = await axios.get<IAdvertisement[]>(`${API_BASE_URL}/advertisement/getAllUser/${userId}`);
    return res.data;
};

export const getAdvertisementById = async (adsId: any) => {
    const res = await axios.get<IAdvertisement>(`${API_BASE_URL}/advertisement/get/${adsId}`);
    return res.data;
};

export const getAdvertisementByOwnerId = async (ownerId: any) => {
    const res = await axios.get<IAdvertisement[]>(`${API_BASE_URL}/advertisement/getAdsByOwner/${ownerId}`);
    return res.data;
};

// PUT Update/Replace specific advertisement info
export const updateAdvertisement = async (adsData: any, token:any, id: any) =>{
   
    // const{id}=adsData;
    const parsedPayload = {...adsData};
   
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/advertisement/update/${id}`,
        data: parsedPayload,
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    });
    //if not success, throw error which will stop form reset
    if(!(res.status===201 || res.status===200)){
        throw new Error(res.data);    
    }
    return res.data;
};

// DELETE specific advertisement info
export const deleteAdvertisement = async (token: any, id: any) =>{

    // const parsedPayload = {...adsData};
   
    const res = await axios({
        method: 'delete',
        url: `${API_BASE_URL}/advertisement/delete/${id}`,
        // data: parsedPayload,
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    });
    return res.data;
};