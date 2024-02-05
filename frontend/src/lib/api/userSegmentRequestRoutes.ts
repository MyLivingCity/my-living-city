import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';
import { IUserSegmentRequest } from '../types/input/register.input';
export const postUserSegmentRequest = async (requestData: IUserSegmentRequest[], token:string) => {
    let request1 = null;
    let request2 = null;
    let request3 = null;
    if(requestData[0]){
        request1 = await axios({
            method: 'post',
            url: `${API_BASE_URL}/userSegmentRequest/create`,
            data: requestData[0],
            headers: {'Access-Control-Allow-Origin': '*', 'x-auth-token': token},
            withCredentials: true
        })
    }if(requestData[1]){
        request2 = await axios({
            method: 'post',
            url: `${API_BASE_URL}/userSegmentRequest/create`,
            data: requestData[1],
            headers: {'Access-Control-Allow-Origin': '*', 'x-auth-token': token},
            withCredentials: true
        })
    }if(requestData[2]){
        request3 = await axios({
            method: 'post',
            url: `${API_BASE_URL}/userSegmentRequest/create`,
            data: requestData[2],
            headers: {'Access-Control-Allow-Origin': '*', 'x-auth-token': token},
            withCredentials: true
        })
    }
    axios.all([request1, request2, request3]).then(axios.spread((...responses)=>{
        
    })).catch(errors => {
        console.log(errors);
    })
    // const res = await axios({
    //     method: "post",
    //     url: `${API_BASE_URL}/userSegmentRequest/create`,
    //     data: requestData,
    //     headers: {"Access-Control-Allow-Origin": "*", "x-auth-token": token},
    //     withCredentials: true
    // })
 
    // return res.data;
}
export const deleteUserSegmentById = async (id: string, token: string) => {
    const res = await axios({
        method: 'delete',
        url: `${API_BASE_URL}/userSegmentRequest/deleteById/${id}`,
        headers: {'Access-Control-Allow-Origin': '*', 'x-auth-token': token},
        withCredentials: true
    })
    return res.data;
}