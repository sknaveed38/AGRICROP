import { useState, useEffect, useCallback } from 'react';
import { getFields, createField, updateField, deleteField } from '../api/fields';

/**
 * Hook that provides full CRUD operations for farm fields.
 *
 * Farms are fetched automatically on mount.  Mutations optimistically
 * update local state after the API call succeeds.
 *
 * @returns {{
 *   farms:      Array,
 *   loading:    boolean,
 *   error:      string | null,
 *   fetchFarms: () => Promise<void>,
 *   addFarm:    (data: Object) => Promise<Object>,
 *   editFarm:   (id: string, data: Object) => Promise<Object>,
 *   removeFarm: (id: string) => Promise<void>
 * }}
 */
export const useFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch all farms ──────────────────────────────────────────────
  const fetchFarms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFields();
      setFarms(response.data.fields || response.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch farms';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create ───────────────────────────────────────────────────────
  const addFarm = useCallback(async (data) => {
    try {
      setError(null);
      const response = await createField(data);
      const newFarm = response.data.field || response.data;
      setFarms((prev) => [...prev, newFarm]);
      return newFarm;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to add farm';
      setError(message);
      throw err;
    }
  }, []);

  // ── Update ───────────────────────────────────────────────────────
  const editFarm = useCallback(async (id, data) => {
    try {
      setError(null);
      const response = await updateField(id, data);
      const updatedFarm = response.data.field || response.data;
      setFarms((prev) =>
        prev.map((f) => (f._id === id ? updatedFarm : f)),
      );
      return updatedFarm;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update farm';
      setError(message);
      throw err;
    }
  }, []);

  // ── Delete ───────────────────────────────────────────────────────
  const removeFarm = useCallback(async (id) => {
    try {
      setError(null);
      await deleteField(id);
      setFarms((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete farm';
      setError(message);
      throw err;
    }
  }, []);

  // ── Auto-fetch on mount ──────────────────────────────────────────
  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  return { farms, loading, error, fetchFarms, addFarm, editFarm, removeFarm };
};
