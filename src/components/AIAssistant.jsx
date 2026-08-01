// src/components/AIAssistant.jsx

import React, { useState } from 'react';
import { enhanceImage } from '../services/ai-service';

// Prompts follow Google's documented guidance for Nano Banana image editing:
//
//  - Narrative description of the finished photograph, not a list of edits.
//  - Positive framing ("seamless white backdrop"), never negation ("no clutter").
//    Negative instructions are documented as unreliable and, in testing here,
//    suppressed the edit entirely.
//  - Real photographic vocabulary — three-point softbox, f/8, 100mm macro —
//    since the model is trained on captions that use these terms.
//  - State what stays the same as a positive fact about the subject.
//
// Refs: cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana
const ENHANCEMENTS = [
  {
    id: 'studio',
    label: '💡 Studio Lighting',
    prompt:
      'A professional commercial product photograph of this exact item, captured in a photography studio with a three-point softbox lighting setup. A large diffused key light sits at 45 degrees to the front-left, creating soft gradient falloff across the surfaces; a lower-power fill light at 45 degrees to the right opens up the shadows while keeping gentle dimensionality; and a rim light behind the product traces a bright edge that separates it from the backdrop. Crisp specular highlights reveal the surface material, and a soft realistic contact shadow grounds the product. Shot on a 100mm macro lens at f/8 for edge-to-edge sharpness. The item keeps its original shape, colour, materials, surface texture, text, logos and proportions, photographed from the same angle — the lighting is what transforms.'
  },
  {
    id: 'background',
    label: '✂️ Clean Background',
    prompt:
      'A professional e-commerce product photograph of this exact item on a seamless pure white studio backdrop, lit separately from the product so the background renders clean and blowout-free. The product sits crisply cut out with accurate, natural edges and a soft contact shadow directly beneath it for grounding. The item keeps its original shape, colour, materials, texture, text, logos and proportions, photographed from the same angle.'
  },
  {
    id: 'quality',
    label: '✨ Enhance Quality',
    prompt:
      'A tack-sharp, high-resolution commercial product photograph of this exact item, captured on a full-frame camera with a 100mm macro lens at f/8. Fine micro-texture and surface detail read clearly across the product, edges are clean and well defined, and the image is free of grain and compression artefacts. Neutral white balance renders the colours accurately, with clean highlights and deep controlled blacks. The composition, camera angle, background and lighting direction match the original photograph exactly, and all text, logos and markings stay precisely as they appear — this is the same shot captured on far better equipment.'
  },
  {
    id: 'hero',
    label: '🏆 Hero Shot',
    prompt:
      'A premium hero product photograph of this exact item for the top of an e-commerce listing. The product sits on a smooth reflective dark surface that fades into a softly graduated backdrop, with a polished mirror reflection beneath it. Dramatic studio lighting sculpts the form: a broad soft key light from the upper left, a subtle blue-toned rim light on the right edge for separation, and controlled specular highlights tracing the contours. Shallow depth of field at f/2.8 keeps the product razor-sharp while the backdrop falls gently out of focus. The item keeps its original shape, colour, materials, texture, text, logos and proportions, photographed from the same angle.'
  }
];

export default function AIAssistant({ imageStr, onReset, apiSettings }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [showingOriginal, setShowingOriginal] = useState(false);

  // The working image: what gets downloaded and what further edits build on.
  const currentImage = enhancedImage || imageStr;
  const hasEnhanced = Boolean(enhancedImage);

  // Press-and-hold the compare button to peek at the original.
  const displayedImage = showingOriginal ? imageStr : currentImage;

  const runEnhancement = async ({ label, prompt }) => {
    setIsProcessing(true);
    setStatusText(`${label.replace(/^\W+\s*/, '')}…`);
    setErrorText('');

    try {
      // Chain enhancements: feed the current result back in, not the original.
      const result = await enhanceImage(currentImage, prompt, apiSettings);
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
    link.href = currentImage;
    link.download = `prosnap-${hasEnhanced ? 'enhanced' : 'original'}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRevert = () => {
    setEnhancedImage(null);
    setShowingOriginal(false);
    setErrorText('');
  };

  if (!imageStr) return null;

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Enhance for E-commerce</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {hasEnhanced
          ? 'Hold the compare button to see the original. Apply another enhancement to refine it further.'
          : 'Choose an enhancement to apply to your photo.'}
      </p>

      <div className="image-preview-container" style={{ cursor: 'default' }}>
        <img src={displayedImage} alt={hasEnhanced ? 'Enhanced product' : 'Product'} className="image-preview" />

        {hasEnhanced && !isProcessing && (
          <>
            <span
              style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: showingOriginal ? 'rgba(71, 85, 105, 0.9)' : 'rgba(139, 92, 246, 0.9)'
              }}
            >
              {showingOriginal ? 'Original' : 'Enhanced'}
            </span>

            {/* Hold to compare. Pointer events cover mouse and touch; the blur and
                mouse-leave handlers stop it sticking if the press ends off-button. */}
            <button
              type="button"
              className="btn"
              onPointerDown={() => setShowingOriginal(true)}
              onPointerUp={() => setShowingOriginal(false)}
              onPointerCancel={() => setShowingOriginal(false)}
              onMouseLeave={() => setShowingOriginal(false)}
              onBlur={() => setShowingOriginal(false)}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                right: '0.75rem',
                padding: '0.4rem 0.9rem',
                fontSize: '0.85rem',
                touchAction: 'none',
                userSelect: 'none'
              }}
            >
              👁️ Hold to compare
            </button>
          </>
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
