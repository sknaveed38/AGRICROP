import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back to AgriCrop!');
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50/50 via-gray-50 to-green-50/20">
      {/* Left side: Premium Nature Panel (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-green-800 to-emerald-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-700/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center space-x-2 text-green-400 z-10">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-white">SK-Agri<span className="text-green-400">Crop</span></span>
        </div>

        <div className="space-y-6 z-10 max-w-md">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
            <FiCpu className="mr-1.5" /> Edge AI Engine
          </span>
          <h2 className="text-4xl font-extrabold leading-tight">
            Protect your yield with crop intelligence.
          </h2>
          <p className="text-sm text-green-100/70 leading-relaxed">
            Scan leaf diseases in real-time, predict precise soil water depletion, and track regional agricultural outbreaks using our geo-intelligence network.
          </p>
        </div>

        <div className="text-xs text-green-100/40 z-10">
          © 2026 AgriCrop Geospatial Network. All rights reserved by sk.
        </div>
      </div>

      {/* Right side: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900">Sign in to AgriCrop</h2>
            <p className="text-sm text-gray-500">
              Enter your details to access your dashboard and farm plots.
            </p>
          </div>

          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="farmer@agricrop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={FiMail}
                required
              />

              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={FiLock}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2" />
                  Remember me
                </label>
                <a href="#forgot" className="text-green-700 font-bold hover:underline">Forgot password?</a>
              </div>

              <Button type="submit" variant="primary" loading={loading} className="w-full py-3">
                Sign In <FiArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </GlassCard>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-700 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
