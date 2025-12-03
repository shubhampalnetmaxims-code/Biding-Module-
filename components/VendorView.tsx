import React, { useState, useContext, useEffect, useRef } from 'react';
import { EventHeader } from './EventHeader';
import { TabNavigation, Tab } from './TabNavigation';
import { ApplicationStatus } from './ApplicationStatus';
import { BoothDescriptionSection } from './sections/BoothDescriptionSection';
import { BusinessDetailsSection } from './sections/BusinessDetailsSection';
import { ContactSocialSection } from './sections/ContactSocialSection';
import { DocumentsSection } from './sections/DocumentsSection';
import { InvoicePaymentSection } from './sections/InvoicePaymentSection';
import { TermsAndConditionsSection } from './sections/TermsAndConditionsSection';
import { BiddingModuleSection } from './sections/BiddingModuleSection';
import { MyBoothsSection } from './sections/MyBoothsSection';
import { BiddingContext } from '../context/BiddingContext';
import { InfoIcon } from './icons';
import { useToast } from '../context/ToastContext';
import { BiddingDashboard } from './BiddingDashboard';
import { VendorBoothDetailPage } from './VendorBoothDetailPage';
import { Booth } from './BoothManagement';

const TABS: Tab[] = [
  'Bidding Dashboard',
  'Bidding Module',
  'My Booths',
  'Booth Description',
  'Business Details',
  'Contact & Social',
  'Documents',
  'Terms and Conditions',
  'Invoice/Payment',
];

interface VendorViewProps {
    vendorName: string;
}

function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export const VendorView: React.FC<VendorViewProps> = ({ vendorName }) => {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const { notifications } = useContext(BiddingContext);
  const { addToast } = useToast();
  const [detailedBooth, setDetailedBooth] = useState<Booth | null>(null);
  
  const vendorNotifications = (notifications[vendorName] || []).filter(n => n.type === 'system');
  const prevNotifications = usePrevious(vendorNotifications);

  useEffect(() => {
    if (prevNotifications && vendorNotifications.length > prevNotifications.length) {
        const newNotification = vendorNotifications[vendorNotifications.length - 1];
        addToast(newNotification.message, 'info');
    }
  }, [vendorNotifications, prevNotifications, addToast]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };
  
  if (detailedBooth) {
      return (
        <VendorBoothDetailPage
          booth={detailedBooth}
          vendorName={vendorName}
          onBack={() => setDetailedBooth(null)}
        />
      )
  }

  return (
    <div className="space-y-6">
      <EventHeader />
      {vendorNotifications.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-md space-y-3" role="alert">
            {vendorNotifications.slice(-3).reverse().map((note, index) => (
                <div key={index} className="flex animate-fade-in">
                    <div className="py-1 flex-shrink-0"><InfoIcon className="h-5 w-5 text-yellow-500 mr-3" /></div>
                    <div>
                        <p className="font-bold">{note.title}</p>
                        <p className="text-sm">{note.message}</p>
                    </div>
                </div>
            ))}
        </div>
      )}

      <ApplicationStatus vendorName={vendorName} />
      
      <TabNavigation tabs={TABS} activeTab={activeTab} setActiveTab={handleTabChange} />
      
      <div className="mt-6">
        {activeTab === 'Bidding Dashboard' && <BiddingDashboard vendorName={vendorName} setActiveTab={handleTabChange} setDetailedBooth={setDetailedBooth} />}
        {activeTab === 'Bidding Module' && <BiddingModuleSection vendorName={vendorName} setDetailedBooth={setDetailedBooth} />}
        {activeTab === 'My Booths' && <MyBoothsSection vendorName={vendorName} />}
        {activeTab === 'Booth Description' && <BoothDescriptionSection />}
        {activeTab === 'Business Details' && <BusinessDetailsSection />}
        {activeTab === 'Contact & Social' && <ContactSocialSection />}
        {activeTab === 'Documents' && <DocumentsSection />}
        {activeTab === 'Terms and Conditions' && <TermsAndConditionsSection />}
        {activeTab === 'Invoice/Payment' && <InvoicePaymentSection />}
      </div>
    </div>
  );
};