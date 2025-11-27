
import React from 'react';
import { SectionCard } from '../SectionCard';
import { InfoItem } from '../InfoItem';

export const ContactSocialSection: React.FC = () => {
  return (
    <SectionCard title="Contact & Social">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <InfoItem label="Contact Person" value="Shubham" />
        <InfoItem label="Contact Phone Number" value="+1 (123) 213-2132" />
        <InfoItem label="Contact Email Address" value="shubhampal.netmaxims@gmail.com" />
        <InfoItem label="facebook" value="-" />
        <InfoItem label="twitter" value="-" />
        <InfoItem label="instagram" value="-" />
      </div>
    </SectionCard>
  );
};
