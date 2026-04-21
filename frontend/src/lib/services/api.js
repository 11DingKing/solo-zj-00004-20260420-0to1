import { auth } from '$lib/stores/auth';
import { get } from 'svelte/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.baseURL = API_URL;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = get(auth).token;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    getFormDataHeaders() {
        const headers = {};
        const token = get(auth).token;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: options.isFormData
                ? this.getFormDataHeaders()
                : this.getHeaders()
        };
        delete config.isFormData;

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data, isFormData = false) {
        const options = {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
            isFormData
        };
        return this.request(endpoint, options);
    }

    put(endpoint, data, isFormData = false) {
        const options = {
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data),
            isFormData
        };
        return this.request(endpoint, options);
    }

    patch(endpoint, data, isFormData = false) {
        const options = {
            method: 'PATCH',
            body: isFormData ? data : JSON.stringify(data),
            isFormData
        };
        return this.request(endpoint, options);
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiService();
