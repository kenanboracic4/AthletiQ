import { api } from "./api";

export const getNotifications = async () => {
    try {
        const response = await api.get(`/notifications/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUnreadCount = async () => {
    try {
        const response = await api.get(`/notifications/unread-count`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const markAllAsRead = async () => {
    try {
        const response = await api.patch(`/notifications/mark-all-read`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const markOneAsRead = async (notificationId) => {
    try {
        const response = await api.patch(`/notifications/${notificationId}/mark-read`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createNotification = async (data) => {
    try {
        const response = await api.post(`/notifications/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};