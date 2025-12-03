import React, { useState, useContext, useMemo } from 'react';
import { InfoIcon, LocationPinIcon, TrendingUpIcon, StarIcon, QuestionMarkCircleIcon, MapIcon } from '../icons';
import { BiddingContext } from '../../context/BiddingContext';
import { Booth } from '../BoothManagement';
import { HowItWorksModal } from '../HowItWorksModal';
import { EventMapModal } from '../EventMapModal';
import { CountdownTimer } from '../CountdownTimer';

interface BiddingModuleSectionProps {
    vendorName: string;
    setDetailedBooth: (booth: Booth | null) => void;
}

type SortOption = 'endingSoon' | 'bidLowHigh';
type FilterOption = 'all' | 'myBids' | 'myWatchlist';

export const BiddingModuleSection: React.FC<BiddingModuleSectionProps> = ({ vendorName, setDetailedBooth }) => {
  const { booths, userBids, watchlist, toggleWatchlist } = useContext(BiddingContext);
  
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('endingSoon');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  const locations = ['All', ...Array.from(new Set(booths.map(b => b.location)))];
  const vendorBidData = userBids[vendorName] || {};
  const vendorWatchlist = watchlist[vendorName] || new Set();

  const filteredAndSortedBooths = useMemo(() => {
    let processedBooths = [...booths].filter(booth => booth.isBiddingEnabled && booth.status === 'Open');

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

  const getVendorBidStatus = (booth: Booth): { text: string; className: string } | null => {
        const userBidDetails = vendorBidData[booth.id];
        if (!userBidDetails) return null;

        const isHighestBidder = booth.currentBid === userBidDetails.bidAmount;

        if (isHighestBidder) {
            return { text: "Bid Placed", className: "bg-blue-500 text-white" };
        } else {
            return { text: "OUTBID", className: "bg-red-500 text-white" };
        }
    };

  return (
    <div className="space-y-6">
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
             <button onClick={() => setIsMapModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-800 transition-colors flex-shrink-0">
                <MapIcon className="w-5 h-5"/> View Event Map
            </button>
        </div>
        
         <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
             <div className="flex-grow min-w-[150px]">
                <label htmlFor="filter-bids" className="block text-sm font-medium text-slate-700 mb-1">Show</label>
                <select id="filter-bids" value={filterOption} onChange={e => setFilterOption(e.target.value as FilterOption)} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                    <option value="all">All Booths</option>
                    <option value="myBids">Booths I'm Bidding On</option>
                    <option value="myWatchlist">My Watchlist</option>
                </select>
            </div>
             <div className="flex-grow min-w-[150px]">
                <label htmlFor="location-filter" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                 <select id="location-filter" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                    {locations.map(location => ( <option key={location} value={location}> {location} </option>))}
                </select>
            </div>
            <div className="flex-grow min-w-[150px]">
                <label htmlFor="sort-bids" className="block text-sm font-medium text-slate-700 mb-1">Sort by</label>
                <select id="sort-bids" value={sortOption} onChange={e => setSortOption(e.target.value as SortOption)} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                    <option value="endingSoon">Time Left (Ending Soonest)</option>
                    <option value="bidLowHigh">Current Bid (Low to High)</option>
                </select>
            </div>
        </div>

        {filteredAndSortedBooths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedBooths.map(booth => {
              const highestBid = booth.currentBid || booth.basePrice;
              const vendorBidStatus = getVendorBidStatus(booth);
              const isWatched = vendorWatchlist.has(booth.id);

              return (
                <div 
                  key={booth.id} 
                  onClick={() => setDetailedBooth(booth)} 
                  className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col relative transition-shadow hover:shadow-md cursor-pointer"
                >
                  {vendorBidStatus && (
                      <div className={`absolute top-0 right-4 -mt-3 px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md ${vendorBidStatus.className}`}>
                          {vendorBidStatus.text}
                      </div>
                  )}
                  <div className="p-5 flex-grow">
                     <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-lg font-bold text-slate-900 pr-2">
                            {booth.title} <span className="text-base font-medium text-slate-500">({booth.type} - {booth.size})</span>
                        </h3>
                         <button onClick={(e) => { e.stopPropagation(); toggleWatchlist(vendorName, booth.id); }} className={`p-1 -mr-1 -mt-1 rounded-full z-10 ${isWatched ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-400'}`} aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}>
                            <StarIcon isFilled={isWatched} className="w-6 h-6"/>
                         </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <LocationPinIcon className="w-4 h-4" />
                      <span>{booth.location}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 h-10">{booth.description}</p>
                    
                    <div className={`mt-4 bg-slate-50 rounded-lg p-3 space-y-2 text-sm`}>
                      {!booth.hideBiddingPrice ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Current Bid:</span>
                            <span className="font-bold text-slate-800 text-base">${highestBid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Buy Out Price:</span>
                            <span className="font-bold text-pink-600">${booth.buyOutPrice.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                            <div className="flex justify-between items-center text-slate-500">
                                <div className="flex items-center gap-1.5" title={
                                    booth.buyoutMethod === 'Admin approve'
                                        ? 'Admin must approve your buyout request.'
                                        : 'Instantly purchase the booth.'
                                }>
                                    <QuestionMarkCircleIcon className="w-4 h-4 cursor-help" />
                                    <span>Buyout Type:</span>
                                </div>
                                <span className="font-medium text-slate-600">{booth.buyoutMethod}</span>
                            </div>
                            {!booth.hideIncrementValue && (
                                <div className="flex justify-between items-center text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUpIcon className="w-4 h-4" />
                                        <span>Increment:</span>
                                    </div>
                                    <span className="font-medium text-slate-600">${booth.increment.toFixed(2)}</span>
                                </div>
                            )}
                        </>
                      )}
                      <div className="pt-2 border-t border-slate-200">
                        <CountdownTimer endDate={booth.bidEndDate} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/75 p-3 mt-auto rounded-b-xl text-center">
                    <span className="font-semibold text-pink-600 text-sm">Click for details & bidding</span>
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

      <HowItWorksModal
        isOpen={isHowItWorksModalOpen}
        onClose={() => setIsHowItWorksModalOpen(false)}
      />
      <EventMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />
    </div>
  );
};