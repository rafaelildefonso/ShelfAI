import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_URL}/api/files/upload/product`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  return response.data.url;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/files/delete/product`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    data: { imageUrl }
  });
};
