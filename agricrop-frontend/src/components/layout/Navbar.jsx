import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiBell, FiMenu, FiX, FiUser, FiLogOut, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Disease Detection', path: '/disease' },
    { label: 'Soil Moisture', path: '/moisture' },
    { label: 'Geospatial Map', path: '/map' },
    { label: 'Farms', path: '/farms' },
    { label: 'Analytics', path: '/analytics' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-green-700">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-gray-900">Agri<span className="text-green-700">Crop</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-1 lg:space-x-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full text-gray-500 hover:text-green-700 hover:bg-gray-50 transition focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      {/* Backdrop for click-away */}
                      <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-40 py-1"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{user.full_name}</p>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          <FiUser className="mr-2" /> My Profile
                        </Link>
                        
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <FiLogOut className="mr-2" /> Log out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 rounded-xl transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-xl transition"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 md:hidden rounded-lg text-gray-500 hover:text-green-700 hover:bg-gray-50 transition"
          >
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-16 bottom-0 w-64 bg-white border-l border-gray-100 shadow-xl z-40 md:hidden p-4 flex flex-col justify-between"
            >
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                        isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {!user && (
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full block text-center px-4 py-2.5 text-sm font-semibold text-green-700 border border-green-200 rounded-xl hover:bg-green-50 transition"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full block text-center px-4 py-2.5 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-xl transition"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
