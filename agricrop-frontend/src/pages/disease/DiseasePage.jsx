import React, { useState, useEffect } from 'react';
import { useDisease } from '../../hooks/useDisease';
import { FiCamera, FiCheckCircle, FiInfo, FiActivity, FiLayers, FiMapPin, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ImageUploader from '../../components/common/ImageUploader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DiseasePage() {
  const { result, reports, uploading, error, predict, fetchReports } = useDisease();
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropType, setCropType] = useState('Rice');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Request browser geolocation to tag scan location automatically
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          toast.success('Location tagged successfully!');
        },
        () => {
          toast.error('Unable to fetch location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please upload an image first.');
      return;
    }

    try {
      // Predict handles files via Form data. We pass parameters
      const latVal = latitude ? parseFloat(latitude) : null;
      const lngVal = longitude ? parseFloat(longitude) : null;
      
      const prediction = await predict(selectedFile, latVal, lngVal);
      if (prediction && prediction.crop_type) {
        setCropType(prediction.crop_type);
      }
      toast.success('Diagnosis completed!');
      // Re-fetch reports list to update history
      fetchReports();
    } catch (err) {
      toast.error(error || 'Disease detection analysis failed.');
    }
  };

  const clearForm = () => {
    setSelectedFile(null);
    setLatitude('');
    setLongitude('');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Crop Disease Detection</h1>
        <p className="text-sm text-gray-500">
          Upload a high-resolution photo of an infected plant leaf to detect and diagnose diseases using our deep learning model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Diagnostic Input Section (left) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Leaf Image Upload</h3>
            <div className="space-y-4">
              <ImageUploader
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onClear={clearForm}
              />

              {/* Form inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Crop Type (Auto-detected)</label>
                  <input
                    type="text"
                    value={cropType}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed font-semibold"
                  />
                </div>

                {/* Location tagging */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">GPS Coordinates (Optional)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-1/2 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-1/2 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="inline-flex items-center text-xs font-bold text-green-700 hover:text-green-800 pt-1"
                  >
                    <FiMapPin className="mr-1" /> Autofill current GPS location
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleAnalyze}
                disabled={!selectedFile || uploading}
                loading={uploading}
                className="w-full py-3"
              >
                Run Diagnostics <FiActivity className="ml-2" />
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Results / Details Panel (right) */}
        <div className="lg:col-span-7 space-y-6">
          {uploading ? (
            <GlassCard className="h-full flex items-center justify-center py-20">
              <LoadingSpinner message="Scanning leaf structure and running MobileNetV2 classification model..." />
            </GlassCard>
          ) : result ? (
            <div className="space-y-6">
              {/* Primary diagnosis results */}
              <GlassCard className="border-l-4 border-l-green-600">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Diagnosis</span>
                    <h2 className="text-2xl font-extrabold text-gray-900">{result.disease_name}</h2>
                  </div>
                  <Badge variant={result.is_healthy ? 'success' : result.severity === 'high' ? 'danger' : 'warning'}>
                    {result.confidence}% Confidence
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                      <FiInfo className="mr-1.5 text-green-600" /> Description
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{result.description}</p>
                  </div>

                  {result.top_predictions && result.top_predictions.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 pb-3">
                      <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                        <FiLayers className="mr-1.5 text-green-600" /> Top Predictions
                      </h4>
                      <div className="space-y-2">
                        {result.top_predictions.map((pred, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">{pred.class_name || pred.disease_name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-green-600 h-full transition-all duration-500" style={{ width: `${pred.confidence}%` }}></div>
                              </div>
                              <span className="font-semibold text-gray-800 w-8 text-right">{pred.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.symptoms && result.symptoms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 flex items-center">
                        <FiCheckCircle className="mr-1.5 text-green-600" /> Symptoms
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1 pl-1">
                        {result.symptoms.map((symptom, idx) => (
                          <li key={idx} className="leading-relaxed">{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Treatment and Prevention Guides */}
              {!result.is_healthy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prevention */}
                  <GlassCard>
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-600" /> Prevention Protocols
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {result.prevention?.map((tip, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2 mt-0.5">•</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  {/* Treatment */}
                  <GlassCard>
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                      <FiActivity className="mr-2 text-red-600" /> Chemical & Bio Treatment
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {result.treatment?.map((treatment, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-0.5">•</span>
                          <span className="leading-relaxed">{treatment}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>
              )}
            </div>
          ) : (
            <GlassCard className="h-full flex flex-col items-center justify-center py-20 text-center text-gray-500 bg-white/40">
              <FiCamera className="w-12 h-12 text-gray-300 mb-3" />
              <h4 className="text-base font-bold text-gray-800 mb-1">Diagnostic Report Pending</h4>
              <p className="text-xs max-w-xs">
                Upload a photo on the left and tap "Run Diagnostics" to display disease classification details.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* History log */}
      <GlassCard>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Historical Scans Log</h3>
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="flex items-center space-x-4 p-4 border border-gray-100 bg-gray-50/30 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                  {report.image_url ? (
                    <img
                      src={report.image_url.startsWith('http') || report.image_url.startsWith('/') ? report.image_url : `http://localhost:5000/${report.image_url}`}
                      alt={report.disease_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiCamera className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{report.disease_name}</h4>
                    <Badge variant={report.disease_name.toLowerCase() === 'healthy' ? 'success' : report.severity === 'high' ? 'danger' : 'warning'}>
                      {report.confidence}% Conf.
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Crop: {report.crop_type || 'Rice'}</p>
                  <div className="flex items-center space-x-3 text-[10px] text-gray-400 mt-1">
                    <span className="flex items-center"><FiCalendar className="mr-1" /> {new Date(report.created_at).toLocaleDateString()}</span>
                    {report.latitude && (
                      <span className="flex items-center"><FiMapPin className="mr-0.5" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No diagnostic reports saved. Upload an image above to populate the scan log.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
