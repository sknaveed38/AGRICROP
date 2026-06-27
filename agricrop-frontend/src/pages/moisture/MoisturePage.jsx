import React, { useState, useEffect } from 'react';
import { useMoisture } from '../../hooks/useMoisture';
import { useFarms } from '../../hooks/useFarms';
import { FiSliders, FiThermometer, FiDroplet, FiWind, FiCloudRain, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import RiskMeter from '../../components/common/RiskMeter';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MoisturePage() {
  const { result, reports, loading, error, predict, fetchReports } = useMoisture();
  const { farms } = useFarms();
  const [temperature, setTemperature] = useState('28');
  const [humidity, setHumidity] = useState('65');
  const [rainfall, setRainfall] = useState('5');
  const [windSpeed, setWindSpeed] = useState('12');
  const [soilType, setSoilType] = useState('Loamy');
  const [selectedField, setSelectedField] = useState('');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePredict = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        rainfall: parseFloat(rainfall),
        wind_speed: parseFloat(windSpeed),
        soil_type: soilType,
        field_id: selectedField || null
      };

      await predict(payload);
      toast.success('Soil moisture analysis completed!');
      fetchReports();
    } catch (err) {
      toast.error(error || 'Moisture prediction analysis failed.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Soil Moisture Intelligence</h1>
        <p className="text-sm text-gray-500">
          Enter current local climate data and soil characteristics to estimate soil moisture levels, evapotranspiration rates, and water requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input parameters card */}
        <div className="lg:col-span-5">
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FiSliders className="mr-2 text-green-700" /> Climate Parameters
            </h3>
            
            <form onSubmit={handlePredict} className="space-y-4">
              <Input
                label="Temperature (°C)"
                id="temperature"
                type="number"
                step="0.1"
                placeholder="e.g. 28.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                icon={FiThermometer}
                required
              />

              <Input
                label="Humidity (%)"
                id="humidity"
                type="number"
                placeholder="e.g. 60"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                icon={FiDroplet}
                required
              />

              <Input
                label="Rainfall (mm)"
                id="rainfall"
                type="number"
                step="0.1"
                placeholder="e.g. 0.0"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                icon={FiCloudRain}
                required
              />

              <Input
                label="Wind Speed (km/h)"
                id="windSpeed"
                type="number"
                step="0.1"
                placeholder="e.g. 10.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                icon={FiWind}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Soil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Clay">Clay</option>
                    <option value="Silt">Silt</option>
                    <option value="Peaty">Peaty</option>
                    <option value="Chalky">Chalky</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Plot Link (Optional)</label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a farm plot...</option>
                    {farms.map((farm) => (
                      <option key={farm._id} value={farm._id}>{farm.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" variant="primary" loading={loading} className="w-full py-3">
                Calculate Predictions <FiTrendingUp className="ml-2" />
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Prediction Results output */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <GlassCard className="h-full flex items-center justify-center py-20">
              <LoadingSpinner message="Running Random Forest Regressor models and estimating evapotranspiration indices..." />
            </GlassCard>
          ) : result ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Gauge */}
                <RiskMeter value={result.moisture_level} />

                {/* Derived Metrics */}
                <div className="space-y-4">
                  <GlassCard hover className="p-5 border-l-4 border-l-blue-500">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Evaporation Rate</span>
                    <h4 className="text-2xl font-black text-gray-900 mt-1">{result.evaporation_rate} mm/day</h4>
                    <p className="text-xs text-gray-500 mt-1">Estimated depth of water lost to the atmosphere daily.</p>
                  </GlassCard>

                  <GlassCard hover className="p-5 border-l-4 border-l-amber-600">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Irrigation Requirement</span>
                    <h4 className="text-2xl font-black text-gray-900 mt-1">{result.water_requirement} L/acre</h4>
                    <p className="text-xs text-gray-500 mt-1">Water deficit required to restore optimal root moisture (65%).</p>
                  </GlassCard>
                </div>
              </div>

              {/* Recommendations list */}
              {result.recommendations && result.recommendations.length > 0 && (
                <GlassCard className="border-l-4 border-l-green-600">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                    <FiAlertCircle className="mr-2 text-green-700" /> Agronomic Water Recommendations
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2 mt-0.5">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>
          ) : (
            <GlassCard className="h-full flex flex-col items-center justify-center py-20 text-center text-gray-500 bg-white/40">
              <FiDroplet className="w-12 h-12 text-gray-300 mb-3" />
              <h4 className="text-base font-bold text-gray-800 mb-1">Prediction Output Pending</h4>
              <p className="text-xs max-w-xs">
                Fill out the climate and soil parameter form on the left and tap "Calculate Predictions" to view results.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* History log */}
      <GlassCard>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Soil Moisture Predictions History</h3>
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-bold text-xs uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Soil Type</th>
                  <th className="pb-3">Climate (Temp/Hum/Rain)</th>
                  <th className="pb-3 text-right">Predicted Moisture</th>
                  <th className="pb-3 text-right">Water Req.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 font-semibold text-gray-900">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 capitalize">{report.soil_type || 'Loamy'}</td>
                    <td className="py-3">
                      {report.temperature}°C / {report.humidity}% / {report.rainfall}mm
                    </td>
                    <td className="py-3 text-right font-extrabold text-green-700">
                      {report.predicted_moisture}%
                    </td>
                    <td className="py-3 text-right font-bold">
                      {report.recommendations?.[0]?.includes('critically') || report.predicted_moisture < 30 ? (
                        <span className="text-red-600">High Deficit</span>
                      ) : (
                        <span className="text-gray-600">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No historical predictions found. Run moisture scans to populate this history.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
