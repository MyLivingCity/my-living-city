import axios from "axios"
import { API_BASE_URL } from "../constants"
import { ISegment, ISubSegment } from "../types/data/segment.type"
export const getAllSegments = async () => {
  const res = await axios.get<ISegment[]>(`${API_BASE_URL}/segment/getall`);
  return res.data;
}
export const getAllSubSegmentsWithId = async (segId: any) => {
  const res = await axios.get<ISubSegment[]>(`${API_BASE_URL}/subSegment/getBySegmentId/${segId}`);
  return res.data;
}
export const createSegment = async (segData: any, token:any) =>{
  const parsedPayload = {...segData};
  console.log(segData);
  console.log(token);
  const res = await axios({
      method: "post",
      url: `${API_BASE_URL}/segment/create`,
      data: parsedPayload,
      headers: { "x-auth-token": token, "Access-Control-Allow-Origin": "*",},
      withCredentials: true
  })
  if(!(res.status===201 || res.status===200)){
      throw new Error(res.data);    
  }
  return res.data;
}
export const createSubSegment = async (segData: any, token:any) =>{
  const parsedPayload = {...segData};
  console.log(segData);
  console.log(token);
  const res = await axios({
      method: "post",
      url: `${API_BASE_URL}/subSegment/create`,
      data: parsedPayload,
      headers: { "x-auth-token": token, "Access-Control-Allow-Origin": "*",},
      withCredentials: true
  })
  if(!(res.status===201 || res.status===200)){
      throw new Error(res.data);    
  }
  return res.data;
}
export const updateSegment = async (segData: any, token:any) =>{
  console.log(segData);
  const{segId}=segData;
  const parsedPayload = {...segData};
  console.log(token);
  const res = await axios({
      method: "post",
      url: `${API_BASE_URL}/segment/update/${segId}`,
      data: parsedPayload,
      headers: { "x-auth-token": token, "Access-Control-Allow-Origin": "*",},
      withCredentials: true
  })
  //if not success, throw error which will stop form reset
  if(!(res.status===201 || res.status===200)){
      throw new Error(res.data);    
  }
  return res.data;
}

export const updateSubSegment = async (segData: any, token:any) =>{
  if(typeof segData.lat === 'string'){
    segData.lat = parseFloat(segData.lat);
  }
  if(typeof segData.lon === 'string'){
    segData.lon = parseFloat(segData.lon);
  }
  const{id}=segData;
  const parsedPayload = {...segData};
  console.log(segData);
  // console.log(token);
  const res = await axios({
      method: "put",
      url: `${API_BASE_URL}/subSegment/update/${id}`,
      data: parsedPayload,
      headers: { "x-auth-token": token, "Access-Control-Allow-Origin": "*",},
      withCredentials: true
  })
  //if not success, throw error which will stop form reset
  if(!(res.status===201 || res.status===200)){
      throw new Error(res.data);    
  }
  return res.data;
}

export const findSegmentByName = async (segName:string,province:string,country:string) => {
  if(!location){
    throw new Error("location is needed");
  }

  const result = await axios({
    method: "get",
    url: `${API_BASE_URL}/segment/getByName`,
    data: {country,province,segName}
  });

  return result.data;
}