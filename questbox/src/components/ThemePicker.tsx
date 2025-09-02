import React, { useState, useEffect, useMemo } from 'react';
import { ThemesConfig, SeasonsConfig, Theme } from '../types';
import { getActiveSeasonTheme } from '../lib/seasonsLoader';

interface ThemePickerProps {
  themes: ThemesConfig;
  seasons: SeasonsConfig;
  onThemeChange: (themeKey: string) => void;
  onOpenThemeCreator: () => void;
}

type ThemeMode = 'manual' | 'auto' | 'seasonal';

const ThemePicker: React.FC<ThemePickerProps> = ({ themes, seasons, onThemeChange, onOpenThemeCreator }) => {
  const [mode, setMode] = useState<ThemeMode>('seasonal');
  const [manualTheme, setManualTheme] = useState<string>('default_dark');
  
  const seasonalTheme = useMemo(() => getActiveSeasonTheme(seasons), [seasons]);

  useEffect(() => {
    let newTheme = 'default_dark';
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
            className="bg-secondary/50 text-text-main text-sm rounded-md p-1 border border-transparent focus:ring-2 focus:ring-accent focus:border-transparent"
        >
            <option value="seasonal">Seasonal</option>
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
        </select>
        {mode === 'manual' && (
           <>
            <select
                value={manualTheme}
                onChange={(e) => setManualTheme(e.target.value)}
                className="bg-secondary/50 text-text-main text-sm rounded-md p-1 border-transparent focus:ring-2 focus:ring-accent focus:border-transparent"
            >
                {/* FIX: Replaced Object.entries with Object.keys to avoid type inference issues where the theme object was being treated as 'unknown'. */}
                {Object.keys(themes).map((key) => (
                    <option key={key} value={key}>{(themes[key] as Theme).name}</option>
                ))}
            </select>
            <button
                onClick={onOpenThemeCreator}
                className="text-sm bg-secondary/80 hover:bg-secondary rounded-md px-2 py-1"
                aria-label="Create new custom theme"
            >
                Create...
            </button>
           </>
        )}
    </div>
  );
};

export default ThemePicker;
