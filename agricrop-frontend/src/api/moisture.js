import client from './client';

/**
 * Predict soil moisture based on environmental parameters.
 *
 * @param {Object} data
 * @param {number} data.temperature - Ambient temperature in °C.
 * @param {number} data.humidity    - Relative humidity percentage.
 * @param {number} data.rainfall    - Rainfall in mm.
 * @param {number} data.windSpeed   - Wind speed in km/h.
 * @param {string} data.soilType    - Type of soil (e.g. 'Sandy', 'Clay').
 * @returns {Promise<import('axios').AxiosResponse>} Moisture prediction result.
 */
export const predictMoisture = (data) =>
  client.post('/moisture/predict', data);

/**
 * Fetch all moisture prediction reports for the authenticated user.
 *
 * @returns {Promise<import('axios').AxiosResponse>} List of moisture reports.
 */
export const getMoistureReports = () => client.get('/moisture/reports');
