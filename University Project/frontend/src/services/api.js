import axios from 'axios';

const API_BASE_URL = 'http://localhost:6000/api';

export const getProducts = (limit = 50, line = null) => {
  const params = { limit };
  if (line) params.line = line;
  return axios.get(`${API_BASE_URL}/production`, { params })
    .then(res => res.data)
    .catch(error => {
      throw error;
    });
};

export const getDefects = () => {
  return axios.get(`${API_BASE_URL}/defects`)
    .then(res => res.data)
    .catch(error => {
      throw error;
    });
};

export const getProductionStats = () => {
  return axios.get(`${API_BASE_URL}/production/stats`)
    .then(res => res.data)
    .catch(error => {
      throw error;
    });
};

export const resolveDefect = (id) => {
  return axios.put(`${API_BASE_URL}/defects/${id}/resolve`)
    .then(res => res.data)
    .catch(error => {
      throw error;
    });
};

export const inspectProduct = (image, lineId) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('lineId', lineId);
  return axios.post(`${API_BASE_URL}/ai/inspect`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(res => res.data)
  .catch(error => {
    throw error;
  });
};