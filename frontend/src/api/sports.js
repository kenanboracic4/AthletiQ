import { api } from "./api";

export const getSports = async () => {
    try {
        const response = await api.get(`/sports/all`);
        return response.data;
    } catch (error) {
        throw error
    }
}
