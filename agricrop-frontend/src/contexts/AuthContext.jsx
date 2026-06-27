import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null}  user          - Current user object or null.
 * @property {string|null}  token         - JWT string or null.
 * @property {boolean}      loading       - True while the initial token check is in progress.
 * @property {Function}     login         - (email, password) → Promise
 * @property {Function}     register      - (fullName, email, password) → Promise
 * @property {Function}     logout        - () → void
 * @property {Function}     updateProfile - (data) → Promise
 */

const AuthContext = createContext(null);

/**
 * Provides authentication state and helpers to the component tree.
 *
 * On mount the provider checks localStorage for an existing token.
 * If one exists it validates it by fetching the user profile from the
 * API.  Invalid / expired tokens are silently cleared.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ── Bootstrap: validate persisted token on mount ─────────────────
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const response = await authApi.getProfile();
        setUser(response.data.user || response.data);
      } catch {
        // Token is invalid or expired – clean up silently.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return response;
  }, []);

  // ── Register ─────────────────────────────────────────────────────
  const register = useCallback(async (fullName, email, password) => {
    const response = await authApi.register(fullName, email, password);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return response;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── Update profile ───────────────────────────────────────────────
  const updateProfile = useCallback(async (data) => {
    const response = await authApi.updateProfile(data);
    const updatedUser = response.data.user || response.data;

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    return response;
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Convenience hook to consume the AuthContext.
 *
 * @returns {AuthContextValue}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
};

export default AuthContext;
