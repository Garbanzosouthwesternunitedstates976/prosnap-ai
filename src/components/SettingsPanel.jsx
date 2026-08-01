import React, { useState, useEffect } from 'react';

// Only image-generation models can enhance a photo. Chat models such as
// gpt-4o read an image but reply with text, so they are not offered here.
const PROVIDERS = {
  Google: ['gemini-2.5-flash-image']
};

export default function SettingsPanel({ onClose, onSave }) {
  const [provider, setProvider] = useState('Google');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(PROVIDERS['Google'][0]);

  useEffect(() => {
    const savedProvider = localStorage.getItem('prosnap_provider');
    const savedKey = localStorage.getItem('prosnap_apikey');
    const savedModel = localStorage.getItem('prosnap_model');
    
    // Ignore stale provider/model values that are no longer supported.
    const activeProvider = savedProvider && PROVIDERS[savedProvider] ? savedProvider : 'Google';
    setProvider(activeProvider);
    setModel(
      savedModel && PROVIDERS[activeProvider].includes(savedModel)
        ? savedModel
        : PROVIDERS[activeProvider][0]
    );
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    setModel(PROVIDERS[newProvider][0]);
  };

  const handleSave = () => {
    localStorage.setItem('prosnap_provider', provider);
    localStorage.setItem('prosnap_apikey', apiKey);
    localStorage.setItem('prosnap_model', model);
    onSave({ provider, apiKey, model });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content">
        <h2>⚙️ AI Settings</h2>
        
        <div className="form-group">
          <label>Provider</label>
          <select value={provider} onChange={handleProviderChange} className="form-control">
            {Object.keys(PROVIDERS).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>API Key</label>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            className="form-control"
            placeholder={`Enter your ${provider} API key`}
          />
          <small
            style={{
              display: 'block',
              marginTop: '0.5rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)'
            }}
          >
            Get a free key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              aistudio.google.com/apikey
            </a>
            . It is stored in this browser only and sent directly to Google.
          </small>
        </div>

        <div className="form-group">
          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="form-control">
            {PROVIDERS[provider].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
