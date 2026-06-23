import { api } from "./api";

export const handleFollow = async (nickname) => {
    try {

        const response = await api.post(`/follows/create`, { nickname: nickname });
        return response.data;
    } catch (error) {
        throw error
    }
}

export const getFollowersList = async (nickname, limit, cursor = null) => {
    try {
        let url = `/follows/get-followers-list/${nickname}?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }

        const res = await api.get(url);
        console.log(res.data);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const getFollowingList = async (nickname, limit, cursor = null) => {
    try {
        let url = `/follows/get-following-list/${nickname}?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }
        console.log("🔗 URL koji se šalje:", url);
        const res = await api.get(url);
        console.log(res.data);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const searchFollowingUsers = async (searchQuery, nickname) => {
    try {
        const response = await api.get(`/follows/search/${searchQuery}`, {
            params: { nickname }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const searchFollowers = async (searchQuery, nickname) => {
    try {
        const response = await api.get(`/follows/search/followers/${searchQuery}`, {
            params: { nickname }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}