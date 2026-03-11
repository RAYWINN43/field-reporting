import { Alert } from 'react-native';
import { Incident, ApiResponse } from '../types';
import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function AxiosPost<T>(url: string, data: any): Promise<T> {
  return apiClient.post<T>(url, data).then((response) => response.data);
}

export const submitIncident = async (data: Incident): Promise<ApiResponse<Incident>> => {
  try {
    const response = await apiClient.post('/posts', data);
    if (response.status === 201) {
      console.log('succès');
      console.log('Données envoyées :', data);
      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error: any) {
    Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la soumission de l\'incident.');
    return {
      success: false,
    };
  }
}


export default apiClient;