import { writable } from 'svelte/store';

const createAuthStore = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    const { subscribe, set, update } = writable({
        user: user ? JSON.parse(user) : null,
        token: token || null,
        refreshToken: refreshToken || null,
        isAuthenticated: !!token
    });

    return {
        subscribe,
        login: (data) => {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            set({
                user: data.user,
                token: data.access,
                refreshToken: data.refresh,
                isAuthenticated: true
            });
        },
        logout: () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false
            });
        },
        updateUser: (userData) => {
            update(state => {
                const newUser = { ...state.user, ...userData };
                localStorage.setItem('user', JSON.stringify(newUser));
                return {
                    ...state,
                    user: newUser
                };
            });
        }
    };
};

export const auth = createAuthStore();
