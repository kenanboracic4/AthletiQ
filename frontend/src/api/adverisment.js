import { api } from "./api";

export const createAdvertisment = async (data) => {
    try {

        const response = await api.post("/advertisements/create", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAdvertisment = async (advertisementId) => {
    try {
        const response = await api.get(`/advertisements/get-advertisement/${advertisementId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateAdvertisment = async (advertisementId, data) => {
    try {
        const response = await api.patch(`/advertisements/update-advertisement/${advertisementId}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAdvertisment = async (advertisementId) => {
    try {
        const response = await api.delete(`/advertisements/delete-advertisement/${advertisementId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAdvertismentsByUser = async (userId, { cursor = null } = {}) => {
    try {
        const params = { limit: 10 };
        if (cursor) params.cursor = cursor;
        const response = await api.get(`/advertisements/get-advertisements-by-user/${userId}`, { params });
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRecommendedAdvertisments = async ({ limit = 20 } = {}) => {
    try {
        const response = await api.get(`/advertisements/recommended`, { params: { limit } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyAdvertisments = async () => {
    try {
        const response = await api.get(`/advertisements/my-advertisements`);
        return response.data;
    } catch (error) {
        throw error;
    }
};