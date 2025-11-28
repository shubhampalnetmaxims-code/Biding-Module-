import React, { useState, useContext, useEffect, useRef } from 'react';
import { InfoIcon, ClockIcon, LocationPinIcon, TrendingUpIcon } from '../icons';
import { BiddingContext } from '../../context/BiddingContext';
import { Booth } from '../BoothManagement';
import { ChangeBoothInfoModal } from '../ChangeBoothInfoModal';
import { ErrorModal } from '../ErrorModal';
import { useToast } from '../../context/ToastContext';
import { ConfirmationModal } from '../ConfirmationModal';
import { PaymentModal } from '../PaymentModal';

interface BiddingModuleSectionProps {
    vendorName: string;
}

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}


const RadioButton: React.FC<{ id: string, name: string, value: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ id, name, value, label, checked, onChange }) => (
    <div className="flex items-center">
        <input 
            id={id} 
            name={name} 
            type="radio" 
            value={value}
            checked={checked}
            onChange={onChange}
            className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-slate-400 bg-white"
        />
        <label htmlFor={id} className="ml-3 block font-medium text-slate-700">{label}</label>
    </div>
);

export const BiddingModuleSection: React.FC<BiddingModuleSectionProps> = ({ vendorName }) => {
  const { booths, placeBid, userBids, requestBuyOut } = useContext(BiddingContext);
  const { addToast } = useToast();
  
  const [isTentSelected, setIsTentSelected] = useState(true);
  const [boothCount, setBoothCount] = useState('one');
  const [additionalCircuits, setAdditionalCircuits] = useState('0');
  const [bidInputs, setBidInputs] = useState<{ [key: number]: string }>({});
  const [isChangeBoothModalOpen, setIsChangeBoothModalOpen] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [highlightedBooths, setHighlightedBooths] = useState<Set<number>>(new Set());
  const prevBooths = usePrevious(booths);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [paymentModalState, setPaymentModalState] = useState<{isOpen: boolean, booth: Booth | null}>({isOpen: false, booth: null});
  const [selectedLocation, setSelectedLocation] = useState('All');

  useEffect(() => {
    if (!prevBooths) return;

    const prevBoothsMap: Map<number, Booth> = new Map(prevBooths.map((b: Booth) => [b.id, b]));
    const updatedIds = new Set<number>();

    booths.forEach(booth => {
        const prevBooth = prevBoothsMap.get(booth.id);
        const currentBid = booth.currentBid || 0;
        const prevBid = prevBooth?.currentBid || 0;

        if (prevBooth && currentBid > prevBid) {
            updatedIds.add(booth.id);
        }
    });

    if (updatedIds.size > 0) {
        setHighlightedBooths(updatedIds);
        const timer = setTimeout(() => {
            setHighlightedBooths(new Set());
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [booths, prevBooths]);


  const handleBidChange = (boothId: number, value: string) => {
    setBidInputs(prev => ({ ...prev, [boothId]: value }));
  };

  const handlePlaceBid = (booth: Booth) => {
    const bidValue = parseFloat(bidInputs[booth.id]);
    const numCircuits = parseInt(additionalCircuits, 10) || 0;
    
    if (isNaN(bidValue) || bidInputs[booth.id] === '') {
        setBidError("Please enter a valid bid amount.");
        return;
    }

    const result = placeBid(vendorName, booth.id, bidValue, numCircuits);
    if (result.success) {
      addToast(result.message, 'success');
      handleBidChange(booth.id, '');
    } else {
      setBidError(result.message);
    }
  };
  
  const handleBuyOut = (booth: Booth) => {
    const numCircuits = parseInt(additionalCircuits, 10) || 0;
    const totalPayable = booth.buyOutPrice + (numCircuits * 60);

    if (booth.buyoutMethod === 'Direct pay') {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Direct Buy Out',
            message: `You are about to purchase ${booth.title} for a total of $${totalPayable.toFixed(2)}. Do you want to proceed to payment?`,
            onConfirm: () => {
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                setPaymentModalState({ isOpen: true, booth: booth });
            }
        });
    } else { // Admin approve
        setConfirmModalState({
            isOpen: true,
            title: 'Request Buy Out',
            message: `Are you sure you want to request to buy out ${booth.title} for $${booth.buyOutPrice.toFixed(2)}? An admin will review your request.`,
            onConfirm: () => {
                requestBuyOut(vendorName, booth.id);
                addToast('Buy out request sent to admin for approval.', 'success');
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    }
  };

  const sortedBooths = [...booths].sort((a, b) => {
    const order: { [key in Booth['status']]: number } = { 'Open': 1, 'Closed': 2, 'Sold': 3 };
    return (order[a.status] || 4) - (order[b.status] || 4);
  });
  
  const locations = ['All', ...Array.from(new Set(booths.map(b => b.location)))];
  
  const filteredBooths = sortedBooths.filter(booth =>
    selectedLocation === 'All' || booth.location === selectedLocation
  );

  const vendorBidData = userBids[vendorName] || {};

  const getStatusBadgeClass = (status: Booth['status']) => {
    switch (status) {
        case 'Open': return 'bg-green-100 text-green-800';
        case 'Closed': return 'bg-red-100 text-red-800';
        case 'Sold': return 'bg-slate-200 text-slate-800 font-bold';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Select Booths</h3>
          <div className="flex items-center gap-3">
            <input 
                id="tent-booth"
                type="checkbox" 
                checked={isTentSelected} 
                onChange={(e) => setIsTentSelected(e.target.checked)} 
                className="h-5 w-5 rounded-sm text-pink-600 focus:ring-pink-500 border-slate-400 bg-white"
            />
            <label htmlFor="tent-booth" className="font-medium text-slate-800">10'x10' tent with two 6' tables and four removable walls.</label>
          </div>
        </div>
        <div>
            <p className="font-medium text-slate-800 mb-3">No. of Booth required?*</p>
            <div className="flex items-center gap-8">
                <RadioButton 
                    id="booth-one"
                    name="booth-count"
                    value="one"
                    label="One"
                    checked={boothCount === 'one'}
                    onChange={(e) => setBoothCount(e.target.value)}
                />
                <RadioButton 
                    id="booth-two"
                    name="booth-count"
                    value="two"
                    label="Two"
                    checked={boothCount === 'two'}
                    onChange={(e) => setBoothCount(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-pink-600 mb-4">2. Electrical Circuit:</h3>
        <ol className="list-[lower-alpha] list-outside pl-5 space-y-3 text-slate-700 text-sm mb-6">
            <li><strong>Food</strong> vendors will get one 15Amp circuit that will have two plugins.</li>
            <li>Additional circuits, each providing a 15 Amp service with two plugs, are available at a rate of $120, but if payment is made by <strong>March 31, 2025</strong>, the discounted price is <strong>$60</strong>.</li>
            <li>If you request any additional circuit on the day of the event it will be $130/circuit and can paid by Cash/Card before installation. Requests for additional circuits must be submitted at the time of application. Additional circuits are not automatically granted unless requested in advance prior to the event dates and subject to availability of electrical power.</li>
        </ol>

        <div className="max-w-xl">
            <label htmlFor="circuits" className="block text-sm font-bold text-slate-800 mb-2 flex items-start gap-2">
                <span>No. of additional 15 amp power circuits required, $60 each <span className="font-normal">(one 15 amp circuit with two plugs included in the fee)</span></span>
                <InfoIcon className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
            </label>
            <select 
                id="circuits" 
                value={additionalCircuits} 
                onChange={(e) => setAdditionalCircuits(e.target.value)} 
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black"
            >
                {Array.from({ length: 21 }, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                ))}
            </select>
        </div>
      </div>
      
      <div>
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-6" role="alert">
            <div className="flex">
                <div className="py-1"><InfoIcon className="h-5 w-5 text-blue-500 mr-3" /></div>
                <div>
                    <p className="font-bold">Bidding Information</p>
                    <p className="text-sm">You can place bids on a maximum of 3 booths at a time. You can increase your bid on booths you've already bid on without this counting towards the limit.</p>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Bidding Booths</h2>
            <div className="w-full sm:w-auto">
                <label htmlFor="location-filter" className="sr-only">Filter by Location</label>
                 <select 
                    id="location-filter" 
                    value={selectedLocation} 
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full sm:w-56 rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black"
                >
                    {locations.map(location => (
                        <option key={location} value={location}>
                            {location === 'All' ? 'All Locations' : location}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {filteredBooths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBooths.map(booth => {
              const highestBid = booth.currentBid || booth.basePrice;
              const nextMinBid = highestBid + booth.increment;
              const userBidDetails = vendorBidData[booth.id];

              return (
                <div key={booth.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="p-5">
                     <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-lg font-bold text-slate-900 pr-2">
                            {booth.title} <span className="text-base font-medium text-slate-500">({booth.type})</span>
                        </h3>
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booth.status)}`}>
                            {booth.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <LocationPinIcon className="w-4 h-4" />
                      <span>{booth.location}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 h-10">{booth.description}</p>
                    
                    <div className={`mt-4 bg-slate-50 rounded-lg p-3 space-y-2 text-sm`}>
                      <div className={`flex justify-between items-center rounded-sm -m-1 p-1 ${highlightedBooths.has(booth.id) ? 'highlight-bid' : ''}`}>
                        <span className="text-slate-500">Current Bid:</span>
                        <span className="font-bold text-slate-800 text-base">${highestBid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Buy Out Price:</span>
                        <span className="font-bold text-pink-600">${booth.buyOutPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Buyout method :-</span>
                        <span className="font-medium text-slate-600">{booth.buyoutMethod}</span>
                      </div>
                       <div className="flex justify-between items-center text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <TrendingUpIcon className="w-4 h-4" />
                            <span>Increment:</span>
                        </div>
                        <span className="font-medium text-slate-600">${booth.increment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4"/> 
                          <span>Bid Ends:</span>
                        </div>
                        <span className="font-medium text-slate-600">{new Date(booth.bidEndDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/75 p-4 mt-auto rounded-b-xl space-y-3">
                    {userBidDetails && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 space-y-2 text-sm">
                            <h4 className="font-bold text-green-900 text-base mb-2">Your Bid Summary</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Your Bid:</span>
                                <span className="font-medium text-slate-800">${userBidDetails.bidAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Electrical Cost ({userBidDetails.circuits} x $60):</span>
                                <span className="font-medium text-slate-800">${(userBidDetails.circuits * 60).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-green-200">
                                <span className="font-bold text-slate-700">Total Commitment:</span>
                                <span className="font-bold text-green-800 text-base">${(userBidDetails.bidAmount + userBidDetails.circuits * 60).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    
                    {booth.status === 'Open' && (
                     <>
                        <div>
                            <label htmlFor={`bid-${booth.id}`} className="block text-xs font-medium text-slate-600 mb-1">
                                {userBidDetails ? 'Increase Your Bid' : 'Your Bid'} (min. ${nextMinBid.toFixed(2)})
                            </label>
                            <input
                            type="number"
                            id={`bid-${booth.id}`}
                            value={bidInputs[booth.id] || ''}
                            onChange={(e) => handleBidChange(booth.id, e.target.value)}
                            placeholder={`$${nextMinBid.toFixed(2)} or more`}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black"
                            step={booth.increment}
                            min={nextMinBid}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handlePlaceBid(booth)} 
                                className="w-full bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm" 
                            >
                                Place Bid
                            </button>
                            <button 
                                onClick={() => handleBuyOut(booth)} 
                                className="w-full bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm text-sm"
                            >
                                Buy Out
                            </button>
                        </div>
                     </>
                    )}

                    {booth.status === 'Sold' && booth.winner === vendorName && (
                      <div className="text-center p-2 bg-blue-100 text-blue-800 rounded-md font-semibold">
                        You won this booth!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium text-slate-800">No Booths Found</h3>
            <p className="text-slate-500 mt-1">There are currently no booths in the selected location. Please check back later or select a different location.</p>
          </div>
        )}
      </div>

      <ChangeBoothInfoModal 
          isOpen={isChangeBoothModalOpen} 
          onClose={() => setIsChangeBoothModalOpen(false)} 
      />
      <ErrorModal 
          isOpen={!!bidError} 
          onClose={() => setBidError(null)} 
          message={bidError} 
      />
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
      />
      <PaymentModal
        isOpen={paymentModalState.isOpen}
        onClose={() => setPaymentModalState({isOpen: false, booth: null})}
        booth={paymentModalState.booth}
        circuits={parseInt(additionalCircuits, 10) || 0}
        vendorName={vendorName}
      />
    </div>
  );
};