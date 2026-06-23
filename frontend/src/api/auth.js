import axios from "axios";
import { api, setAccessToken } from "./api";

const baseUrl = "http://localhost:8000/auth";

export const registerUser = async (data) => {
    try {
        console.log(data);
        const response = await api.post(`/auth/register`, data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const loginUser = async (data) => {
    try {
        const response = await api.post(`/auth/login`, data);

        return response.data;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const logoutUser = async () => {
    try {

        await api.post('/auth/logout');
    } catch (error) {
        console.error("Greška prilikom brisanja kolačića na backendu:", error);
    } finally {

        setAccessToken(null);
    }
};