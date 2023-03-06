import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";

// create a increment put route for bad post count in the bad posting behaviour table
export const incrementBadPostCount = async (token: String | null, ideaId: string|null) => {
    const res = await axios({
        method: "put",
        url: `${API_BASE_URL}/badPostingBehavior/incrementBadPostCount/${ideaId}`,
        headers: {
        "x-auth-token": token,
        "Access-Control-Allow-Origin": "*",
        },
        data: {ideaId: ideaId},
        withCredentials: true,
    })
    return res.data;
}

export const incrementPostFlagCount = async (token: String | null, ideaId: string|null) => {
    const res = await axios({
        method: "put",
        url: `${API_BASE_URL}/badPostingBehavior/incrementPostFlagCount/${ideaId}`,
        headers: {
        "x-auth-token": token,
        "Access-Control-Allow-Origin": "*",
        },
        data: {ideaId: ideaId},
        withCredentials: true,
    })
    return res.data;
}

export const resetBadPostCount = async (token: String | null, ideaId: string|null) => {
    const res = await axios({
        method: "put",
        url: `${API_BASE_URL}/badPostingBehavior/resetBadPostCount/${ideaId}`,
        headers: {
        "x-auth-token": token,
        "Access-Control-Allow-Origin": "*",
        },
        data: {ideaId: ideaId},
        withCredentials: true,
    })
    return res.data;
}

export const checkUser = async (token: String | null, userId: string|null) => {
    const res = await axios({
        method: "put",
        url: `${API_BASE_URL}/badPostingBehavior/checkUser/${userId}`,
        headers: {
        "x-auth-token": token,
        "Access-Control-Allow-Origin": "*",
        },
        data: {userId: userId},
        withCredentials: true,
    })
    return res.data;
}

export const getBadPostingBehavior = async (
    token: string | null,
) => {
    const res = await axios.get(`${API_BASE_URL}/badPostingBehavior/getBadPostingBehavior`, getAxiosJwtRequestOption(token!));
    return res.data;
}

//update post_comment_ban to true if the threshhold sent to route is met
export const checkThreshhold = async ( token: String | null, userId: string|null, threshhold: number) => {
    const res = await axios({
        method: "put",
        url: `${API_BASE_URL}/badPostingBehavior/checkThreshhold/${threshhold}/${userId}`,
        headers: {
        "x-auth-token": token,
        "Access-Control-Allow-Origin": "*",
        },
        data: {userId: userId, threshhold: threshhold},
        withCredentials: true,
    })
    return res.data;
}