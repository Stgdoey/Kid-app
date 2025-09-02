import React from 'react';
import { Progress } from '../types';

interface DataPanelProps {
  onResetProgress: () => void;
  progress: Progress;
}

const DataPanel: React.FC<DataPanelProps> = ({ onResetProgress, progress }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify({ progress }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'questbox_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Import functionality is complex and requires careful validation, omitted for simplicity.
  // A real implementation would use a file input and robust parsing/validation.

  return (
    <div className="bg-primary/40 backdrop-blur-md border border-secondary/50 rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold mb-3">Admin Panel</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          className="w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-secondary/50 hover:bg-secondary/80 hover:scale-105"
        >
          Export My Data
        </button>
        {/* <button className="w-full px-4 py-2 bg-slate-600 rounded-lg font-semibold hover:bg-slate-500 transition-colors">Import Data</button> */}
        <button
          onClick={onResetProgress}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition-all duration-200 hover:scale-105"
        >
          Reset My Progress
        </button>
      </div>
      <p className="text-xs text-text-muted mt-3">Resetting your progress requires your PIN and cannot be undone.</p>
    </div>
  );
};

export default DataPanel;
