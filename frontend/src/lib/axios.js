// axios.js
import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,   // 👈 agar cookies bhi bhejni hain to
});
