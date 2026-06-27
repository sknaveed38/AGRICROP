import client from './client';

/**
 * Fetch all fields (farms) belonging to the authenticated user.
 *
 * @returns {Promise<import('axios').AxiosResponse>} List of field documents.
 */
export const getFields = () => client.get('/fields');

/**
 * Create a new field entry.
 *
 * @param {Object} data
 * @param {string} data.name      - Display name for the field.
 * @param {string} data.cropType  - Crop currently planted (e.g. 'Rice').
 * @param {number} data.area      - Field area in acres / hectares.
 * @param {number} data.latitude  - GPS latitude.
 * @param {number} data.longitude - GPS longitude.
 * @param {string} data.soilType  - Soil classification (e.g. 'Loamy').
 * @returns {Promise<import('axios').AxiosResponse>} The created field document.
 */
export const createField = (data) => client.post('/fields', data);

/**
 * Update an existing field.
 *
 * @param {string} id   - The field document ID.
 * @param {Object} data - Partial field data to update.
 * @returns {Promise<import('axios').AxiosResponse>} The updated field document.
 */
export const updateField = (id, data) => client.put(`/fields/${id}`, data);

/**
 * Delete a field by ID.
 *
 * @param {string} id - The field document ID.
 * @returns {Promise<import('axios').AxiosResponse>} Confirmation of deletion.
 */
export const deleteField = (id) => client.delete(`/fields/${id}`);
