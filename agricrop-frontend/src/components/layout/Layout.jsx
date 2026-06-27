import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

/**
 * Layout - Protected page wrapper containing top Navbar and Sidebar.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50/50 via-gray-50 to-green-50/20 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main layout body */}
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content Container */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
