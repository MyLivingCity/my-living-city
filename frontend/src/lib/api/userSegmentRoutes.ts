import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { ISegment, ISegmentData, ISubSegment, IUserSegment } from '../types/data/segment.type';
import { IRegisterInput } from '../types/input/register.input';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
export interface ISegData {
    segment: ISegment | null;
    subSegment: ISubSegment | null;
}
export const postUserSegmentInfo = async (registerData: IRegisterInput, token: string) => {
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
        headers: { 'Access-Control-Allow-Origin': '*', 'x-auth-token': token },
        withCredentials: true
    });

    return res.data;
};
export const getMyUserSegmentInfo = async (token: string | null, userId: string | null) => {

    const req = await axios.get<IUserSegment>(`${API_BASE_URL}/userSegment/getUserSegment/${userId}`, getAxiosJwtRequestOption(token!));

    return req.data;
};

export const updateUserSegmentInfo = async (segmentInfo: IUserSegment, token: string | null) => {
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/userSegment/update/${segmentInfo.userId}`,
        data: segmentInfo,
        headers: { 'Access-Control-Allow-Origin': '*', 'x-auth-token': token },
        withCredentials: true
    });
    return res.data;
};

export const getUserHomeSegmentInfo = async (token: string | null) => {
    const one = await axios.get(`${API_BASE_URL}/userSegment/homeSegment`, getAxiosJwtRequestOption(token!));
    const two = await axios.get(`${API_BASE_URL}/userSegment/homeSubSegment`, getAxiosJwtRequestOption(token!));
    const segData = axios.all([one, two]).then(axios.spread((...responses) => {
        const segment = responses[0].data;
        const subSegment = responses[1].data;
        return { segment: segment, subSegment: subSegment };
    }));
    return segData;
};
export const getUserWorkSegmentInfo = async (token: string | null) => {
    const one = await axios.get(`${API_BASE_URL}/userSegment/workSegment`, getAxiosJwtRequestOption(token!));
    const two = await axios.get(`${API_BASE_URL}/userSegment/workSubSegment`, getAxiosJwtRequestOption(token!));
    const segData = axios.all([one, two]).then(axios.spread((...responses) => {

        const segment = responses[0].data;
        let subSegment = null;
        if (responses[0].status === 200) {
            subSegment = responses[1].data;
        } else {
            subSegment = null;
        }
        return { segment: segment, subSegment: subSegment };
    }));
    return segData;
};
export const getUserSchoolSegmentInfo = async (token: string | null) => {
    //let response: any[] = new Array();
    const one = await axios.get(`${API_BASE_URL}/userSegment/schoolSegment`, getAxiosJwtRequestOption(token!));
    const two = await axios.get(`${API_BASE_URL}/userSegment/schoolSubSegment`, getAxiosJwtRequestOption(token!));
    const segData = axios.all([one, two]).then(axios.spread((...responses) => {

        const segment = responses[0].data;
        const subSegment = responses[1].data;
        return { segment: segment, subSegment: subSegment };
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
    try {
        // Sort function for segments prioritizing Resident and Segment types
        const sortByType = (a: ISegmentData, b: ISegmentData) => {
            if (a.userType === 'Resident' && a.segType === 'Segment') return -1;
            if (a.userType === 'Resident') return -1;
            if (b.userType === 'Resident') return 1;
            return 0;
        };

        // Make a single API call to our new endpoint
        const response = await axios.get(
            `${API_BASE_URL}/userSegment`,
            getAxiosJwtRequestOption(token!)
        );

        // Transform the response data into the expected format
        const segments = response.data.data.map((userSegment: any) => {
            // Extract segment data
            const segment = userSegment.segment;

            // Determine segment type from relationship or structure
            let segType: 'Super-Segment' | 'Segment' | 'Sub-Segment';
            if (segment.isSubSegment) {
                segType = 'Sub-Segment';
            } else if (segment.isSuperSegment) {
                segType = 'Super-Segment';
            } else {
                segType = 'Segment';
            }

            // Determine user type from the relationship
            const userType = userSegment.userSegmentRelationship === 'HOME'
                ? 'Resident'
                : userSegment.userSegmentRelationship === 'WORK'
                    ? 'Worker'
                    : 'Student';

            // Create the segment data object
            return {
                id: segment.segId,
                name: segment.name,
                segType,
                userType,
                // If super segment info is needed
                superSegId: segment.superSegmentId,
                superSegName: segment.superSegment?.name
            } as ISegmentData;
        });

        // Remove undefined names
        const validSegments = segments.filter((segment: ISegmentData) => segment.name !== undefined);

        // Remove duplicates by name
        const uniqueSegments = validSegments.filter(
            (segment: ISegment, index: number, self: ISegmentData[]) =>
                index === self.findIndex((s: ISegmentData) => s.name === segment.name)
        );

        // Sort and return
        return uniqueSegments.sort(sortByType);
    } catch (error) {
        console.error('Error fetching user segments:', error);
        throw error;
    }
};


export const patchUserSegment = async (userId: string | null, data: any) => {
    if (!userId || !data) {
        return;
    }

    const response = await axios.patch(
        `${API_BASE_URL}/userSegment/${userId}/patch`,
        data
    );

    return response.data;
};