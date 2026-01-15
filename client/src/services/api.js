import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = '/api';
const COOKIE_NAME = '60min-session';

export const getStoredSession = () => {
    const session = Cookies.get(COOKIE_NAME);
    return session ? JSON.parse(session) : null;
};

export const clearStoredSession = () => {
    Cookies.remove(COOKIE_NAME);
};

export const loginUser = async (username, token) => {
    const response = await axios.post(`${API_URL}/login`, { username, token });
    if (response.data.success) {
        // Save session securely (in a real app, use httpOnly cookies, but for this: client-side cookie)
        // Store minimal data needed to restore state
        const sessionData = {
            username: response.data.username,
            isAdmin: response.data.isAdmin,
            token: token
        };
        Cookies.set(COOKIE_NAME, JSON.stringify(sessionData), { expires: 365 }); // 1 year expiry
        return { ...response.data, token }; // return token too for state
    }
    return response.data;
};

export const logoutUser = () => {
    clearStoredSession();
};

export const getEntries = async () => {
    const response = await axios.get(`${API_URL}/entries`);
    return response.data;
};

export const saveEntry = async (entryData) => {
    const response = await axios.post(`${API_URL}/entries`, entryData);
    return response.data;
};

export const createNewUser = async (data) => {

    const response = await axios.post(`${API_URL}/users`, data);

    return response.data;

};



export const getAllUsers = async () => {

    const response = await axios.get(`${API_URL}/users`);

    return response.data;

};
