import React, { useState } from 'react';
import { ThemeStyle } from '../types';

interface CustomThemeCreatorProps {
  onClose: () => void;
  onSave: (name: string, styles: ThemeStyle) => void;
  existingThemeNames: string[];
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={`color-${label}`} className="text-slate-300">{label}</label>
        <div className="flex items-center gap-2 border border-slate-600 rounded-md p-1">
            <input
                id={`color-${label}`}
                type="color"
                value={value}
                onChange={onChange}
                className="w-8 h-8 p-0 border-none bg-transparent"
            />
            <input 
              type="text"
              value={value}
              onChange={onChange}
              className="bg-slate-700 w-24 text-center rounded-sm"
            />
        </div>
    </div>
);

const CustomThemeCreator: React.FC<CustomThemeCreatorProps> = ({ onClose, onSave, existingThemeNames }) => {
  const [name, setName] = useState('');
  const [styles, setStyles] = useState<ThemeStyle>({
    background: '#020617',
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#0ea5e9',
    text: '#f1f5f9',
    textMuted: '#94a3b8'
  });
  const [error, setError] = useState('');

  const handleStyleChange = (key: keyof ThemeStyle) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyles(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Theme name cannot be empty.');
      return;
    }
    if (existingThemeNames.includes(name.trim())) {
      setError('A theme with this name already exists.');
      return;
    }
    onSave(name.trim(), styles);
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if(e.target === e.currentTarget) {
          onClose();
      }
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-slate-800 text-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-fade-in-up" role="document">
        <h2 className="text-2xl font-bold mb-4">Create Custom Theme</h2>
        
        <div className="space-y-4">
            <div>
              <label htmlFor="themeName" className="block text-sm font-medium text-slate-300 mb-1">Theme Name</label>
              <input
                  id="themeName"
                  type="text"
                  value={name}
                  onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                  }}
                  placeholder="e.g., My Awesome Theme"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            {/* Live Preview Section */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Live Preview</label>
              <div
                style={{ backgroundColor: styles.background, color: styles.text }}
                className="rounded-lg p-4 border border-slate-600 transition-colors"
                aria-hidden="true" // This is a visual-only representation
              >
                <div style={{ backgroundColor: `${styles.primary}66` /* 40% opacity */ }} className="rounded-md p-3 shadow-inner backdrop-blur-sm border" >
                  <h3 className="font-bold text-lg mb-2">Card Title</h3>
                  <div style={{ backgroundColor: `${styles.secondary}80` /* 50% opacity */ }} className="rounded p-2 text-sm">
                    <p style={{color: styles.textMuted}}>A secondary element.</p>
                  </div>
                  <button
                    style={{ backgroundColor: styles.accent }}
                    className="w-full mt-3 px-3 py-1.5 rounded font-semibold"
                    // Assume text on accent is always white for simplicity in preview
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </div>

            <ColorInput label="Background" value={styles.background} onChange={handleStyleChange('background')} />
            <ColorInput label="Primary" value={styles.primary} onChange={handleStyleChange('primary')} />
            <ColorInput label="Secondary" value={styles.secondary} onChange={handleStyleChange('secondary')} />
            <ColorInput label="Accent" value={styles.accent} onChange={handleStyleChange('accent')} />
            <ColorInput label="Text" value={styles.text} onChange={handleStyleChange('text')} />
            <ColorInput label="Muted Text" value={styles.textMuted} onChange={handleStyleChange('textMuted')} />

        </div>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg font-semibold bg-slate-600 hover:bg-slate-500 transition-all duration-200 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-all duration-200 hover:scale-105"
          >
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomThemeCreator;
