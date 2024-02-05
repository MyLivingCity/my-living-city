import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';
import { IBanUserInput} from '../types/input/banUser.input';
import { IBanPostInput } from '../types/input/banPost.input';
import { IBanCommentInput } from '../types/input/banComment.input';
import { IBanUser } from '../types/data/banUser.type';

export const postCreateUserBan = async (
    banData: IBanUserInput,
    token: string | null
) => {
    const jsonBody = JSON.stringify(banData);
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/banUser/create`,
        data: jsonBody,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    //if not success, throw error which will stop form reset
    if (!(res.status == 201 || res.status == 200)) {
        throw new Error(res.data);
    }
    //return response data
    return res.data;
};

export const postCreatePostBan = async (
    banData: IBanPostInput,
    token: string | null
) => {
    const jsonBody = JSON.stringify(banData);
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/banPost/create`,
        data: jsonBody,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    //if not success, throw error which will stop form reset
    if (!(res.status == 201 || res.status == 200)) {
        throw new Error(res.data);
    }
    //return response data
    return res.data;
};


export const postCreateCommentBan = async (
    banData: IBanCommentInput,
    token: string | null
) => {
    const jsonBody = JSON.stringify(banData);
    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/banComment/create`,
        data: jsonBody,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    //if not success, throw error which will stop form reset
    if (!(res.status == 201 || res.status == 200)) {
        throw new Error(res.data);
    }
    //return response data
    return res.data;
};

export const getUndismissedPostBans = async(
    userId: string
) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/banPost/getUndismissedNotification/${userId}`,
    })
    return res.data;
}

export const getUndismissedCommentBans = async(
    userId: string
) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/banComment/getUndismissedNotification/${userId}`,
    })
    return res.data;
}

export const getMostRecentUserBan = async (
    userId: string
) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/banUser/getMostRecent/${userId}`
    })
    return res.data;
}

export const getUserBanWithToken = async (
    token: string | null
) => {
    const res = await axios.get(`${API_BASE_URL}/banUser/getMostRecentWithToken`, getAxiosJwtRequestOption(token!))
    return res.data;
}

export const getPostBan = async (
    postId: number
) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/banPost/getByPostId/${postId}`
    })
    return res.data;
}

export const getCommentBan = async (
    commentId: number
) => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/banComment/getByCommentId/${commentId}`
    })
    return res.data;
}

export const getAllBan = async (): Promise<IBanUser[]> => {
    const res = await axios.get<IBanUser[]>(`${API_BASE_URL}/banUser/getAll`)
    return res.data;
}

export const updateUserBan = async (
    banData: IBanUser,
    token: string | null
) => {
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/banUser/update/${banData.userId}`,
        data: banData,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    return res.data;
}

export const dismissBanPostNotification = async (
    banPostId: number,
    token: string | null
) => {
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/banPost/dismissNotification/${banPostId}`,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    return res.data;
}

export const dismissBanCommentNotification = async (
    banCommentId: number,
    token: string | null
) => {
    const res = await axios({
        method: 'put',
        url: `${API_BASE_URL}/banComment/dismissNotification/${banCommentId}`,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    return res.data;
}

// export const deleteBan = async (
//     userId: string,
//     token: string | null
// ) => {
//     const res = await axios({
//         method: "delete",
//         url: `${API_BASE_URL}/banUser/delete/${userId}`,
//         headers: {
//             "x-auth-token": token,
//             "Access-Control-Allow-Origin": "*",
//         },
//         withCredentials: true
//     })
//     return res.data;
// }

export const deleteExpiredUserBans = async (
    token: string | null
) => {
    const res = await axios({
        method: 'delete',
        url: `${API_BASE_URL}/banUser/deletePassedBanDate`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    return res.data;
}

export const deletePostBan = async (
    banPostId: number,
    token: string | null
) => {
    const res = await axios({
        method: 'delete',
        url: `${API_BASE_URL}/banPost/delete/${banPostId}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    return res.data;
}

export const deleteCommentBan = async (
    banCommentId: number,
    token: string | null
) => {
    const res = await axios({
        method: 'delete',
        url: `${API_BASE_URL}/banComment/delete/${banCommentId}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    return res.data;
}

export const getExpiredUserBans = async () => {
    const res = await axios({
        method: 'get',
        url: `${API_BASE_URL}/banUser/getAllPassedDate`
    });
    return res.data;
}

export const unbanUsersWithExpiredBans = async (token: string | null) => {
    //get all ids of users with expired bans
    const userIdsResponse = await axios({
        method: 'get',
        url: `${API_BASE_URL}/banUser/getAllPassedDate`
    });
  
    //unban all users that have ids returned by expireBans
    await axios({
        method: 'patch',
        url: `${API_BASE_URL}/user/unbanUsers`,
        data: {
            userIds: userIdsResponse.data
        },
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
    //delete all the expired bans
}


export const attemptUnbanUser = async (token: string | null) => {
    await axios({
        method: 'patch',
        url: `${API_BASE_URL}/user/unbanMe`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true
    });
}
