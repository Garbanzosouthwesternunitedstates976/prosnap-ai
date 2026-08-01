// src/App.jsx

import React, { useState, useEffect } from 'react';
import CameraCapture from './components/CameraCapture';
import AIAssistant from './components/AIAssistant';
import SettingsPanel from './components/SettingsPanel';

const DEFAULT_PROVIDER = 'Google';
const DEFAULT_MODEL = 'gemini-3.1-flash-image';
const SUPPORTED_MODELS = [
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-2.5-flash-image'
];

function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    provider: DEFAULT_PROVIDER,
    apiKey: '',
    model: DEFAULT_MODEL
  });

  useEffect(() => {
    // Restore the saved model only if it is still one we support, so values
    // left over from older versions fall back instead of failing at call time.
    const savedModel = localStorage.getItem('prosnap_model');

    setApiSettings({
      provider: DEFAULT_PROVIDER,
      apiKey: localStorage.getItem('prosnap_apikey') || '',
      model: SUPPORTED_MODELS.includes(savedModel) ? savedModel : DEFAULT_MODEL
    });
  }, []);

  const handleImageCapture = (imageStr) => {
    setCapturedImage(imageStr);
  };

  const handleReset = () => {
    setCapturedImage(null);
  };

  const handleSaveSettings = (newSettings) => {
    setApiSettings(newSettings);
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>ProSnap AI</h1>
            <p>Professional Product Photography in your Pocket</p>
          </div>
          <button className="btn" onClick={() => setShowSettings(true)} title="AI Settings" style={{ padding: '0.5rem', fontSize: '1.5rem' }}>
            ⚙️
          </button>
        </div>
      </header>

      <main className="main-content">
        {!capturedImage ? (
          <CameraCapture 
            imageStr={capturedImage} 
            onImageCapture={handleImageCapture} 
          />
        ) : (
          <AIAssistant 
            imageStr={capturedImage} 
            onReset={handleReset} 
            apiSettings={apiSettings}
          />
        )}
      </main>

      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)} 
          onSave={handleSaveSettings} 
        />
      )}
    </div>
  );
}

export default App;
