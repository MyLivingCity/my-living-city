import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { ISegment, ISubSegment, ISuperSegment } from '../types/data/segment.type';

export const getAllSegmentsWithSuperSegId = async (superSegId: any) => {
    const res = await axios.get<ISegment[]>(`${API_BASE_URL}/segment/getBySuperSegId/${superSegId}`);
    return res.data;
};

export const getAllSegments = async () => {
    const res = await axios.get<ISegment[]>(`${API_BASE_URL}/segment/getall`);
    return res.data;
};

export const getAllSuperSegments = async () => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/superSegment/getAll`,
    });
    return res.data;
};

export const getAllSuperSegmentsByCountryProvince = async (country: string, province: string) => {
    const res = await axios.get(`${API_BASE_URL}/superSegment/getByCountryProvince`, {
        params: { country, province }
    });
    return res.data;
};

export const getAllSubSegmentsWithId = async (segId: any) => {
    const res = await axios.get<ISubSegment[]>(`${API_BASE_URL}/subSegment/getBySegmentId/${segId}`);
    return res.data;
};

export const createSuperSegment = async (superSegData: any, token:any) =>{
    const parsedPayload = {...superSegData};
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/superSegment/create`,
        data: parsedPayload,
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    });
    if(!(res.status===201 || res.status===200)){
        throw new Error(res.data);
    }
    return res.data;
};

export const createSegment = async (segData: any, token:any) =>{
    const parsedPayload = {...segData};

    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/segment/create`,
        data: parsedPayload,
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    });
    if(!(res.status===201 || res.status===200)){
        throw new Error(res.data);
    }
    return res.data;
};
export const createSubSegment = async (segData: any, token:any) =>{
    const parsedPayload = {...segData};


    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/subSegment/create`,
        data: parsedPayload,
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    });
    if(!(res.status===201 || res.status===200)){
        throw new Error(res.data);    
    }
    return res.data;
};

export const updateSuperSegment = async (superSegData: any, token:any) =>{
    const{superSegId}=superSegData;
    const parsedPayload = {...superSegData};

    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/superSegment/update/${superSegId}`,
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

export const updateSegment = async (segData: any, token:any) =>{
    const{segId}=segData;
    const parsedPayload = {...segData};

    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/segment/update/${segId}`,
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

export const updateSubSegment = async (subSegData: any, token:any) =>{

    if(typeof subSegData.lat === 'string'){
        subSegData.lat = parseFloat(subSegData.lat);
    }
    if(typeof subSegData.lon === 'string'){
        subSegData.lon = parseFloat(subSegData.lon);
    }
    const{id}=subSegData;
    const parsedPayload = {...subSegData};
 
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/subSegment/update/${id}`,
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

export const findSegmentByName = async (segData: any) => {
    if(!segData.segName||!segData.province||!segData.country){
        throw new Error('location parameters are needed');
    }
    const parsedPayload = {...segData};
    const result = await axios({
        method: 'post',
        url: `${API_BASE_URL}/segment/getByName`,
        data: parsedPayload
    });

    return result.data;
};

export const findSubsegmentsBySegmentId = async (segId:number) => {
    if(segId<0){
        throw new Error('SegId is invalid!');
    }

    const result = await axios({
        method: 'get',
        url: `${API_BASE_URL}/subSegment/getBySegmentId/${segId}`
    });

    return result.data;
};

export const findSegmentRequests = async (token: string | null) => {
    const result = await axios({
        method: 'get',
        url: `${API_BASE_URL}/userSegmentRequest/getAll`,
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true
    });

    return result.data;
};

export const getSingleSegmentBySegmentId = async (segmentId: number) => {
    const res = await axios.get<ISegment>(`${API_BASE_URL}/segment/getBySegmentId/${segmentId}`);
    return res.data;
};

export const getSingleSubSegmentBySubSegmentId = async (SubSegmentId: number | undefined) => {
    const res = await axios.get<ISubSegment>(`${API_BASE_URL}/segment/getBySubSegmentId/${SubSegmentId}`);
    return res.data;
};

export const getUserReachSegmentsByUserId = async (userId: string | undefined, token: string | null) => {
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/reach/getUserSegments`,
        data: {userId: userId},
        headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*',},
        withCredentials: true,
    });
    return res.data;
};

export const getSegmentAgggregateInfo = async (segmentId: number) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/segment/aggregateInfo/${segmentId}`,
    });
    return res.data;
};

export const getSegmentUsersInfo = async (segmentId: number) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/segment/usersInfo/${segmentId}`,
    });
    return res.data;
};

export const getSegmentByName = async (segmentName: string) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/segment/getByName/${segmentName}`,
    });
    return res.data;
};

export const deleteSegmentBySegmentId = async (segId: number, token: string) => {
    try {
        const res = await axios({
            method: 'delete',
            url: `${API_BASE_URL}/segment/delete/${segId}`,
            headers: { 'x-auth-token': token, 'Access-Control-Allow-Origin': '*', },
            withCredentials: true
        });
        
        if (res.status !== 200 && res.status !== 204) {
            throw new Error('Error deleting the segment');
        }
        
        return res.data;
    } catch (error) {
        console.error('Failed to delete the segment:', error);
        throw error;
    }
};