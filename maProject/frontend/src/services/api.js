// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // or your Django server address
});

export default API;

// Example helper functions
export const fetchItems = async () => {
  const response = await API.get('/items/');
  return response.data;
};
