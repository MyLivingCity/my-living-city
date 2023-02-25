import axios, { AxiosResponse } from "axios";
import { API_BASE_URL, USER_TYPES } from "../constants";
import { IUser } from "../types/data/user.type";
import { PublicCommunityBusinessProfile } from "../types/data/publicProfile.type";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";


export const getCommunityBusinessProfile = async (
    userId: string | undefined,
    token: string | null
    ) => {
    const res = await axios({
        method: "get",
        url: `${API_BASE_URL}/publicProfile/communityBusinessProfile/${userId}`,
        headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
            "Access-Control-Allow-Origin": "*",
        },
    });
    
    return res.data;
}

export const updateCommunityBusinessProfile = async (
    publicProfileData: PublicCommunityBusinessProfile,
    token: string | null
) => {
    const res = await axios({
        method: "put",
        url: `${API_BASE_URL}/publicProfile/communityBusinessProfile` + `/${publicProfileData.userId}`,
        data: publicProfileData,
        headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
            "Access-Control-Allow-Origin": "*",
        },
        withCredentials: true
    });
    return res.data;
}
