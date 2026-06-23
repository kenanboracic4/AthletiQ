import { UserRoundIcon } from "lucide-react";
import { api } from "./api";
import { use } from "react";

export const getUserByNickname = async (nickname) => {
    try {
        const response = await api.get(`/user/by-username/${nickname}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const updateUser = async (data, nickname) => {
    try {
        const response = await api.patch(`/user/edit/by-username/${nickname}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const uploadProfileImage = async (formData, nickname) => {
    try {
        const response = await api.post(`/user/upload-image/${nickname}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const uploadCoverImage = async (formData, nickname) => {
    try {
        const response = await api.post(`/user/upload-cover/${nickname}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const searchUsers = async (searchQuery) => {
    try {
        const response = await api.get(`/user/search/${encodeURIComponent(searchQuery)}`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getSuggestedPeople = async (page, limit, randomSort) => {
    try {
        const response = await api.get(`/user/suggested-people?page=${page}&limit=${limit}&random_sort=${randomSort}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getSuggestedClubs = async (page, limit) => {
    try {
        const response = await api.get(`/user/suggested-clubs?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getUserPosts = async (nickname, offset, limit) => {
    try {
        const response = await api.get(`/post/by-user-nickname/${nickname}?offset=${offset}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }

}

export const getRealUser = async (nickname) => {
    try {
        const response = await api.get(`/user/real-user/${nickname}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const updatePrivacy = async (isPrivate) => {
    try {
        const response = await api.patch(`/user/privacy`, { is_private: isPrivate });
        return response.data;
    } catch (error) {
        throw error;
    }
}