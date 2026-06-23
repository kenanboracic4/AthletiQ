import { api } from "./api";

export const getAdminStats = async () => {
    try {
        const response = await api.get("/admin/stats");
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getAdminUsers = async (page = 1, limit = 20, search = "") => {
    try {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append("search", search);
        const response = await api.get(`/admin/users?${params}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getAdminUser = async (userId) => {
    try {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createAdminUser = async (data) => {
    try {
        const response = await api.post("/admin/users", data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateAdminUser = async (userId, data) => {
    try {
        const response = await api.patch(`/admin/users/${userId}`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteAdminUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getAdminPosts = async (page = 1, limit = 20, search = "") => {
    try {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append("search", search);
        const response = await api.get(`/admin/posts?${params}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteAdminPost = async (postId) => {
    try {
        const response = await api.delete(`/admin/posts/${postId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getAdminAdvertisements = async (page = 1, limit = 20, search = "") => {
    try {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append("search", search);
        const response = await api.get(`/admin/advertisements?${params}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteAdminAdvertisement = async (adId) => {
    try {
        const response = await api.delete(`/admin/advertisements/${adId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getAdminReports = async (status = "", cursor = null, limit = 20) => {
    try {
        const params = new URLSearchParams({ limit });
        if (status) params.append("status", status);
        if (cursor) params.append("cursor", cursor);
        const response = await api.get(`/admin/reports?${params}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateAdminReportStatus = async (reportId, status) => {
    try {
        const response = await api.patch(`/admin/reports/${reportId}`, { status });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteAdminReport = async (reportId) => {
    try {
        const response = await api.delete(`/admin/reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
