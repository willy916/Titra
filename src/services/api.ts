import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

// const API_URL = 'http://127.0.0.1:8083' // Localhost
const API_URL = 'http://192.168.1.3:8083' // Previous Localhost
// const API_URL = 'http://213.199.54.136:8083' // Remote

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., clear token and redirect to login)
            // localStorage.removeItem('accessToken')
            // localStorage.removeItem('refreshToken')
        }
        return Promise.reject(error)
    }
)

export default api
