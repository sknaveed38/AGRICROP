import client from './client';

// ── Dashboard & Analytics ───────────────────────────────────────────

/**
 * Fetch high-level dashboard statistics (total scans, farms, etc.).
 *
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getDashboardStats = () => client.get('/analytics/dashboard');

/**
 * Fetch disease distribution data for charts.
 *
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getDiseaseDistribution = () =>
  client.get('/analytics/disease-distribution');

/**
 * Fetch historical moisture trend data.
 *
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getMoistureTrends = () =>
  client.get('/analytics/moisture-trends');

/**
 * Fetch overall farm health scores.
 *
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getFarmHealth = () => client.get('/analytics/farm-health');

/**
 * Fetch disease outbreak reports, optionally filtered.
 *
 * @param {Object} [filters={}] - Query parameters (e.g. { disease, severity, startDate, endDate }).
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getOutbreaks = (filters = {}) =>
  client.get('/analytics/outbreaks', { params: filters });

/**
 * Fetch geo-coded data points for the disease heatmap.
 *
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getHeatmapData = () => client.get('/analytics/heatmap');
