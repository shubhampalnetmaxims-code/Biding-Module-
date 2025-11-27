
import React from 'react';
import { SectionCard } from '../SectionCard';
import { InfoItem } from '../InfoItem';

export const TermsAndConditionsSection: React.FC = () => {
  return (
    <SectionCard title="Terms and Condition">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <InfoItem label="Booth Rules" value={<a href="#" className="text-blue-600 hover:underline">View Document</a>} />
        <InfoItem label="Nova Multifest terms" value={<a href="#" className="text-blue-600 hover:underline">View Document</a>} />
      </div>
    </SectionCard>
  );
};
