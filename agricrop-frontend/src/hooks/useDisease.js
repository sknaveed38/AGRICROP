import { useState, useCallback } from 'react';
import { predictDisease, getDiseaseReports } from '../api/disease';

/**
 * Hook for disease prediction and report management.
 *
 * Exposes a separate `uploading` flag so the UI can differentiate
 * between the image-upload prediction request and the lighter report
 * listing request.
 *
 * @returns {{
 *   result:       Object | null,
 *   reports:      Array,
 *   loading:      boolean,
 *   uploading:    boolean,
 *   error:        string | null,
 *   predict:      (imageFile: File, lat?: number, lng?: number) => Promise<Object>,
 *   fetchReports: () => Promise<void>
 * }}
 */
export const useDisease = () => {
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // ── Predict disease from image ───────────────────────────────────
  const predict = useCallback(async (imageFile, lat = null, lng = null, cropType = null, fieldId = null) => {
    try {
      setUploading(true);
      setError(null);
      const response = await predictDisease(imageFile, lat, lng, cropType, fieldId);
      const prediction = response.data.prediction || response.data;
      setResult(prediction);
      return prediction;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Disease prediction failed';
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  // ── Fetch all reports ────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDiseaseReports();
      setReports(response.data.reports || response.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch reports';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, reports, loading, uploading, error, predict, fetchReports };
};
