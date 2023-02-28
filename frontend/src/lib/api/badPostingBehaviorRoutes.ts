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



    