
import React from 'react';
import { SectionCard } from '../SectionCard';

export const InvoicePaymentSection: React.FC = () => {
  return (
    <SectionCard title="Invoice/Payment">
      <p className="text-slate-500">No invoice has been generated for you at this time.</p>
    </SectionCard>
  );
};
