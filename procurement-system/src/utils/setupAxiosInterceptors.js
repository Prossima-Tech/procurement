import axios from 'axios';

const setupAxiosInterceptors = (logout, refreshToken) => {
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const newToken = await refreshToken();
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    return axios(originalRequest);
                } catch (refreshError) {
                    logout();
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;