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
import { InfoIcon, CheckCircleIcon, ClockIcon } from './icons';
import { Booth } from './BoothManagement';
import { useToast } from '../context/ToastContext';

const TABS: Tab[] = [
  'Booth Description',
  'Business Details',
  'Contact & Social',
  'Documents',
  'Terms and Conditions',
  'Invoice/Payment',
  'Bidding Module',
  'My Booths',
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


const BidStatusCard: React.FC<{booth: Booth, status: 'active' | 'lost', amount: number}> = ({booth, status, amount}) => {
    const statusConfig = {
        active: {
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
            icon: <ClockIcon className="w-5 h-5 text-blue-600" />,
            title: 'Active Bid',
            textColor: 'text-blue-800'
        },
        lost: {
            bgColor: 'bg-slate-50',
            borderColor: 'border-slate-400',
            icon: <InfoIcon className="w-5 h-5 text-slate-500" />,
            title: 'Bid Lost',
            textColor: 'text-slate-600'
        },
    }
    const config = statusConfig[status];
    return(
        <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-md`}>
            <div className="flex items-start gap-3">
                {config.icon}
                <div>
                    <p className={`font-bold ${config.textColor}`}>{config.title}: {booth.title} <span className="font-medium">({booth.type})</span></p>
                    <p className={`text-sm ${config.textColor}`}>Your Bid: <span className="font-semibold">${amount.toFixed(2)}</span></p>
                    <p className={`text-sm ${config.textColor} mt-1`}>Buyout method :- <span className="font-semibold">{booth.buyoutMethod}</span></p>
                    {status === 'lost' && <p className="text-sm text-slate-500 mt-1">This booth has been sold to another vendor.</p>}
                </div>
            </div>
        </div>
    )
}

export const VendorView: React.FC<VendorViewProps> = ({ vendorName }) => {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const { booths, userBids, notifications } = useContext(BiddingContext);
  const { addToast } = useToast();
  
  const vendorNotifications = notifications[vendorName] || [];
  const prevNotifications = usePrevious(vendorNotifications);

  useEffect(() => {
    if (prevNotifications && vendorNotifications.length > prevNotifications.length) {
        const newNotification = vendorNotifications[vendorNotifications.length - 1];
        addToast(newNotification.message, 'info');
    }
  }, [vendorNotifications, prevNotifications, addToast]);

  const myActiveBids = Object.keys(userBids[vendorName] || {})
    .map(boothId => booths.find(b => b.id === parseInt(boothId)))
    .filter((booth): booth is Booth => booth !== undefined && booth.status === 'Open');
  const myLostBids = booths.filter(b => b.status === 'Sold' && b.winner !== vendorName && (userBids[vendorName] || {}).hasOwnProperty(b.id));


  return (
    <div className="space-y-6">
      <EventHeader />
      {vendorNotifications.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-md space-y-3" role="alert">
            {vendorNotifications.map((note, index) => (
                <div key={index} className="flex">
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
      
      <TabNavigation tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mt-6">
        {activeTab === 'Booth Description' && <BoothDescriptionSection />}
        {activeTab === 'Business Details' && <BusinessDetailsSection />}
        {activeTab === 'Contact & Social' && <ContactSocialSection />}
        {activeTab === 'Documents' && <DocumentsSection />}
        {activeTab === 'Terms and Conditions' && <TermsAndConditionsSection />}
        {activeTab === 'Invoice/Payment' && <InvoicePaymentSection />}
        {activeTab === 'Bidding Module' && (
          <>
            <BiddingModuleSection vendorName={vendorName} />
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">My Bidding Activity</h3>
              <div className="space-y-4">
                  {myActiveBids.length === 0 && myLostBids.length === 0 && (
                      <p className="text-slate-500 text-sm">You have no active or lost bids. Go to the 'Bidding Module' to start!</p>
                  )}
                  {myActiveBids.map(booth => (
                      <BidStatusCard key={booth.id} booth={booth} status="active" amount={(userBids[vendorName] || {})[booth.id].bidAmount} />
                  ))}
                  {myLostBids.map(booth => (
                      <BidStatusCard key={booth.id} booth={booth} status="lost" amount={(userBids[vendorName] || {})[booth.id].bidAmount} />
                  ))}
              </div>
            </div>
          </>
        )}
         {activeTab === 'My Booths' && <MyBoothsSection vendorName={vendorName} />}
      </div>
    </div>
  );
};