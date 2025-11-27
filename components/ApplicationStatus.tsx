
import React from 'react';

interface ApplicationStatusProps {
  vendorName: string;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ vendorName }) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2 className="text-2xl font-bold text-slate-900">My Application - <span className="text-pink-600">{vendorName}</span></h2>
      <div className="flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        APPROVED
      </div>
      <div className="flex items-center text-sm text-slate-500">
        <span className="mr-2">•</span>
        <span>Applied on: 2025-11-24</span>
      </div>
    </div>
  );
};
