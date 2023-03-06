import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";

// get all users from false flagging behavior table
export const getAllFalseFlaggingUsers = async () => {
    const res = await axios.get(`${API_BASE_URL}/falseFlaggingBehavior/getAll`);
    return res.data;
}

export const checkFalseFlaggingBehavior = async () => {
    console.log("checkFalseFlaggingBehavior")
    const res = await axios.get(`${API_BASE_URL}/falseFlaggingBehavior/checkFalseFlaggingBehavior`);
    return res.data;
}