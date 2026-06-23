import { api } from "./api";

export const sendFriendRequest = async (nickname) => {
    try {
        const response = await api.post(`/friend-requests/send`, { nickname });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const acceptFriendRequest = async (nickname) => {
    try {
        const response = await api.post(`/friend-requests/accept`, { nickname });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const declineFriendRequest = async (nickname) => {
    try {
        const response = await api.post(`/friend-requests/decline`, { nickname });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const cancelFriendRequest = async (nickname) => {
    try {
        const response = await api.post(`/friend-requests/cancel`, { nickname });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeFriend = async (nickname) => {
    try {
        const response = await api.post(`/friend-requests/remove`, { nickname });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getIncomingFriendRequests = async () => {
    try {
        const response = await api.get(`/friend-requests/incoming`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
