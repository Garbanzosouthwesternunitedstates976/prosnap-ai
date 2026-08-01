import React, { useState, useEffect } from 'react';
import CameraCapture from './components/CameraCapture';
import AIAssistant from './components/AIAssistant';
import SettingsPanel from './components/SettingsPanel';

const DEFAULT_PROVIDER = 'Google';
const DEFAULT_MODEL = 'gemini-2.5-flash-image';

function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    provider: DEFAULT_PROVIDER,
    apiKey: '',
    model: DEFAULT_MODEL
  });

  useEffect(() => {
    // Only the API key is worth restoring; provider and model are currently fixed,
    // so saved values from older versions are ignored rather than trusted.
    setApiSettings({
      provider: DEFAULT_PROVIDER,
      apiKey: localStorage.getItem('prosnap_apikey') || '',
      model: DEFAULT_MODEL
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
