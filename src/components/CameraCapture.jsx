// src/components/CameraCapture.jsx

import React, { useRef } from 'react';

export default function CameraCapture({ imageStr, onImageCapture }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageCapture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass-card">
      <div className="image-preview-container" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
        {imageStr ? (
          <img src={imageStr} alt="Captured product" className="image-preview" />
        ) : (
          <div className="placeholder-text">
            <div className="placeholder-icon">📸</div>
            <h3>Tap to take a photo</h3>
            <p>Or upload an existing image</p>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      {!imageStr && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => fileInputRef.current.click()}>
            Open Camera / Gallery
          </button>
        </div>
      )}
    </div>
  );
}
