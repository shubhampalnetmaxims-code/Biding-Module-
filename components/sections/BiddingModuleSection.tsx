import React, { useState, useContext, useEffect, useMemo } from 'react';
import { InfoIcon, ClockIcon, LocationPinIcon, TrendingUpIcon, StarIcon, QuestionMarkCircleIcon, DollarSignIcon } from '../icons';
import { BiddingContext } from '../../context/BiddingContext';
import { Booth } from '../BoothManagement';
import { ChangeBoothInfoModal } from '../ChangeBoothInfoModal';
import { ErrorModal } from '../ErrorModal';
import { useToast } from '../../context/ToastContext';
import { ConfirmationModal } from '../ConfirmationModal';
import { PaymentModal } from '../PaymentModal';
import { CountdownTimer } from '../CountdownTimer';
import { HowItWorksModal } from '../HowItWorksModal';

interface BiddingModuleSectionProps {
    vendorName: string;
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

type SortOption = 'endingSoon' | 'bidLowHigh';
type FilterOption = 'all' | 'myBids' | 'myWatchlist';

export const BiddingModuleSection: React.FC<BiddingModuleSectionProps> = ({ vendorName }) => {
  const { booths, placeBid, removeBid, userBids, requestBuyOut, buyoutRequests, watchlist, toggleWatchlist, circuitSelections, setCircuitSelection } = useContext(BiddingContext);
  const { addToast } = useToast();
  
  const [bidInputs, setBidInputs] = useState<{ [key: number]: string }>({});
  const [bidError, setBidError] = useState<string | null>(null);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
  const [paymentModalState, setPaymentModalState] = useState<{isOpen: boolean, booth: Booth | null}>({isOpen: false, booth: null});
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('endingSoon');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] = useState(false);

  const additionalCircuits = circuitSelections[vendorName] ?? 0;

  const handleBidChange = (boothId: number, value: string) => {
    setBidInputs(prev => ({ ...prev, [boothId]: value }));
  };

  const handlePlaceBid = (booth: Booth) => {
    const bidValue = parseFloat(bidInputs[booth.id]);
    const numCircuits = additionalCircuits;
    
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
    const numCircuits = additionalCircuits;
    const totalPayable = booth.buyOutPrice + (numCircuits * 60);

    if (booth.buyoutMethod === 'Direct pay') {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Direct Buy Out',
            message: `You are about to purchase ${booth.title} for a total of $${totalPayable.toFixed(2)}. Do you want to proceed to payment?`,
            onConfirm: () => {
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
                setPaymentModalState({ isOpen: true, booth: booth });
            },
            confirmText: 'Proceed to Payment'
        });
    } else { // Admin approve
        setConfirmModalState({
            isOpen: true,
            title: 'Request Buy Out',
            message: `Are you sure you want to request to buy out ${booth.title} for $${booth.buyOutPrice.toFixed(2)}? This request will include your selection of ${numCircuits} additional circuit(s). An admin will review your request.`,
            onConfirm: () => {
                requestBuyOut(vendorName, booth.id, numCircuits);
                addToast('Buy out request sent to admin for approval.', 'success');
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
            },
            confirmText: 'Request Buy Out'
        });
    }
  };

  const handleRemoveBid = (booth: Booth) => {
    setConfirmModalState({
        isOpen: true,
        title: 'Remove Bid',
        message: `Are you sure you want to remove your bid for "${booth.title}"? This will free up one of your bidding slots but cannot be undone.`,
        onConfirm: () => {
            const result = removeBid(vendorName, booth.id);
            if (result.success) {
                addToast(result.message, 'success');
            } else {
                setBidError(result.message);
            }
            setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
        },
        confirmText: 'Remove Bid'
    });
  };
  
  const locations = ['All', ...Array.from(new Set(booths.map(b => b.location)))];
  const vendorBidData = userBids[vendorName] || {};
  const vendorWatchlist = watchlist[vendorName] || new Set();

  const filteredAndSortedBooths = useMemo(() => {
    let processedBooths = [...booths].filter(booth => booth.status === 'Open');

    // Location Filter
    processedBooths = processedBooths.filter(booth => selectedLocation === 'All' || booth.location === selectedLocation);

    // Bidding Filter
    if (filterOption === 'myBids') {
      processedBooths = processedBooths.filter(booth => vendorBidData.hasOwnProperty(booth.id));
    } else if (filterOption === 'myWatchlist') {
      processedBooths = processedBooths.filter(booth => vendorWatchlist.has(booth.id));
    }
    
    // Sorting
    processedBooths.sort((a, b) => {
        if (sortOption === 'endingSoon') {
            return new Date(a.bidEndDate).getTime() - new Date(b.bidEndDate).getTime();
        }
        if (sortOption === 'bidLowHigh') {
            const bidA = a.currentBid || a.basePrice;
            const bidB = b.currentBid || b.basePrice;
            return bidA - bidB;
        }
        return 0;
    });

    return processedBooths;
  }, [booths, selectedLocation, filterOption, sortOption, vendorBidData, vendorWatchlist]);


  const getStatusBadgeClass = (status: Booth['status']) => {
    switch (status) {
        case 'Open': return 'bg-green-100 text-green-800';
        case 'Closed': return 'bg-red-100 text-red-800';
        case 'Sold': return 'bg-slate-200 text-slate-800 font-bold';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  const getVendorBidStatus = (booth: Booth): { text: string; className: string } | null => {
        const userBidDetails = vendorBidData[booth.id];
        if (!userBidDetails) return null;

        const isHighestBidder = booth.currentBid === userBidDetails.bidAmount;

        if (isHighestBidder) {
            return { text: "WINNING", className: "bg-green-500 text-white" };
        } else {
            return { text: "OUTBID", className: "bg-red-500 text-white" };
        }
    };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-pink-600 mb-4">Electrical Circuit</h3>
        <p className="text-slate-600 text-sm mb-4">Select the number of additional 15 amp power circuits required ($60 each). This selection will apply to all bids and buyout requests you make below.</p>
        <div className="max-w-xl">
            <label htmlFor="circuits" className="sr-only">
                No. of additional 15 amp power circuits required, $60 each
            </label>
            <select 
                id="circuits" 
                value={additionalCircuits} 
                onChange={(e) => setCircuitSelection(vendorName, parseInt(e.target.value, 10))} 
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
            <div className="flex justify-between items-center">
                <div className="flex">
                    <div className="py-1"><InfoIcon className="h-5 w-5 text-blue-500 mr-3" /></div>
                    <div>
                        <p className="font-bold">Bidding Information</p>
                        <p className="text-sm">You can place bids on a maximum of 3 booths at a time. Increasing your bid on booths you've already bid on does not count towards this limit.</p>
                    </div>
                </div>
                <button onClick={() => setIsHowItWorksModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors flex-shrink-0 ml-4">
                    <QuestionMarkCircleIcon className="w-5 h-5"/> How does bidding work?
                </button>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Available Bidding Booths</h2>
        </div>
        
         <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
             <div className="flex-grow min-w-[150px]">
                <label htmlFor="filter-bids" className="block text-sm font-medium text-slate-700 mb-1">Show</label>
                <select id="filter-bids" value={filterOption} onChange={e => setFilterOption(e.target.value as FilterOption)} className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black">
                    <option value="all">All Booths</option>
                    <option value="myBids">Booths I'm Bidding On</option>
                    <option value="myWatchlist">My Watchlist</option>
                </select>
            </div>
             <div className="flex-grow min-w-[150px]">
                <label htmlFor="location-filter" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                 <select id="location-filter" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black">
                    {locations.map(location => ( <option key={location} value={location}> {location} </option>))}
                </select>
            </div>
            <div className="flex-grow min-w-[150px]">
                <label htmlFor="sort-bids" className="block text-sm font-medium text-slate-700 mb-1">Sort by</label>
                <select id="sort-bids" value={sortOption} onChange={e => setSortOption(e.target.value as SortOption)} className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black">
                    <option value="endingSoon">Time Left (Ending Soonest)</option>
                    <option value="bidLowHigh">Current Bid (Low to High)</option>
                </select>
            </div>
        </div>


        {filteredAndSortedBooths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedBooths.map(booth => {
              const highestBid = booth.currentBid || booth.basePrice;
              const nextMinBid = highestBid + booth.increment;
              const userBidDetails = vendorBidData[booth.id];
              const vendorBidStatus = getVendorBidStatus(booth);
              const hasAnyPendingBuyout = booth.buyoutMethod === 'Admin approve' && (buyoutRequests[booth.id] || []).length > 0;
              const hasVendorRequestedBuyout = (buyoutRequests[booth.id] || []).some(req => req.vendorName === vendorName);
              const isWatched = vendorWatchlist.has(booth.id);

              return (
                <div key={booth.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col relative">
                  {vendorBidStatus && (
                      <div className={`absolute top-0 right-4 -mt-3 px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md ${vendorBidStatus.className}`}>
                          {vendorBidStatus.text}
                      </div>
                  )}
                  <div className="p-5">
                     <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-lg font-bold text-slate-900 pr-2">
                            {booth.title} <span className="text-base font-medium text-slate-500">({booth.type})</span>
                        </h3>
                         <button onClick={() => toggleWatchlist(vendorName, booth.id)} className={`p-1 -mr-1 -mt-1 rounded-full ${isWatched ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-400'}`} aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}>
                            <StarIcon isFilled={isWatched} className="w-6 h-6"/>
                         </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <LocationPinIcon className="w-4 h-4" />
                      <span>{booth.location}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 h-10">{booth.description}</p>
                    
                    <div className={`mt-4 bg-slate-50 rounded-lg p-3 space-y-2 text-sm`}>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Current Bid:</span>
                        <span className="font-bold text-slate-800 text-base">${highestBid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Buy Out Price:</span>
                        <span className="font-bold text-pink-600">${booth.buyOutPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <div className="flex items-center gap-1.5" title={
                            booth.buyoutMethod === 'Admin approve'
                                ? 'Admin must approve your buyout request. Bidding is paused when the first request is made.'
                                : 'Instantly purchase the booth. Payment is required immediately.'
                        }>
                            <QuestionMarkCircleIcon className="w-4 h-4 cursor-help" />
                            <span>Buyout Type:</span>
                        </div>
                        <span className="font-medium text-slate-600">{booth.buyoutMethod}</span>
                      </div>
                       <div className="flex justify-between items-center text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <TrendingUpIcon className="w-4 h-4" />
                            <span>Increment:</span>
                        </div>
                        <span className="font-medium text-slate-600">${booth.increment.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <CountdownTimer endDate={booth.bidEndDate} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/75 p-4 mt-auto rounded-b-xl space-y-3">
                    {userBidDetails && (
                         <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                            <h4 className="font-bold text-blue-800 mb-2 text-center">Your Bid Details</h4>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Bid Amount:</span>
                                    <span className="font-semibold text-slate-800">${userBidDetails.bidAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Electrical Circuits ({userBidDetails.circuits}):</span>
                                    <span className="font-semibold text-slate-800">${(userBidDetails.circuits * 60).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-blue-200 mt-1">
                                    <span className="font-bold text-slate-700">Total Bid Value:</span>
                                    <span className="font-bold text-slate-900">${(userBidDetails.bidAmount + userBidDetails.circuits * 60).toFixed(2)}</span>
                                </div>
                            </div>
                            {booth.status === 'Open' && !hasAnyPendingBuyout && (
                                <div className="mt-2 pt-2 border-t border-blue-200">
                                    <button
                                        onClick={() => handleRemoveBid(booth)}
                                        className="w-full text-center text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 py-1 rounded-md transition-colors"
                                    >
                                        Remove Bid
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {booth.status === 'Open' && (
                     <>
                        {hasAnyPendingBuyout ? (
                            <div className="text-center p-2 bg-yellow-100 text-yellow-800 rounded-md font-semibold text-sm">
                                Bidding is paused due to a pending buyout request.
                            </div>
                        ) : (
                            <div>
                                <label htmlFor={`bid-${booth.id}`} className="block text-xs font-medium text-slate-600 mb-1">
                                    {userBidDetails ? 'Increase Your Bid' : 'Your Bid'} (min. ${nextMinBid.toFixed(2)})
                                </label>
                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <DollarSignIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id={`bid-${booth.id}`}
                                        value={bidInputs[booth.id] || ''}
                                        onChange={(e) => handleBidChange(booth.id, e.target.value)}
                                        placeholder={nextMinBid.toFixed(2)}
                                        className="w-full rounded-lg border-2 border-slate-300 py-3 pl-10 pr-4 text-lg font-semibold text-slate-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                                        step={booth.increment}
                                        min={nextMinBid}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {hasVendorRequestedBuyout ? (
                            <div className="mt-3 text-center p-2 bg-blue-100 text-blue-800 rounded-md font-semibold text-sm">
                                Buyout Requested
                            </div>
                        ) : (
                            <div className={`mt-3 ${!hasAnyPendingBuyout ? 'grid grid-cols-2 gap-3' : 'grid'}`}>
                                {!hasAnyPendingBuyout && (
                                    <button 
                                        onClick={() => handlePlaceBid(booth)} 
                                        disabled={!bidInputs[booth.id]}
                                        className="w-full bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm disabled:bg-slate-400 disabled:cursor-not-allowed" 
                                    >
                                        Place Bid
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleBuyOut(booth)} 
                                    className="w-full bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm text-sm"
                                >
                                    Buy Out
                                </button>
                            </div>
                        )}
                     </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium text-slate-800">No Booths Found</h3>
            <p className="text-slate-500 mt-1">There are currently no booths that match your selected filters.</p>
          </div>
        )}
      </div>

      <ErrorModal 
          isOpen={!!bidError} 
          onClose={() => setBidError(null)} 
          message={bidError} 
      />
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' })}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
      />
      <PaymentModal
        isOpen={paymentModalState.isOpen}
        onClose={() => setPaymentModalState({isOpen: false, booth: null})}
        booth={paymentModalState.booth}
        circuits={additionalCircuits}
        vendorName={vendorName}
      />
      <HowItWorksModal
        isOpen={isHowItWorksModalOpen}
        onClose={() => setIsHowItWorksModalOpen(false)}
      />
    </div>
  );
};