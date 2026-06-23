import { api } from "./api";

const getPositions = async () => {
    try {
        const response = await api.get(`/positions/all`);
        return response.data;
    } catch (error) {
        throw error
    }
}

export const getPositionsByName = async (name) => {
    if (!name) return []
    try {
        const response = await api.get(`/positions/by-name/${name}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

export const getPositionsBySport = async (sportId) => {
    if (!sportId) return []
    try {
        const response = await api.get(`/positions/by-sport-id/${sportId}`);

        return response.data;
    } catch (error) {
        throw error
    }
}