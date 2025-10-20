import React, { useState, useRef, useEffect } from 'react';
import { MdOutlineUploadFile } from 'react-icons/md';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setPreviewUrl(null);
      setLoading(false);
      setResult(null);
      setError('');
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  }, [isOpen]);

  //generate preview when a file is selected
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleAreaClick = () => fileInputRef.current?.click();
  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f && (f.type === 'image/png' || f.type === 'image/jpeg')) {
      setFile(f);
      setError('');
      setResult(null);
    } else {
      setError('Please select a PNG or JPEG image.');
      setFile(null);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await onUpload(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="upload-area" onClick={handleAreaClick}>
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="preview-image" />
          ) : (
            <>
              <MdOutlineUploadFile className="upload-icon" />
              <p className="upload-text">Click or tap to select a file</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {loading && <p>Processing…</p>}
        {error && <p className="error-text">{error}</p>}
        {result && (
          <div className="result-info">
            <p><strong>Type:</strong> {result.clothingType}</p>
            <p><strong>Brand:</strong> {result.brand}</p>
            <p><strong>Color:</strong> {result.color}</p>
          </div>
        )}

        {!loading && !result && (
          <button
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={!file}
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
