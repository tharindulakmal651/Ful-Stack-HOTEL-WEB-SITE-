import React, { useState, useRef } from 'react';
import axios from '../axiosConfig';
import './ImageUploader.css';

/**
 * ImageUploader — reusable image upload component
 *
 * Props:
 *   uploadUrl    {string}   — API endpoint  e.g. '/api/upload/room/5'
 *   deleteUrl    {string}   — API endpoint  e.g. '/api/upload/room/5/image'
 *   existingImages {array}  — current image URL(s)
 *   multiple     {boolean}  — allow multiple files (default false)
 *   maxFiles     {number}   — max number of images (default 1)
 *   onSuccess    {function} — called with updated images array after upload/delete
 *   label        {string}   — label text (default 'Upload Image')
 */
const ImageUploader = ({
  uploadUrl,
  deleteUrl,
  existingImages = [],
  multiple = false,
  maxFiles = 1,
  onSuccess,
  label = 'Upload Image',
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [preview,   setPreview]   = useState([]);
  const inputRef = useRef();

  const images = Array.isArray(existingImages)
    ? existingImages.filter(Boolean)
    : (existingImages ? [existingImages] : []);

  const canUploadMore = images.length < maxFiles;

  // Preview selected files before uploading
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPreview(files.map(f => URL.createObjectURL(f)));
  };

  // Upload selected files
  const handleUpload = async () => {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) {
      setError('Please select an image first.');
      return;
    }

    const remaining = maxFiles - images.length;
    if (files.length > remaining) {
      setError(`You can only upload ${remaining} more image(s). Max ${maxFiles} total.`);
      return;
    }

    setUploading(true); setError(''); setSuccess('');
    const formData = new FormData();
    const fieldName = multiple ? 'images' : 'image';
    Array.from(files).forEach(file => formData.append(fieldName, file));

    try {
      const res = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(res.data.message || 'Uploaded!');
      setPreview([]);
      if (inputRef.current) inputRef.current.value = '';
      const updated = res.data.images || (res.data.image_url ? [res.data.image_url] : []);
      if (onSuccess) onSuccess(updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Delete an image
  const handleDelete = async (imageUrl) => {
    if (!window.confirm('Delete this image?')) return;
    setDeleting(imageUrl); setError(''); setSuccess('');
    try {
      const res = await axios.delete(deleteUrl, { data: { imageUrl } });
      setSuccess('Image deleted.');
      const updated = res.data.images || [];
      if (onSuccess) onSuccess(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(null); }
  };

  // Full URL helper — images served from backend port 5000
  const fullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="img-uploader">
      <label className="uploader-label">{label}</label>

      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="uploader-grid">
          {images.map((url, i) => (
            <div className="uploader-thumb" key={i}>
              <img
                src={fullUrl(url)}
                alt={`Image ${i + 1}`}
                onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                className="thumb-delete"
                onClick={() => handleDelete(url)}
                disabled={deleting === url}
                title="Delete image"
              >
                {deleting === url ? '⏳' : '✕'}
              </button>
              {i === 0 && <span className="thumb-badge">Main</span>}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canUploadMore && (
        <div className="uploader-area">
          <div
            className="drop-zone"
            onClick={() => inputRef.current?.click()}
          >
            {preview.length > 0 ? (
              <div className="preview-row">
                {preview.map((src, i) => (
                  <img key={i} src={src} alt="preview" className="preview-thumb" />
                ))}
              </div>
            ) : (
              <>
                <div className="drop-icon">📁</div>
                <p className="drop-text">Click to select {multiple ? 'images' : 'an image'}</p>
                <p className="drop-hint">
                  JPG, PNG, WebP — max 5MB each
                  {maxFiles > 1 && ` · ${images.length}/${maxFiles} uploaded`}
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={multiple}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {preview.length > 0 && (
            <div className="uploader-actions">
              <button
                type="button"
                className="btn-upload"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading...' : `⬆️ Upload ${preview.length} image(s)`}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setPreview([]);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {!canUploadMore && (
        <p className="uploader-limit-msg">
          ✅ Maximum {maxFiles} image(s) uploaded. Delete one to add another.
        </p>
      )}

      {error   && <p className="uploader-error">❌ {error}</p>}
      {success && <p className="uploader-success">✅ {success}</p>}
    </div>
  );
};

export default ImageUploader;
