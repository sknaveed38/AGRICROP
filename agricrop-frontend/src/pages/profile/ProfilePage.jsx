import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats } from '../../api/analytics';
import { FiUser, FiMail, FiMapPin, FiGrid, FiActivity, FiLayers, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [farmArea, setFarmArea] = useState(user?.farm_area || '');
  const [cropType, setCropType] = useState(user?.crop_type || 'Rice');
  
  const [stats, setStats] = useState({ totalFarms: 0, totalScans: 0 });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await getDashboardStats();
        const data = res.data.data || res.data;
        setStats({
          totalFarms: data.total_farms || 0,
          totalScans: data.active_diseases || 0
        });
      } catch (err) {
        // Fallback or ignore
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      toast.error('Full name is required.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        full_name: fullName,
        location,
        farm_area: farmArea ? parseFloat(farmArea) : null,
        crop_type: cropType
      };

      await updateProfile(payload);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile information.');
    } finally {
      setLoading(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : 'June 2026';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Farmer Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your personal details, farm size metrics, and default crops settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info card (left) */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="text-center flex flex-col items-center p-8 border-t-4 border-t-green-600">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-md mb-4 border border-green-500/20">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">{user?.full_name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
            
            <div className="flex items-center space-x-1.5 text-xs text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full mt-3 border border-green-100">
              <FiCalendar /> <span>Member since: {memberSince}</span>
            </div>
          </GlassCard>

          {/* User farm metrics summary */}
          <GlassCard>
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">Account Activity</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-700 border-b border-gray-50 pb-2">
                <span className="flex items-center text-gray-500"><FiGrid className="mr-2" /> Registered Plots</span>
                <span className="font-extrabold">{statsLoading ? '...' : stats.totalFarms}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span className="flex items-center text-gray-500"><FiActivity className="mr-2" /> Leaf Diagnoses</span>
                <span className="font-extrabold">{statsLoading ? '...' : stats.totalScans}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Update Form (right) */}
        <div className="lg:col-span-8">
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Profile Settings</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={FiUser}
                  required
                />
                
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FiMail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Location / Region"
                  id="location"
                  type="text"
                  placeholder="e.g. Pune, Maharashtra"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  icon={FiMapPin}
                />
                
                <Input
                  label="Total Farm Area (acres)"
                  id="farmArea"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 10.5"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  icon={FiLayers}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Default Crop Type</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Corn">Corn</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button type="submit" variant="primary" loading={loading}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
