import client from './client';

/**
 * Upload a crop leaf image for disease prediction.
 *
 * The image is sent as multipart/form-data.  Optional GPS coordinates
 * allow the backend to geo-tag the report.
 *
 * @param {File}            imageFile - The leaf image file to analyse.
 * @param {number|null}     latitude  - Optional latitude of the capture location.
 * @param {number|null}     longitude - Optional longitude of the capture location.
 * @returns {Promise<import('axios').AxiosResponse>} Prediction result with disease info.
 */
export const predictDisease = (imageFile, latitude = null, longitude = null, cropType = null, fieldId = null) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  if (latitude !== null && latitude !== undefined) {
    formData.append('latitude', latitude);
  }
  if (longitude !== null && longitude !== undefined) {
    formData.append('longitude', longitude);
  }
  if (cropType) {
    formData.append('crop_type', cropType);
  }
  if (fieldId) {
    formData.append('field_id', fieldId);
  }

  return client.post('/disease/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Fetch all disease prediction reports for the authenticated user.
 *
 * @returns {Promise<import('axios').AxiosResponse>} List of disease reports.
 */
export const getDiseaseReports = () => client.get('/disease/reports');

/**
 * Fetch a single disease prediction report by its ID.
 *
 * @param {string} id - The report document ID.
 * @returns {Promise<import('axios').AxiosResponse>} The requested disease report.
 */
export const getDiseaseReport = (id) => client.get(`/disease/reports/${id}`);
