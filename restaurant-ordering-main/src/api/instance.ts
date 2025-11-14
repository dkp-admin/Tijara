import axios from 'axios';
import { config } from '../config';
import { useLocationStore } from '../stores/location-store';

export const API_BASE_URL = config.HOST;

export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  config.headers = config.headers || {};

  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const store = useLocationStore.getState();
  console.log('[API] Request interceptor accessed store:', store);

  const isVerifyOtpEndpoint = config.url?.includes('/verify-otp');
  const isCustomerUpdateEndpoint =
    config.url?.includes('/customer/') && config.method?.toLowerCase() === 'patch';
  const isOrderDetailsEndpoint = /^\/ordering\/order\/[a-f0-9]+$/.test(config.url || '');

  if (store.companyRef || store.locationRef) {
    if (config.method?.toLowerCase() === 'get' && !isOrderDetailsEndpoint) {
      config.params = {
        ...config.params,
        ...(!isVerifyOtpEndpoint && store.companyRef && { companyRef: store.companyRef }),
        ...(store.locationRef && { locationRef: store.locationRef }),
      };
      console.log('[API] Added refs to params:', config.params);
    } else if (!isCustomerUpdateEndpoint) {
      const data = config.data || {};
      config.data = {
        ...data,
        ...(!isVerifyOtpEndpoint && store.companyRef && { companyRef: store.companyRef }),
        ...(store.locationRef && { locationRef: store.locationRef }),
      };
      console.log('[API] Added refs to body:', config.data);
    }
  }

  return config;
});

// Add response interceptor for error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    return Promise.reject(error);
  },
);
