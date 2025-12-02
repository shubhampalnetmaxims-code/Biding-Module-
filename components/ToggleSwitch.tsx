import React from 'react';

export const ToggleSwitch: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}> = ({ label, description, enabled, onChange }) => {
  return (
    <div
      onClick={onChange}
      className="flex items-center justify-between cursor-pointer p-4 rounded-lg bg-slate-50 border border-slate-200"
    >
      <div className="flex-grow">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out ${
          enabled ? 'bg-pink-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </div>
  );
};