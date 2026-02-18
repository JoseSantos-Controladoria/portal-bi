import axios from 'axios';

const api = axios.create({
  baseURL: 'https://datahub.workongroup.com.br/api/v1/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('tradedata_token');

    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;