import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiDroplet, FiMap, FiGrid, FiArrowRight, FiShield, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

export default function LandingPage() {
  const countFarmers = useAnimatedCounter(1240, 2000);
  const countAccuracy = useAnimatedCounter(98, 2000);
  const countScans = useAnimatedCounter(8450, 2000);
  const countFields = useAnimatedCounter(3200, 2000);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-950 to-green-950 text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-2 text-green-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-white">Agri<span className="text-green-400">Crop</span></span>
        </div>
        <div className="flex space-x-4">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">
            Log in
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-4xl mx-auto"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30"
          >
            <FiCpu className="mr-1.5" /> Next-Gen AI AgriTech Platform
          </motion.span>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-green-100 to-emerald-400 bg-clip-text text-transparent leading-none"
          >
            Geospatial Plant Disease & Soil Moisture Intelligence
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-green-100/70 max-w-2xl mx-auto font-medium"
          >
            Empower your farms with real-time deep learning leaf diagnosis, advanced Random Forest soil moisture predictions, and geospatial outbreak tracking. Built for modern digital agronomy.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-900/30 flex items-center justify-center transition-all hover:scale-105"
            >
              Start Free Trial <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold rounded-xl flex items-center justify-center transition-all"
            >
              Explore Features
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-y border-white/10 bg-white/[0.02]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-4xl font-extrabold text-white block mb-1">{countFarmers}+</span>
            <span className="text-xs text-green-400 font-semibold tracking-wider uppercase">Farmers Empowered</span>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-white block mb-1">{countAccuracy}%</span>
            <span className="text-xs text-green-400 font-semibold tracking-wider uppercase">AI Diagnosis Accuracy</span>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-white block mb-1">{countScans}+</span>
            <span className="text-xs text-green-400 font-semibold tracking-wider uppercase">Disease Scans Run</span>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-white block mb-1">{countFields}+</span>
            <span className="text-xs text-green-400 font-semibold tracking-wider uppercase">Hectares Monitored</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Platform Capabilities</h2>
          <p className="text-green-100/60 max-w-xl mx-auto text-sm">
            AgriCrop leverages powerful machine learning models and GIS intelligence to protect and maximize your crop yields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-green-500/40 transition-all group">
            <div className="p-3 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl w-fit mb-4 group-hover:bg-green-500/30 transition-colors">
              <FiActivity className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">Deep Learning Scan</h4>
            <p className="text-sm text-green-100/60 leading-relaxed">
              Upload leaf images to instantly detect fungal, bacterial, or viral infections (e.g. Leaf Blast, Blight) using our fine-tuned MobileNetV2 pipeline.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-green-500/40 transition-all group">
            <div className="p-3 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl w-fit mb-4 group-hover:bg-green-500/30 transition-colors">
              <FiDroplet className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">Soil Moisture Forecast</h4>
            <p className="text-sm text-green-100/60 leading-relaxed">
              Input local humidity, wind speed, rainfall, and temperature to predict exact soil moisture percentage, water requirements, and drought risk.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-green-500/40 transition-all group">
            <div className="p-3 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl w-fit mb-4 group-hover:bg-green-500/30 transition-colors">
              <FiMap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">Geospatial Mapping</h4>
            <p className="text-sm text-green-100/60 leading-relaxed">
              Monitor regional disease outbreaks via Leaflet interactive map overlays and aggregated density heatmaps to predict and contain crop infections.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-green-500/40 transition-all group">
            <div className="p-3 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl w-fit mb-4 group-hover:bg-green-500/30 transition-colors">
              <FiGrid className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">Farm Management</h4>
            <p className="text-sm text-green-100/60 leading-relaxed">
              Map your individual farm plots, log crop types, and track historical health score metrics to optimize chemical usage and harvest schedules.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 text-center text-sm text-green-100/40">
        <p>© 2026 AgriCrop Geospatial Network. All rights reserved.</p>
        <p className="mt-1">Built with advanced AI and geographic information systems to support sustainable farming.</p>
      </footer>
    </div>
  );
}
