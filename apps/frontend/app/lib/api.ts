/**
 * API client for communicating with the backend
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API client with methods for different endpoints
 */
export const apiClient = {
  // Generic methods for API testing
  get: <T = any>(endpoint: string, headers?: Record<string, string>) => 
    apiFetch<T>(endpoint, { method: 'GET', headers }),
  
  post: <T = any>(endpoint: string, body: any, headers?: Record<string, string>) => 
    apiFetch<T>(endpoint, { method: 'POST', body, headers }),
  
  put: <T = any>(endpoint: string, body: any, headers?: Record<string, string>) => 
    apiFetch<T>(endpoint, { method: 'PUT', body, headers }),
  
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) => 
    apiFetch<T>(endpoint, { method: 'DELETE', headers }),
  
  // Auth endpoints
  auth: {
    login: (credentials: { username: string; password: string }) => 
      apiFetch('/auth/login', { method: 'POST', body: credentials }),
    logout: () => 
      apiFetch('/auth/logout', { method: 'POST' }),
    getProfile: () => 
      apiFetch('/auth/profile'),
  },
  
  // Emulator endpoints
  emulators: {
    list: () => 
      apiFetch('/emulators'),
    getById: (id: string) => 
      apiFetch(`/emulators/${id}`),
    create: (data: any) => 
      apiFetch('/emulators', { method: 'POST', body: data }),
    update: (id: string, data: any) => 
      apiFetch(`/emulators/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => 
      apiFetch(`/emulators/${id}`, { method: 'DELETE' }),
  },
  
  // Actions endpoints
  actions: {
    list: () => 
      apiFetch('/actions'),
    getById: (id: string) => 
      apiFetch(`/actions/${id}`),
    create: (data: any) => 
      apiFetch('/actions', { method: 'POST', body: data }),
    update: (id: string, data: any) => 
      apiFetch(`/actions/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => 
      apiFetch(`/actions/${id}`, { method: 'DELETE' }),
    execute: (id: string, emulatorIds: string[]) => 
      apiFetch(`/actions/${id}/execute`, { method: 'POST', body: { emulatorIds } }),
  },
};
