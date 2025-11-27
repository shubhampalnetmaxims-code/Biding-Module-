
import React from 'react';
import { SectionCard } from '../SectionCard';
import { FileTextIcon, PlusIcon } from '../icons';

const DocumentRow: React.FC<{ name: string; isRequired: boolean }> = ({ name, isRequired }) => (
  <div className="flex items-center justify-between bg-slate-50/75 p-3 rounded-lg border border-slate-200">
    <div className="flex items-center gap-3">
      <FileTextIcon className="w-5 h-5 text-slate-400" />
      <span className="font-medium text-slate-700">{name}</span>
      {isRequired && <span className="text-xs text-red-600 font-semibold">Required</span>}
    </div>
    <button className="text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md px-4 py-1.5 hover:bg-slate-50 transition-colors">
      Upload
    </button>
  </div>
);

export const DocumentsSection: React.FC = () => {
  const actionButton = (
    <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors">
      <PlusIcon />
      Add Document
    </button>
  );
  
  return (
    <SectionCard title="Documents" action={actionButton}>
      <div className="space-y-3">
        <DocumentRow name="Insurance" isRequired={true} />
        <DocumentRow name="Temporary Food Permit Application" isRequired={true} />
      </div>
    </SectionCard>
  );
};
