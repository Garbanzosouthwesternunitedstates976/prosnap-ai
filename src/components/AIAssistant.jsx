import React, { useState } from 'react';
import { enhanceImage } from '../services/ai-service';

const ENHANCEMENTS = [
  {
    id: 'studio',
    label: '💡 Studio Lighting',
    prompt:
      'Relight this product photo as a professional e-commerce studio shot. Use soft, even, diffused lighting with a subtle reflection beneath the product. Remove harsh shadows and colour casts. Keep the product itself — its shape, colour, materials, markings and proportions — exactly as it is. Do not add, remove or restyle any part of the product.'
  },
  {
    id: 'background',
    label: '✂️ Clean Background',
    prompt:
      'Replace the background of this product photo with a seamless, pure white studio backdrop suitable for an e-commerce listing. Keep the product perfectly intact with clean, accurate edges and a soft natural contact shadow. Do not alter the product itself in any way.'
  },
  {
    id: 'quality',
    label: '✨ Enhance Quality',
    prompt:
      'Improve this product photo to professional e-commerce quality. Increase sharpness and detail, reduce noise and compression artefacts, and correct the white balance and exposure. Keep the product, background and composition unchanged — this is a clean-up, not a redesign.'
  }
];

export default function AIAssistant({ imageStr, onReset, apiSettings }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [enhancedImage, setEnhancedImage] = useState(null);

  // The image currently on screen and the one the download button will save.
  const displayedImage = enhancedImage || imageStr;
  const hasEnhanced = Boolean(enhancedImage);

  const runEnhancement = async ({ label, prompt }) => {
    setIsProcessing(true);
    setStatusText(`${label.replace(/^\W+\s*/, '')}…`);
    setErrorText('');

    try {
      // Chain enhancements: feed the current result back in, not the original.
      const result = await enhanceImage(displayedImage, prompt, apiSettings);
      setEnhancedImage(result);
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = displayedImage;
    link.download = `prosnap-${hasEnhanced ? 'enhanced' : 'original'}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRevert = () => {
    setEnhancedImage(null);
    setErrorText('');
  };

  if (!imageStr) return null;

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Enhance for E-commerce</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {hasEnhanced
          ? 'Showing the enhanced image. Apply another enhancement to refine it further.'
          : 'Choose an enhancement to apply to your photo.'}
      </p>

      <div className="image-preview-container" style={{ cursor: 'default' }}>
        <img src={displayedImage} alt={hasEnhanced ? 'Enhanced product' : 'Product'} className="image-preview" />

        {hasEnhanced && !isProcessing && (
          <span
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(139, 92, 246, 0.9)'
            }}
          >
            Enhanced
          </span>
        )}

        {isProcessing && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="status-text">{statusText}</p>
            <p className="status-text" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              This can take up to a minute
            </p>
          </div>
        )}
      </div>

      {errorText && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            whiteSpace: 'pre-wrap'
          }}
        >
          {errorText}
        </div>
      )}

      <div className="ai-controls" style={{ marginTop: '2rem' }}>
        {ENHANCEMENTS.map((enhancement) => (
          <button
            key={enhancement.id}
            className="btn"
            onClick={() => runEnhancement(enhancement)}
            disabled={isProcessing}
          >
            {enhancement.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        <button className="btn btn-primary" onClick={handleDownload} disabled={isProcessing}>
          💾 Download {hasEnhanced ? 'Enhanced' : 'Original'}
        </button>
        {hasEnhanced && (
          <button className="btn" onClick={handleRevert} disabled={isProcessing}>
            ↩️ Revert to Original
          </button>
        )}
        <button className="btn" onClick={onReset} disabled={isProcessing}>
          🔄 New Photo
        </button>
      </div>
    </div>
  );
}
