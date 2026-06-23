import { api } from "./api";

export const sendMessage = async (data) => {
    try {
        const response = await api.post(`/chat-messages/send`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getMessagesByChat = async (chatId) => {
    try {
        const response = await api.get(`/chat-messages/get-by-chat/${chatId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getMessageById = async (messageId) => {
    try {
        const response = await api.get(`/chat-messages/get-by-id/${messageId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteMessage = async (messageId) => {
    try {
        const response = await api.delete(`/chat-messages/delete/${messageId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const markMessagesAsRead = async (chatId) => {
    try {
        const response = await api.patch(`/chat-messages/mark-as-read/${chatId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};