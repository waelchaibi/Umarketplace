import axios from 'axios';
import { API_URL } from './index';

const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		if (status === 401 || status === 403) {
			try { localStorage.removeItem('token'); localStorage.removeItem('role'); } catch {}
			const path = window.location.pathname;
			if (path.startsWith('/admin') && path !== '/admin/login') {
				window.location.replace('/admin/login');
			} else {
				console.log('Auth error in client - continuing without auth');
			}
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;

