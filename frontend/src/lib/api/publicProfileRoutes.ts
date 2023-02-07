import axios, { AxiosResponse } from "axios";
import { API_BASE_URL, USER_TYPES } from "../constants";
import { IUser } from "../types/data/user.type";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";


export const getCommunityBusinessProfile = async (userId: string | undefined) => {
    const res = await axios({
        method: "get",
        url: `${API_BASE_URL}/communityBusinessProfile`,
        data: { userId: userId}
    })
    return res.data;
}

export const updateCommunityBusinessProfile = async (
    userId: string | undefined,
    statement: string | undefined,
    description: string | undefined,
    links: string[] | undefined,
    address: string | undefined,
    contactEmail: string | undefined,
    contactPhone: string | undefined,
) => {
    const res = await axios({
        method: "patch",
        url: `${API_BASE_URL}/communityBusinessProfile`,
        data: {
            statement: statement,
            description: description,
            links: links,
            address: address,
            contactEmail: contactEmail,
            contactPhone: contactPhone,
        }
    })
    return res.data;
}
