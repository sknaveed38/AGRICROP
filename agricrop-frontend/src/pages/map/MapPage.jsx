import React, { useState, useEffect, useCallback } from 'react';
import { getOutbreaks, getHeatmapData } from '../../api/analytics';
import { FiMap, FiLayers, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MapFilters from '../../components/map/MapFilters';
import DiseaseMap from '../../components/map/DiseaseMap';
import HeatmapLayer from '../../components/map/HeatmapLayer';

export default function MapPage() {
  const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'
  const [filters, setFilters] = useState({
    cropType: '',
    diseaseType: '',
    riskLevels: [],
    startDate: '',
    endDate: ''
  });
  const [markers, setMarkers] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outbreakStats, setOutbreakStats] = useState({ total: 0, highRisk: 0 });

  const fetchMapData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch outbreaks for markers
      // Format filters to send to API
      const apiFilters = {
        crop_type: filters.cropType || undefined,
        disease_name: filters.diseaseType || undefined
      };
      
      const outbreaksRes = await getOutbreaks(apiFilters);
      const geojson = outbreaksRes.data.data || outbreaksRes.data;
      
      // Parse GeoJSON features into Leaflet markers format
      const features = geojson.features || [];
      const parsedMarkers = features.map((f) => ({
        id: f.properties.id,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        riskLevel: f.properties.severity, // 'low', 'medium', 'high'
        fieldName: `${f.properties.crop_type} Plot`,
        cropType: f.properties.crop_type,
        disease: f.properties.disease_name,
        confidence: f.properties.confidence
      }));

      // Apply local risk levels filter if selected
      const selectedRisks = filters.riskLevels.map(r => r.toLowerCase());
      const filteredMarkers = selectedRisks.length > 0 
        ? parsedMarkers.filter(m => selectedRisks.includes(m.riskLevel.toLowerCase()))
        : parsedMarkers;

      setMarkers(filteredMarkers);

      // Compute outbreak statistics
      const highRiskCount = filteredMarkers.filter(m => m.riskLevel.toLowerCase() === 'high').length;
      setOutbreakStats({
        total: filteredMarkers.length,
        highRisk: highRiskCount
      });

      // 2. Fetch Heatmap data
      const heatmapRes = await getHeatmapData();
      const points = heatmapRes.data.data || heatmapRes.data || [];
      
      // Convert points array of dicts {"latitude", "longitude", "intensity"} to Leaflet.heat array of [lat, lng, intensity]
      const formattedPoints = points.map((p) => [
        p.latitude,
        p.longitude,
        p.intensity
      ]);
      setHeatmapPoints(formattedPoints);

    } catch (err) {
      toast.error('Failed to load geospatial map datasets.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const handleResetFilters = () => {
    setFilters({
      cropType: '',
      diseaseType: '',
      riskLevels: [],
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Geospatial Intelligence Network</h1>
          <p className="text-sm text-gray-500">
            Monitor real-time agricultural outbreaks and crop stress patterns using interactive marker maps and density heatmaps.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-1 shadow-sm w-fit self-start sm:self-center">
          <button
            onClick={() => setViewMode('markers')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'markers' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-600 hover:text-green-700'
            }`}
          >
            Outbreak Markers
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'heatmap' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-600 hover:text-green-700'
            }`}
          >
            Density Heatmap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3">
          <MapFilters
            filters={filters}
            onFilterChange={setFilters}
            onApply={fetchMapData}
            onReset={handleResetFilters}
          />
        </div>

        {/* Map Workspace */}
        <div className="lg:col-span-9 relative min-h-[500px]">
          {loading ? (
            <GlassCard className="h-full min-h-[500px] flex items-center justify-center">
              <LoadingSpinner message="Querying geospatial databases and loading OpenStreetMap overlays..." />
            </GlassCard>
          ) : (
            <>
              {/* Map Render */}
              <div className="h-full min-h-[500px]">
                <DiseaseMap markers={viewMode === 'markers' ? markers : []}>
                  {viewMode === 'heatmap' && <HeatmapLayer points={heatmapPoints} />}
                </DiseaseMap>
              </div>

              {/* Statistics Overlay Card */}
              <div className="absolute bottom-4 left-4 z-[10] bg-white/90 backdrop-blur rounded-xl border border-gray-100 shadow-xl p-4 max-w-xs space-y-3">
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Outbreak Summary</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-6 text-sm text-gray-700">
                    <span className="flex items-center"><FiCheckCircle className="mr-1.5 text-green-600" /> Total Outbreaks</span>
                    <span className="font-extrabold">{outbreakStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span className="flex items-center"><FiAlertTriangle className="mr-1.5 text-red-500" /> Critical/High Risk</span>
                    <span className="font-extrabold text-red-600">{outbreakStats.highRisk}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
