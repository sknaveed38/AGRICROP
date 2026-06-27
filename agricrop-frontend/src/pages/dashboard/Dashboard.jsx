import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats } from '../../api/analytics';
import {
  FiGrid,
  FiActivity,
  FiDroplet,
  FiShield,
  FiPlus,
  FiCamera,
  FiSliders,
  FiArrowRight,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import StatCard from '../../components/common/StatCard';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DiseaseChart from '../../components/charts/DiseaseChart';
import MoistureChart from '../../components/charts/MoistureChart';
import WeeklyTrendsChart from '../../components/charts/WeeklyTrendsChart';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        // Since we modified format_response to update with keys or keep inside data:
        // res.data will contain the keys directly or inside res.data.data
        const statsData = res.data.data || res.data;
        setStats(statsData);
      } catch (err) {
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Assembling your farm intelligence..." />;

  const totalFarms = stats?.total_farms || 0;
  const activeDiseases = stats?.active_diseases || 0;
  const avgMoisture = stats?.avg_moisture || 0;
  const highRiskZones = stats?.high_risk_zones || 0;
  const recentReports = stats?.recent_reports || [];
  const recentAlerts = stats?.recent_alerts || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back, {user?.full_name || 'Farmer'}!
          </h1>
          <p className="text-sm text-gray-500">
            Here is your geospatial crop diagnostics and soil moisture summary for today.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/farms"
            className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-semibold rounded-xl transition"
          >
            <FiPlus className="mr-1.5 w-4 h-4" /> Add Farm
          </Link>
          <Link
            to="/moisture"
            className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-semibold rounded-xl transition"
          >
            <FiSliders className="mr-1.5 w-4 h-4" /> Soil Moisture
          </Link>
          <Link
            to="/disease"
            className="inline-flex items-center px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            <FiCamera className="mr-1.5 w-4 h-4" /> New Crop Scan
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FiGrid} label="Total Farms" value={totalFarms} trend={5} color="green" />
        <StatCard icon={FiActivity} label="Active Diseases (30d)" value={activeDiseases} trend={-12} color="orange" />
        <StatCard icon={FiDroplet} label="Average Soil Moisture" value={avgMoisture} suffix="%" trend={2} color="blue" />
        <StatCard icon={FiShield} label="High Risk Plots" value={highRiskZones} trend={0} color="red" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Disease Prevalence</h3>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <DiseaseChart />
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Soil Moisture Level</h3>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <MoistureChart />
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Health Trends</h3>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <WeeklyTrendsChart />
          </div>
        </GlassCard>
      </div>

      {/* Recents Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leaf Scans */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent AI Leaf Scans</h3>
            <Link to="/disease" className="text-green-700 hover:text-green-800 text-sm font-bold flex items-center">
              View History <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-green-50 overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                      {report.image_url ? (
                        <img
                          src={report.image_url.startsWith('http') || report.image_url.startsWith('/') ? report.image_url : `http://localhost:5000/${report.image_url}`}
                          alt={report.disease_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiCamera className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{report.disease_name}</h4>
                      <p className="text-xs text-gray-500">Crop: {report.crop_type || 'Rice'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={report.disease_name.toLowerCase() === 'healthy' ? 'success' : report.severity === 'high' ? 'danger' : 'warning'}>
                      {report.confidence}% Conf.
                    </Badge>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No scans executed yet. Go to Disease Detection to run your first scan.
              </div>
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
