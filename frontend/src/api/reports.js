import { api } from "./api";

export const createReport = async (data) => {
    try {
        const response = await api.post("/reports/create", data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
