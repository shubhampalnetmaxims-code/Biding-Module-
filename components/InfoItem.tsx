
import React from 'react';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-800 mt-1">{value || '-'}</p>
    </div>
  );
};
