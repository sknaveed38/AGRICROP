import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiHome,
  FiActivity,
  FiDroplet,
  FiMap,
  FiGrid,
  FiBarChart2,
  FiBell,
  FiUser,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: FiHome },
    { label: 'Disease Detection', path: '/disease', icon: FiActivity },
    { label: 'Soil Moisture', path: '/moisture', icon: FiDroplet },
    { label: 'Geospatial Map', path: '/map', icon: FiMap },
    { label: 'Farms', path: '/farms', icon: FiGrid },
    { label: 'Analytics', path: '/analytics', icon: FiBarChart2 },
    { label: 'Profile', path: '/profile', icon: FiUser }
  ];

  return (
    <motion.aside
      className="hidden md:flex flex-col bg-white border-r border-gray-100 min-h-screen sticky top-16 z-30"
      animate={{ width: isCollapsed ? '72px' : '240px' }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Navigation Items */}
      <div className="flex-1 py-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                isActive
                  ? 'text-green-700 bg-green-50/70 border-l-4 border-l-green-600'
                  : 'text-gray-500 hover:text-green-700 hover:bg-gray-50/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-gray-100 flex items-center justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-gray-100 transition"
        >
          {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
