import axios from "axios";
import { error } from "console";
import { config } from "process";

const api = axios.create({
    baseURL: "http://localhost:8080/api/"
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (
        token &&
        config.url !== "/login" &&
        config.url !== "/register"
    ) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api