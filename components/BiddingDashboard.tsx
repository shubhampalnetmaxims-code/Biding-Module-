import React, { useContext } from 'react';
import { BiddingContext, BuyoutRequest } from '../context/BiddingContext';
import { Booth } from './BoothManagement';
import { Tab } from './TabNavigation';
import { ClockIcon, TrendingUpIcon, StarIcon } from './icons';
import { CountdownTimer } from './CountdownTimer';

interface BiddingDashboardProps {
    vendorName: string;
    setActiveTab: (tab: Tab) => void;
    setDetailedBooth: (booth: Booth | null) => void;
}

const DashboardCard: React.FC<{ booth: Booth, status: 'winning' | 'outbid' | 'pending_buyout' | 'watchlist', vendorBid?: number, highestBid?: number, onNavigate: () => void }> = 
({ booth, status, vendorBid, highestBid, onNavigate }) => {
    
    const statusConfig = {
        winning: {
            borderColor: 'border-green-500',
            title: 'Highest Bidder!',
            textColor: 'text-green-700',
            bgColor: 'bg-green-50',
        },
        outbid: {
            borderColor: 'border-red-500',
            title: 'You are Outbid!',
            textColor: 'text-red-700',
            bgColor: 'bg-red-50',
        },
        pending_buyout: {
            borderColor: 'border-indigo-500',
            title: 'Pending Buyout',
            textColor: 'text-indigo-700',
            bgColor: 'bg-indigo-50',
        },
        watchlist: {
            borderColor: 'border-amber-500',
            title: 'On Your Watchlist',
            textColor: 'text-amber-700',
            bgColor: 'bg-amber-50',
        }
    };

    const config = statusConfig[status];

    return (
        <div className={`p-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} shadow-sm`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                    <p className={`font-bold ${config.textColor}`}>{config.title}</p>
                    <h4 className="text-lg font-bold text-slate-800">{booth.title} <span className="text-base font-medium text-slate-500">({booth.type} - {booth.size})</span></h4>
                    <div className="text-sm text-slate-600 mt-1 space-y-1">
                        {status === 'winning' && <p>Your Bid: <span className="font-semibold">${vendorBid?.toFixed(2)}</span></p>}
                        {status === 'outbid' && <p>Your Bid: <span className="font-semibold">${vendorBid?.toFixed(2)}</span> / Highest: <span className="font-semibold">${highestBid?.toFixed(2)}</span></p>}
                        {status === 'pending_buyout' && <p>Buyout Price: <span className="font-semibold">${booth.buyOutPrice.toFixed(2)}</span></p>}
                        {status === 'watchlist' && <p>Current Bid: <span className="font-semibold">${(booth.currentBid || booth.basePrice).toFixed(2)}</span></p>}
                         <div className="pt-1">
                           <CountdownTimer endDate={booth.bidEndDate} />
                        </div>
                    </div>
                </div>
                <button onClick={onNavigate} className="bg-white text-slate-700 font-semibold px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm text-sm w-full sm:w-auto">
                    Go to Booth
                </button>
            </div>
        </div>
    );
}


export const BiddingDashboard: React.FC<BiddingDashboardProps> = ({ vendorName, setActiveTab, setDetailedBooth }) => {
    const { booths, userBids, buyoutRequests, watchlist } = useContext(BiddingContext);
    
    const vendorBidData = userBids[vendorName] || {};
    const vendorWatchlist = watchlist[vendorName] || new Set();

    const activeBidsBooths = Object.keys(vendorBidData)
        .map(boothId => booths.find(b => b.id === parseInt(boothId) && b.status === 'Open'))
        .filter((b): b is Booth => !!b);

    const winningBids = activeBidsBooths.filter(b => b.currentBid === vendorBidData[b.id]?.bidAmount);
    const outbidBids = activeBidsBooths.filter(b => b.currentBid !== vendorBidData[b.id]?.bidAmount);

    const pendingBuyouts = Object.values(buyoutRequests)
        .flat()
        // FIX: Explicitly type `req` as `any` to allow property access for the type guard, resolving an error where `req` was of type `unknown`.
        .filter((req: any): req is BuyoutRequest => req.vendorName === vendorName)
        .map(req => booths.find(b => {
             const reqBoothId = Object.keys(buyoutRequests).find(key => buyoutRequests[key].includes(req));
             return reqBoothId && b.id === parseInt(reqBoothId) && b.status === 'Open';
        }))
        .filter((b): b is Booth => !!b);

    const watchlistBooths = Array.from(vendorWatchlist)
        .map(boothId => booths.find(b => b.id === boothId && b.status === 'Open'))
        .filter((b): b is Booth => !!b);

    const handleNavigate = (booth: Booth) => {
        setDetailedBooth(booth);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Active Bids</h3>
                <div className="space-y-4">
                    {activeBidsBooths.length === 0 ? (
                        <p className="text-slate-500 text-sm">You haven't placed any bids yet. Go to the 'Bidding Module' to get started!</p>
                    ) : (
                        <>
                            {winningBids.map(booth => (
                                <DashboardCard key={`win-${booth.id}`} booth={booth} status="winning" vendorBid={vendorBidData[booth.id].bidAmount} onNavigate={() => handleNavigate(booth)}/>
                            ))}
                             {outbidBids.map(booth => (
                                <DashboardCard key={`outbid-${booth.id}`} booth={booth} status="outbid" vendorBid={vendorBidData[booth.id].bidAmount} highestBid={booth.currentBid} onNavigate={() => handleNavigate(booth)}/>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Pending Buyout Requests</h3>
                <div className="space-y-4">
                    {pendingBuyouts.length > 0 ? (
                        pendingBuyouts.map(booth => (
                            <DashboardCard key={`buyout-${booth.id}`} booth={booth} status="pending_buyout" onNavigate={() => handleNavigate(booth)} />
                        ))
                    ) : (
                         <p className="text-slate-500 text-sm">You have no pending buyout requests.</p>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">My Watchlist</h3>
                 <div className="space-y-4">
                    {watchlistBooths.length > 0 ? (
                        watchlistBooths.map(booth => (
                           <DashboardCard key={`watch-${booth.id}`} booth={booth} status="watchlist" onNavigate={() => handleNavigate(booth)}/>
                        ))
                    ) : (
                         <p className="text-slate-500 text-sm">You are not watching any booths. Click the star icon on a booth in the 'Bidding Module' to add it to your watchlist.</p>
                    )}
                </div>
            </div>
        </div>
    );
};