
import React, { useState, useEffect, useMemo } from 'react';
import { ThemesConfig, SeasonsConfig, Theme } from '../types';
import { getActiveSeasonTheme } from '../lib/seasonsLoader';

interface ThemePickerProps {
  themes: ThemesConfig;
  seasons: SeasonsConfig;
  onThemeChange: (themeKey: string) => void;
}

type ThemeMode = 'manual' | 'auto' | 'seasonal';

const ThemePicker: React.FC<ThemePickerProps> = ({ themes, seasons, onThemeChange }) => {
  const [mode, setMode] = useState<ThemeMode>('seasonal');
  const [manualTheme, setManualTheme] = useState<string>('default_light');
  
  const seasonalTheme = useMemo(() => getActiveSeasonTheme(seasons), [seasons]);

  useEffect(() => {
    let newTheme = 'default_light';
    if (mode === 'seasonal') {
      newTheme = seasonalTheme;
    } else if (mode === 'auto') {
      newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'default_dark' : 'default_light';
    } else { // manual
      newTheme = manualTheme;
    }
    onThemeChange(newTheme);
  }, [mode, manualTheme, seasonalTheme, onThemeChange]);
  
  // Effect for auto mode listener
  useEffect(() => {
    if (mode !== 'auto') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        onThemeChange(mediaQuery.matches ? 'default_dark' : 'default_light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, onThemeChange]);


  return (
    <div className="flex items-center space-x-2 mt-1">
        <select 
            value={mode}
            onChange={(e) => setMode(e.target.value as ThemeMode)}
            className="bg-slate-700 text-white text-sm rounded-md p-1 border-transparent focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
            <option value="seasonal">Seasonal</option>
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
        </select>
        {mode === 'manual' && (
            <select
                value={manualTheme}
                onChange={(e) => setManualTheme(e.target.value)}
                className="bg-slate-700 text-white text-sm rounded-md p-1 border-transparent focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
                {Object.entries(themes).map(([key, theme]) => (
                    <option key={key} value={key}>{(theme as Theme).name}</option>
                ))}
            </select>
        )}
    </div>
  );
};

export default ThemePicker;
