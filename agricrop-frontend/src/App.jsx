import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import DiseasePage from './pages/disease/DiseasePage';
import MoisturePage from './pages/moisture/MoisturePage';
import MapPage from './pages/map/MapPage';
import FarmsPage from './pages/farms/FarmsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ProfilePage from './pages/profile/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

const App = () => {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '0.75rem',
            background: '#fff',
            color: '#1B2E1B',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disease"
            element={
              <ProtectedRoute>
                <DiseasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moisture"
            element={
              <ProtectedRoute>
                <MoisturePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farms"
            element={
              <ProtectedRoute>
                <FarmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default App;
