import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
});

export const analyzeFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const askQuestion = async (file, question) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('question', question);
  const response = await apiClient.post('/ask', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getCharts = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/charts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
