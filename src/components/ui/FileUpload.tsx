import React, { useState, useEffect } from 'react';
import { fileToBase64 } from '../../utils/helpers';
import '../../styles/FileUpload.css';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, value, onChange, error }) => {
  const [preview, setPreview] = useState<string>(value);
  const [uploading, setUploading] = useState(false);

  // Update preview when value prop changes (e.g., when draft is loaded)
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onChange(base64);
    } catch (error) {
      console.error('Error converting file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="file-upload-wrapper">
      <label className="file-upload-label">{label}</label>
      {!preview ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-upload-input"
            disabled={uploading}
          />
          {uploading && <div className="file-upload-loading">Uploading...</div>}
        </>
      ) : (
        <div className="file-upload-status">
          <span className="file-upload-status-text">Photo uploaded</span>
          <button
            type="button"
            onClick={handleRemove}
            className="file-upload-remove-button"
          >
            Remove
          </button>
        </div>
      )}
      {preview && (
        <div className="file-upload-preview">
          <img src={preview} alt="Preview" className="file-upload-image" />
        </div>
      )}
      {error && <span className="file-upload-error-message">{error}</span>}
    </div>
  );
};
