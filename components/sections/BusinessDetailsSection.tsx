
import React from 'react';
import { SectionCard } from '../SectionCard';
import { InfoItem } from '../InfoItem';

export const BusinessDetailsSection: React.FC = () => {
  return (
    <SectionCard title="Business Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <InfoItem label="Business Name" value="Shubham Burger Test" />
        <InfoItem label="Business Alias" value="None" />
        <InfoItem label="Culture Represented" value="NOne" />
        <InfoItem label="Business Address" value="Test" />
        <InfoItem label="Invoice Address" value="Haryana 123456" />
      </div>
    </SectionCard>
  );
};
