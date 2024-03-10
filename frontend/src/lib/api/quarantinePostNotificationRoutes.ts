import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const dismissQuarantineNotification = async (
    notificationId: number,
    token: string | null,
) => {
    // console.log('notificationId', notificationId);
    // console.log('token', token);
    const response = await axios({
        method: 'PUT',
        url: `${API_BASE_URL}/dashboard/dismiss/${notificationId}`,
        headers: {
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },

        data: { notificationId: notificationId },
        withCredentials: true,
    });
    return response.data;
};