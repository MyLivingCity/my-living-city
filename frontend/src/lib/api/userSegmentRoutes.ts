import axios from "axios";
import { API_BASE_URL } from "../constants";
import { IRegisterInput } from "../types/input/register.input";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";

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
        throw new Error("You must provide an email and password to sign up.")
    }

    const res = await axios.post(`${API_BASE_URL}/userSegment/create`, {
        homeSegmentId,
        workSegmentId,
        schoolSegmentId,
        homeSubSegmentId,
        workSubSegmentId,
        schoolSubSegmentId
    }, getAxiosJwtRequestOption(token));
    // const res = await axios({
    //     method: "post",
    //     url: `${API_BASE_URL}/userSegment/create`,
    //     data: { 
    //         homeSegmentId,
    //         workSegmentId,
    //         schoolSegmentId,
    //         homeSubSegmentId,
    //         workSubSegmentId,
    //         schoolSubSegmentId
    //     },getAxiosJwtRequestOption(token),
    // })
    return res.data;
}