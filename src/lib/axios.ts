import axios from "axios"
import { toast } from "sonner"

const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,

})

api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || "Request failed"
        if (typeof window !== "undefined" && status === 401) {
            localStorage.removeItem("user");
            toast.error("Session expired. Please log in again.")
            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }
        return Promise.reject(new Error(message));
    }
)

export default api
