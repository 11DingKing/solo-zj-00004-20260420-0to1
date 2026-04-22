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

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error(`服务器返回了非 JSON 响应 (HTTP ${response.status})，请检查 API 路径是否正确`);
            }

            if (!response.ok) {
                if (typeof data === 'object' && (data.detail || data.error || data.non_field_errors || data.username || data.password)) {
                    let errorMsg = data.detail || data.error;
                    if (data.non_field_errors) {
                        errorMsg = data.non_field_errors[0];
                    }
                    if (data.username) {
                        errorMsg = '用户名: ' + data.username[0];
                    }
                    if (data.password) {
                        errorMsg = '密码: ' + data.password[0];
                    }
                    throw new Error(errorMsg);
                }
                throw new Error(`请求失败 (HTTP ${response.status})`);
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
