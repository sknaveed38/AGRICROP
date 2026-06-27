import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiTrash2, FiFile } from 'react-icons/fi';
import Button from './Button';

/**
 * ImageUploader - Drag and drop leaf image uploader with preview and file validation.
 */
export default function ImageUploader({ onFileSelect, selectedFile, onClear, maxSizeBytes = 10485760 }) {
  const [preview, setPreview] = useState(selectedFile ? URL.createObjectURL(selectedFile) : null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
      setPreview(URL.createObjectURL(file));
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: maxSizeBytes
  });

  const clearFile = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (onClear) onClear();
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black group max-h-72 flex justify-center items-center">
          <img src={preview} alt="Upload preview" className="object-contain max-h-72 max-w-full" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <Button variant="danger" size="sm" onClick={clearFile}>
              <FiTrash2 className="mr-1.5 w-4 h-4" /> Replace Image
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-green-600 bg-green-50/50'
              : 'border-gray-300 bg-white/50 hover:bg-white/70 hover:border-green-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-4 bg-green-50 rounded-full text-green-700 mb-3">
            <FiUploadCloud className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">
            {isDragActive ? 'Drop your leaf scan here' : 'Drag & drop image of infected crop'}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supports JPG, JPEG, PNG, or WEBP (Max 10MB)
          </p>
          <Button variant="secondary" size="sm">
            Browse files
          </Button>
          
          {fileRejections.length > 0 && (
            <div className="mt-3 text-xs font-semibold text-red-500">
              {fileRejections[0].errors[0].code === 'file-too-large'
                ? 'File is too large. Max 10MB allowed.'
                : 'Invalid file type. Please upload an image.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
