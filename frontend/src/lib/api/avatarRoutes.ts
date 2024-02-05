import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const postAvatarImage = async (data: any, token:any) =>{
    const form = new FormData();
    form.append('avatar', data);
    // const res = await axios.post(`${API_BASE_URL}/avatar/image`, form)
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/avatar/image`,
        data: form,
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token},
        withCredentials: true
    })
    //if not success, throw error which will stop form reset
    if(!(res.status===201 || res.status===200)){
        throw new Error(res.data);    
    }
    return res.data;
}