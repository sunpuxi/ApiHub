import axios from 'axios';
import type { 
  CreateProjectRequest, 
  CreateApiRequest, 
  QueryProjectRequest, 
  QueryProjectResponse, 
  QueryApiRequest, 
  QueryApiResponse,
  ApiInfoItem 
} from '../types/api';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectApi = {
  create: async (data: CreateProjectRequest) => {
    const response = await apiClient.post('/projects/createProject', data);
    return response.data;
  },
  query: async (params: QueryProjectRequest): Promise<QueryProjectResponse> => {
    const response = await apiClient.get('/projects/query', { params });
    return response.data;
  },
};

export const apiInfoApi = {
  create: async (data: CreateApiRequest) => {
    const response = await apiClient.post('/apis/createApi', data);
    return response.data;
  },
  query: async (params: QueryApiRequest): Promise<QueryApiResponse> => {
    const response = await apiClient.get('/apis/query', { params });
    return response.data;
  },
  getDetail: async (id: number): Promise<ApiInfoItem> => {
    const response = await apiClient.get('/apis/query', { params: { id } });
    return response.data.items[0];
  },
};

