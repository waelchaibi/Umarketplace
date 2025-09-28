export const API_DEVELOPMENT_NO_PRODUCTION = 'http://localhost:5000/api';
export const API_URL = import.meta.env.VITE_API_URL || API_DEVELOPMENT_NO_PRODUCTION;
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
export const IMG_URL = import.meta.env.VITE_IMG_URL || 'http://localhost:5000';
export const ROUTE_PREFIX = import.meta.env.VITE_ROUTE_PREFIX || 'admin';

// Derive socket base by removing trailing /api
export const SOCKET_URL = API_URL.replace(/\/api$/, '');

export const CONFIG = {
	API_URL,
	APP_URL,
	IMG_URL,
	ROUTE_PREFIX,
	SOCKET_URL,
};

export const API_BASE_URL = API_URL;

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  FILE_UPLOAD: '/file/upload',
} as const;

export default CONFIG;
