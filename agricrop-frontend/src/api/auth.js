import client from './client';

/**
 * Register a new user account.
 *
 * @param {string} fullName - The user's full name.
 * @param {string} email    - The user's email address.
 * @param {string} password - The chosen password.
 * @returns {Promise<import('axios').AxiosResponse>} Server response with token & user data.
 */
export const register = (fullName, email, password) =>
  client.post('/auth/register', { fullName, email, password });

/**
 * Authenticate an existing user.
 *
 * @param {string} email    - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<import('axios').AxiosResponse>} Server response with token & user data.
 */
export const login = (email, password) =>
  client.post('/auth/login', { email, password });

/**
 * Fetch the currently authenticated user's profile.
 *
 * @returns {Promise<import('axios').AxiosResponse>} Server response with user profile.
 */
export const getProfile = () => client.get('/auth/profile');

/**
 * Update the currently authenticated user's profile.
 *
 * @param {Object} profileData - Key/value pairs to update (e.g. fullName, phone, location).
 * @returns {Promise<import('axios').AxiosResponse>} Server response with updated profile.
 */
export const updateProfile = (profileData) =>
  client.put('/auth/profile', profileData);
