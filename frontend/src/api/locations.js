import { api } from "./api";

export const getLocations = async () => {
    try {
        const response = await api.get("/locations/all");
        return response.data;
    } catch (error) {
        throw error;
    }
};
