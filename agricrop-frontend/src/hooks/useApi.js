import { useState, useCallback } from 'react';

/**
 * Generic hook that wraps an API function with reactive loading, error,
 * and data state.
 *
 * @template T
 * @param {(...args: any[]) => Promise<import('axios').AxiosResponse<T>>} apiFunc
 *   The API service function to wrap (e.g. `getFields`).
 *
 * @returns {{
 *   data:    T | null,
 *   loading: boolean,
 *   error:   string | null,
 *   execute: (...args: any[]) => Promise<import('axios').AxiosResponse<T>>,
 *   setData: React.Dispatch<React.SetStateAction<T | null>>
 * }}
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunc(...args);
        setData(response.data);
        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Something went wrong';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc],
  );

  return { data, loading, error, execute, setData };
};
