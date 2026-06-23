import { api } from "./api";

export const createApplication = async (data) => {
    try {

        const response = await api.post("/applications/create", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getApplication = async (applicationId) => {
    try {
        const response = await api.get(`/applications/get-application/${applicationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getApplicationsByAdvertisement = async (advertisementId) => {
    try {
        const response = await api.get(`/applications/get-applications-by-advertisement/${advertisementId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteApplication = async (applicationId) => {
    try {
        const response = await api.delete(`/applications/delete-application/${applicationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const acceptApplicationStatus = async (applicationId) => {
    try {
        const response = await api.put(`/applications/accept-application/${applicationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const rejectApplicationStatus = async (applicationId) => {
    try {
        const response = await api.put(`/applications/reject-application/${applicationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyApplications = async () => {
    try {
        const response = await api.get(`/applications/my-applications`);
        return response.data;
    } catch (error) {
        throw error;
    }
};