import { AxiosRequestConfig } from 'axios';

export const getAxiosJwtRequestOption = (jwtToken: string): AxiosRequestConfig => {
    const options: AxiosRequestConfig = {
        headers: {
            'x-auth-token': jwtToken,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    };

    return options;
};