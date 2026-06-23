import axios from 'axios';

let _accessToken = null;

export const setAccessToken = (token) => {
    _accessToken = token;
};

export const getAccessToken = () => _accessToken;

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(

    (config) => {

        if (_accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${_accessToken}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) return Promise.reject(error);

        const requestUrl = originalRequest.url || '';

        if (requestUrl.includes('/auth/refresh') ||
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/me/session')) {
            return Promise.reject(error);
        }
        if ((error.response?.status === 401 || error.response?.status === 410) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await api.post('/auth/refresh', {});

                const newAccessToken = response.data.access_token;

                setAccessToken(newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                setAccessToken(null);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);