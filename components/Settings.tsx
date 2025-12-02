import React, { useContext } from 'react';

export const Settings: React.FC = () => {

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Vendor View Settings</h3>
            <div className="max-w-2xl">
                 <p className="text-slate-500">There are no global settings to configure at this time.</p>
            </div>
        </div>
    </div>
  );
};