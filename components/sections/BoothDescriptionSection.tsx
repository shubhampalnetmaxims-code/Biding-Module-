
import React from 'react';
import { SectionCard } from '../SectionCard';
import { InfoItem } from '../InfoItem';

export const BoothDescriptionSection: React.FC = () => {
  return (
    <SectionCard title="Booth Description">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <InfoItem label="Booth Count" value="1 Booth" />
        <InfoItem label="Booth Description" value="Test" />
        <InfoItem label="Booth media" value={<a href="#" className="text-blue-600 hover:underline break-all">https://api.multifestns.ca/public/fileUploads/file/1763960857_69243639e7ff0.jpg</a>} />
        <InfoItem label="Additional Circuits Required" value="15" />
        <InfoItem label="Coupon" value="-" />
      </div>
    </SectionCard>
  );
};
