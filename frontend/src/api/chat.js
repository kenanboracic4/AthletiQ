import { api } from "./api";

export const createChat = async (data) => {
    try {
        const response = await api.post(`/chat/create`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getChatById = async (chatId) => {
    try {
        const response = await api.get(`/chat/by-id/${chatId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getUserChats = async () => {
    try {
        const response = await api.get(`/chat/by-user`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteChat = async (chatId) => {
    try {
        const response = await api.delete(`/chat/delete-chat/${chatId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getChatBetweenUsers = async (secondUserId) => {
    try {
        const response = await api.get(`/chat/by-users/${secondUserId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
