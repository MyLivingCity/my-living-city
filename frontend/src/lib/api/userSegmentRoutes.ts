import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { ISegment, ISegmentData, ISubSegment } from '../types/data/segment.type';
import { IRegisterInput } from '../types/input/register.input';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
export interface ISegData {
    segment: ISegment | null;
    subSegment: ISubSegment | null;
}
export const postUserSegmentInfo = async (registerData: IRegisterInput, token:string) => {
    const { 
        homeSegmentId,
        workSegmentId,
        schoolSegmentId,
        homeSubSegmentId,
        workSubSegmentId,
        schoolSubSegmentId,
    } = registerData;
    // Verify Payload
    if (!homeSegmentId) {
        throw new Error('You must have at least home segment to sign up!');
    }
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/userSegment/create`,
        data: { 
            homeSegmentId,
            workSegmentId,
            schoolSegmentId,
            homeSubSegmentId,
            workSubSegmentId,
            schoolSubSegmentId
        },
        headers: {'Access-Control-Allow-Origin': '*', 'x-auth-token': token},
        withCredentials: true
    });
  
    return res.data;
};
export const getMyUserSegmentInfo = async (token: string | null, userId: string | null) => {
  
    const req = await axios.get(`${API_BASE_URL}/userSegment/getUserSegment/${userId}`,getAxiosJwtRequestOption(token!));
    
    return req.data;
};

export const getUserHomeSegmentInfo = async (token: string | null) => {
    const one = await axios.get(`${API_BASE_URL}/userSegment/homeSegment`,getAxiosJwtRequestOption(token!));
    const two = await axios.get(`${API_BASE_URL}/userSegment/homeSubSegment`,getAxiosJwtRequestOption(token!));
    const segData = axios.all([one, two]).then(axios.spread((...responses)=>{
        const segment = responses[0].data;
        const subSegment = responses[1].data;
        return {segment: segment, subSegment: subSegment};
    }));
    return segData;
};
export const getUserWorkSegmentInfo = async (token: string | null) => {
    const one = await axios.get(`${API_BASE_URL}/userSegment/workSegment`,getAxiosJwtRequestOption(token!));
    const two = await axios.get(`${API_BASE_URL}/userSegment/workSubSegment`,getAxiosJwtRequestOption(token!));
    const segData = axios.all([one, two]).then(axios.spread((...responses)=>{
       
        const segment = responses[0].data;
        let subSegment = null;
        if(responses[0].status === 200){
            subSegment = responses[1].data;
        }else{
            subSegment = null;
        }
        return {segment: segment, subSegment: subSegment};
    }));
    return segData;
};
export const getUserSchoolSegmentInfo = async (token: string | null) => {
    //let response: any[] = new Array();
    const one = await axios.get(`${API_BASE_URL}/userSegment/schoolSegment`,getAxiosJwtRequestOption(token!));
    const two = await axios.get(`${API_BASE_URL}/userSegment/schoolSubSegment`,getAxiosJwtRequestOption(token!));
    const segData = axios.all([one, two]).then(axios.spread((...responses)=>{
 
        const segment = responses[0].data;
        const subSegment = responses[1].data;
        return {segment: segment, subSegment: subSegment};
    }));
    return segData;
};

// export const getAllUserSegInfo = async (token: string | null) => {
//     const one = await axios.get(`${API_BASE_URL}/userSegment/homeSegment`,getAxiosJwtRequestOption(token!));
//     const two = await axios.get(`${API_BASE_URL}/userSegment/homeSubSegment`,getAxiosJwtRequestOption(token!));
//     const three = await axios.get(`${API_BASE_URL}/userSegment/workSegment`,getAxiosJwtRequestOption(token!));
//     const four = await axios.get(`${API_BASE_URL}/userSegment/workSubSegment`,getAxiosJwtRequestOption(token!));
//     const five = await axios.get(`${API_BASE_URL}/userSegment/schoolSegment`,getAxiosJwtRequestOption(token!));
//     const six = await axios.get(`${API_BASE_URL}/userSegment/schoolSubSegment`,getAxiosJwtRequestOption(token!));
//     // const res1 = getUserHomeSegmentInfo(token);
//     // const res2 = getUserWorkSegmentInfo(token);
//     // const res3 = getUserSchoolSegmentInfo(token);
//     const segData = axios.all([one, two, three, four, five, six]).then(axios.spread((...responses)=>{

//         const output = {} as any;
//         const homeSeg = responses[0].data;
//         const homeSub = responses[1].data;
//         const workSeg = responses[2].data;
//         const workSub = responses[3].data;
//         const schoolSeg = responses[4].data;
//         const schoolSub = responses[5].data;

//         output.resident.segments = homeSeg;
//         output.resident.subSegments = homeSub;
//         if()
//         return {resident: home, worker: work, student: school};
//     }))
//     return segData
// }
export const getMyUserSegmentInfoRefined = async (token: string | null, userId: string | null) => {
    const sortByType = (a: ISegmentData) => {
        if(a.userType === 'Resident' && a.segType === 'Segment') return -1;
        if (a.userType === 'Resident') return -1;
        else return 1;
    };
    const one = await axios.get(`${API_BASE_URL}/userSegment/homeSegment`,getAxiosJwtRequestOption(token!));
    const two = await axios.get(`${API_BASE_URL}/userSegment/homeSubSegment`,getAxiosJwtRequestOption(token!));
    const three = await axios.get(`${API_BASE_URL}/userSegment/workSegment`,getAxiosJwtRequestOption(token!));
    const four = await axios.get(`${API_BASE_URL}/userSegment/workSubSegment`,getAxiosJwtRequestOption(token!));
    const five = await axios.get(`${API_BASE_URL}/userSegment/schoolSegment`,getAxiosJwtRequestOption(token!));
    const six = await axios.get(`${API_BASE_URL}/userSegment/schoolSubSegment`,getAxiosJwtRequestOption(token!));
    const originalData = await axios.all([one, two, three, four, five, six]).then(axios.spread((...res)=>{
        console.log(res);
        let homeSuper: ISegmentData = {id: res[0].data.superSegId, name: res[0].data.superSegName, segType:'Super-Segment', userType: 'Resident'};
        let homeSeg: ISegmentData = {id: res[0].data.segId, name: res[0].data.name, segType: 'Segment', userType: 'Resident'};
        let homeSub: ISegmentData = {id: res[1].data.id, name: res[1].data.name, segType: 'Sub-Segment', userType: 'Resident'};
        let workSuper: ISegmentData = {id: res[2].data.superSegId, name: res[2].data.superSegName, segType:'Super-Segment', userType: 'Worker'};
        let workSeg: ISegmentData = {id: res[2].data.segId, name: res[2].data.name, segType: 'Segment', userType: 'Worker'};
        let workSub: ISegmentData = {id: res[3].data.id, name: res[3].data.name, segType: 'Sub-Segment', userType: 'Worker'};
        let schoolSuper: ISegmentData = {id: res[4].data.superSegId, name: res[4].data.superSegName, segType:'Super-Segment', userType: 'Student'};
        let schoolSeg: ISegmentData = {id: res[4].data.segId, name: res[4].data.name, segType: 'Segment', userType: 'Student'};
        let schoolSub: ISegmentData = {id: res[5].data.id, name: res[5].data.name, segType: 'Sub-Segment', userType: 'Student'};
        return [workSuper, workSeg, workSub, schoolSuper, schoolSeg, schoolSub, homeSeg, homeSuper, homeSub,  ];
    }));
    let removeUndefined = originalData.filter(({name}) => name !== undefined);
    let names = removeUndefined.map(o=>o.name);
    let filteredData = removeUndefined.filter(({name}, index)=> (!names.includes(name, index+1)));
    return filteredData.sort(sortByType);
};