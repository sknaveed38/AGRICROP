import React, { useState, useEffect } from 'react';
import { useFarms } from '../../hooks/useFarms';
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiSearch, FiMapPin, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function FarmsPage() {
  const { farms, loading, addFarm, editFarm, removeFarm, fetchFarms } = useFarms();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFarmId, setCurrentFarmId] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('Rice');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [soilType, setSoilType] = useState('Loamy');
  const [irrigationType, setIrrigationType] = useState('Drip');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  // Handle browser geolocation to tag coordinates
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          toast.success('Coordinates autofilled successfully!');
        },
        () => {
          toast.error('Unable to fetch coordinates. Please fill manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const resetForm = () => {
    setName('');
    setCropType('Rice');
    setArea('');
    setAreaUnit('acres');
    setSoilType('Loamy');
    setIrrigationType('Drip');
    setLatitude('');
    setLongitude('');
    setAddress('');
    setCurrentFarmId(null);
  };

  const handleOpenEdit = (farm) => {
    setCurrentFarmId(farm._id);
    setName(farm.name || '');
    setCropType(farm.crop_type || 'Rice');
    setArea(farm.area || '');
    setAreaUnit(farm.area_unit || 'acres');
    setSoilType(farm.soil_type || 'Loamy');
    setIrrigationType(farm.irrigation_type || 'Drip');
    
    const coords = farm.location?.coordinates || [];
    setLongitude(coords[0] || '');
    setLatitude(coords[1] || '');
    
    setAddress(farm.address || '');
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name || !area || !latitude || !longitude) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        name,
        crop_type: cropType,
        area: parseFloat(area),
        area_unit: areaUnit,
        soil_type: soilType,
        irrigation_type: irrigationType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address
      };

      await addFarm(payload);
      toast.success('Farm plot registered successfully!');
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to create farm plot.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!name || !area || !latitude || !longitude) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        name,
        crop_type: cropType,
        area: parseFloat(area),
        area_unit: areaUnit,
        soil_type: soilType,
        irrigation_type: irrigationType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address
      };

      await editFarm(currentFarmId, payload);
      toast.success('Farm plot updated successfully!');
      setIsEditModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to update farm plot.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this farm plot?')) {
      try {
        await removeFarm(id);
        toast.success('Farm plot deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete farm plot.');
      }
    }
  };

  // Search filter
  const filteredFarms = farms.filter((farm) => {
    const nameMatch = farm.name?.toLowerCase().includes(search.toLowerCase());
    const cropMatch = farm.crop_type?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || cropMatch;
  });

  if (loading && farms.length === 0) return <LoadingSpinner message="Querying plot databases..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Farm Management</h1>
          <p className="text-sm text-gray-500">
            Map your individual crop plots, manage agricultural attributes, and track crop health index variables.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus className="mr-2" /> Add Plot
        </Button>
      </div>

      {/* Filter and search */}
      <GlassCard className="p-4 flex items-center space-x-3">
        <FiSearch className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by plot name or crop type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none focus:outline-none w-full text-sm text-gray-800 placeholder-gray-400"
        />
      </GlassCard>

      {/* Farms Grid */}
      {filteredFarms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => {
            const healthScore = farm.health_score ?? 100;
            const badgeVariant = healthScore >= 85 ? 'success' : healthScore >= 60 ? 'warning' : 'danger';
            
            return (
              <GlassCard key={farm._id} className="flex flex-col justify-between border-t-4 border-t-green-600">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{farm.name}</h3>
                    <Badge variant={badgeVariant}>Health: {healthScore}%</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crop Type</span>
                      <span className="font-semibold text-gray-800">{farm.crop_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Area</span>
                      <span className="font-semibold text-gray-800">{farm.area} {farm.area_unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Soil/Irrigation</span>
                      <span className="font-semibold text-gray-800">{farm.soil_type} / {farm.irrigation_type}</span>
                    </div>
                    {farm.location?.coordinates && (
                      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="flex items-center"><FiMapPin className="mr-1" /> GPS</span>
                        <span>{farm.location.coordinates[1].toFixed(4)}, {farm.location.coordinates[0].toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(farm)}
                    className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(farm._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FiGrid}
          title="No Farm Plots Registered"
          description="Click Add Plot to map your first farm coordinates and crop parameters."
          actionText="Add First Plot"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Add Farm Plot" size="lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input label="Plot Name" id="name" type="text" placeholder="e.g. North Fields Rice" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Crop Type</label>
              <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Corn">Corn</option>
                <option value="Soybean">Soybean</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <div className="w-2/3">
                <Input label="Area" id="area" type="number" step="0.1" placeholder="e.g. 5.5" value={area} onChange={(e) => setArea(e.target.value)} required />
              </div>
              <div className="w-1/3">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Unit</label>
                <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Soil Type</label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                <option value="Loamy">Loamy</option>
                <option value="Sandy">Sandy</option>
                <option value="Clay">Clay</option>
                <option value="Silt">Silt</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Irrigation Type</label>
              <select value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinklers</option>
                <option value="Flood">Flood/Canal</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Plot Coordinates</label>
            <div className="flex space-x-2">
              <input type="number" step="0.000001" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="w-1/2 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500" required />
              <input type="number" step="0.000001" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="w-1/2 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500" required />
            </div>
            <button type="button" onClick={handleGetLocation} className="inline-flex items-center text-xs font-bold text-green-700 hover:text-green-800 pt-1">
              <FiMapPin className="mr-1" /> Use current GPS coordinates
            </button>
          </div>

          <Input label="Address / Description" id="address" type="text" placeholder="e.g. 2 miles West of village well" value={address} onChange={(e) => setAddress(e.target.value)} />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button type="submit">Create Plot</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} title="Edit Farm Plot" size="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Plot Name" id="edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Crop Type</label>
              <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Corn">Corn</option>
                <option value="Soybean">Soybean</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <div className="w-2/3">
                <Input label="Area" id="edit-area" type="number" step="0.1" value={area} onChange={(e) => setArea(e.target.value)} required />
              </div>
              <div className="w-1/3">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Unit</label>
                <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Soil Type</label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                <option value="Loamy">Loamy</option>
                <option value="Sandy">Sandy</option>
                <option value="Clay">Clay</option>
                <option value="Silt">Silt</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Irrigation Type</label>
              <select value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500">
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinklers</option>
                <option value="Flood">Flood/Canal</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Plot Coordinates</label>
            <div className="flex space-x-2">
              <input type="number" step="0.000001" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="w-1/2 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500" required />
              <input type="number" step="0.000001" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="w-1/2 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500" required />
            </div>
            <button type="button" onClick={handleGetLocation} className="inline-flex items-center text-xs font-bold text-green-700 hover:text-green-800 pt-1">
              <FiMapPin className="mr-1" /> Use current GPS coordinates
            </button>
          </div>

          <Input label="Address / Description" id="edit-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
