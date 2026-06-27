import { useState, useCallback } from 'react';
import { predictMoisture, getMoistureReports } from '../api/moisture';

/**
 * Hook for soil-moisture prediction and report management.
 *
 * @returns {{
 *   result:       Object | null,
 *   reports:      Array,
 *   loading:      boolean,
 *   error:        string | null,
 *   predict:      (data: Object) => Promise<Object>,
 *   fetchReports: () => Promise<void>
 * }}
 */
export const useMoisture = () => {
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Predict soil moisture ────────────────────────────────────────
  const predict = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictMoisture(data);
      const prediction = response.data.prediction || response.data;
      setResult(prediction);
      return prediction;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Moisture prediction failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch all reports ────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMoistureReports();
      setReports(response.data.reports || response.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch moisture reports';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, reports, loading, error, predict, fetchReports };
};
