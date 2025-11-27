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
];

interface VendorViewProps {
    vendorName: string;
}

function usePrevious<T>(value: T): T | undefined {
    // FIX: Explicitly provide `undefined` as the initial value to `useRef`.
    // The error "Expected 1 arguments, but got 0" suggests the overload resolution for `useRef` requires an argument in this environment.
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}


const BidStatusCard: React.FC<{booth: Booth, status: 'winning' | 'active' | 'lost', amount: number}> = ({booth, status, amount}) => {
    const statusConfig = {
        winning: {
            bgColor: 'bg-green-50',
            borderColor: 'border-green-500',
            icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
            title: 'You Won!',
            textColor: 'text-green-800'
        },
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
                    <p className={`font-bold ${config.textColor}`}>{config.title}: {booth.name}</p>
                    <p className={`text-sm ${config.textColor}`}>Your Bid: <span className="font-semibold">${amount.toFixed(2)}</span></p>
                    {status === 'winning' && (
                        <div className="mt-2 text-xs text-amber-900 bg-amber-100 p-2 rounded-md border border-amber-200">
                           <p><strong>Action Required:</strong> Please pay the full amount within 24 hours to secure your spot.</p>
                        </div>
                    )}
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

  const myWinningBids = booths.filter(b => b.status === 'Sold' && b.winner === vendorName);
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
                  {myWinningBids.length === 0 && myActiveBids.length === 0 && myLostBids.length === 0 && (
                      <p className="text-slate-500 text-sm">You haven't placed any bids yet. Go to the 'Bidding Module' to start!</p>
                  )}
                  {myWinningBids.map(booth => (
                      <BidStatusCard key={booth.id} booth={booth} status="winning" amount={(userBids[vendorName] || {})[booth.id].bidAmount} />
                  ))}
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
      </div>
    </div>
  );
};