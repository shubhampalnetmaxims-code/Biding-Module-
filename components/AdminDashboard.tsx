import React, { useContext, useMemo } from 'react';
import { BiddingContext, BuyoutRequest } from '../context/BiddingContext';
import { Booth } from './BoothManagement';
import { AdminViewType } from './AdminView';
import { ClockIcon, ExclamationTriangleIcon, DollarSignIcon, CheckCircleIcon, TrendingUpIcon } from './icons';

interface AdminDashboardProps {
    setActiveView: (view: AdminViewType) => void;
    onViewDetails: (boothId: number) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
);

const ActionItem: React.FC<{ booth: Booth, type: 'buyout' | 'payment' | 'endingSoon', onAction: () => void }> = ({ booth, type, onAction }) => {
    const typeConfig = {
        buyout: { icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500"/>, text: 'Pending Buyout Request', color: 'bg-yellow-50 border-yellow-200' },
        payment: { icon: <DollarSignIcon className="w-5 h-5 text-blue-500"/>, text: 'Awaiting Payment Confirmation', color: 'bg-blue-50 border-blue-200' },
        endingSoon: { icon: <ClockIcon className="w-5 h-5 text-red-500"/>, text: 'Auction Ending Soon', color: 'bg-red-50 border-red-200' },
    };
    
    const config = typeConfig[type];

    return (
        <div className={`p-3 rounded-lg border flex items-center justify-between gap-4 ${config.color}`}>
            <div className="flex items-center gap-3">
                {config.icon}
                <div>
                    <p className="font-semibold text-slate-800">{booth.title}</p>
                    <p className="text-xs text-slate-500">{config.text}</p>
                </div>
            </div>
            <button onClick={onAction} className="bg-white text-slate-600 text-xs font-semibold px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-100 transition-colors">
                View
            </button>
        </div>
    )
};


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveView, onViewDetails }) => {
    const { booths, bids, buyoutRequests } = useContext(BiddingContext);
    
    const stats = useMemo(() => {
        const soldBooths = booths.filter(b => b.status === 'Sold');
        const confirmedRevenue = soldBooths
            .filter(b => b.paymentConfirmed)
            .reduce((sum, b) => sum + (b.currentBid || 0), 0);
        
        return {
            totalBooths: booths.length,
            openForBidding: booths.filter(b => b.status === 'Open').length,
            boothsSold: soldBooths.length,
            confirmedRevenue: `$${confirmedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
    }, [booths]);

    const actionItems = useMemo(() => {
        const pendingBuyouts = Object.keys(buyoutRequests).map(boothId => {
            if ((buyoutRequests[boothId] || []).length > 0) {
                return booths.find(b => b.id === parseInt(boothId));
            }
            return null;
        }).filter((b): b is Booth => !!b);

        const pendingPayments = booths.filter(b => b.paymentSubmitted && !b.paymentConfirmed);

        const endingSoon = booths.filter(b => {
            const timeLeft = +new Date(b.bidEndDate) - +new Date();
            const hoursLeft = timeLeft / (1000 * 60 * 60);
            return b.status === 'Open' && hoursLeft > 0 && hoursLeft < 24;
        });

        return { pendingBuyouts, pendingPayments, endingSoon };
    }, [booths, buyoutRequests]);
    
     const recentActivity = useMemo(() => {
        // Fix for: Property 'map' does not exist on type 'unknown'.
        const allBids = Object.entries(bids).flatMap(([boothId, bidList]) => 
            (bidList as any[]).map(bid => ({ ...bid, boothId: parseInt(boothId), type: 'bid' as const }))
        );
        // Fix for: Property 'map' does not exist on type 'unknown'.
        const allBuyouts = Object.entries(buyoutRequests).flatMap(([boothId, requests]) => 
            (requests as any[]).map(r => ({ ...r, boothId: parseInt(boothId), type: 'buyout' as const }))
        );
        
        const combined = [...allBids, ...allBuyouts]
            .sort((a, b) => new Date((b as any).timestamp).getTime() - new Date((a as any).timestamp).getTime())
            .slice(0, 5);
        
        return combined;
    }, [bids, buyoutRequests]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
                <p className="text-slate-500 mt-1">Welcome! Here's a summary of your event's bidding activity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Booths" value={stats.totalBooths} />
                <StatCard title="Open for Bidding" value={stats.openForBidding} />
                <StatCard title="Booths Sold" value={stats.boothsSold} />
                <StatCard title="Confirmed Revenue" value={stats.confirmedRevenue} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Needs Attention Column */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Needs Attention</h3>
                    <div className="space-y-3">
                        {actionItems.pendingBuyouts.length === 0 && actionItems.pendingPayments.length === 0 && actionItems.endingSoon.length === 0 && (
                            <p className="text-sm text-slate-500">No items need your immediate attention.</p>
                        )}
                        {actionItems.pendingBuyouts.map(b => <ActionItem key={`buyout-${b.id}`} booth={b} type="buyout" onAction={() => onViewDetails(b.id)} />)}
                        {actionItems.pendingPayments.map(b => <ActionItem key={`payment-${b.id}`} booth={b} type="payment" onAction={() => onViewDetails(b.id)} />)}
                        {actionItems.endingSoon.map(b => <ActionItem key={`ending-${b.id}`} booth={b} type="endingSoon" onAction={() => onViewDetails(b.id)} />)}
                    </div>
                </div>

                {/* Recent Activity Column */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => {
                                const booth = booths.find(b => b.id === (activity as any).boothId);
                                if (!booth) return null;
                                const bidAmount = 'bidAmount' in activity ? (activity as { bidAmount: number }).bidAmount : 0;

                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {(activity as any).type === 'bid' ? <TrendingUpIcon className="w-4 h-4 text-slate-400" /> : <CheckCircleIcon className="w-4 h-4 text-slate-400" />}
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            <span className="font-semibold text-slate-800">{(activity as any).vendorName}</span>
                                            {(activity as any).type === 'bid' ? ` placed a bid of $${bidAmount.toFixed(2)} on ` : ' requested a buyout for '}
                                            <span className="font-semibold text-slate-800">{booth.title}</span>.
                                            <span className="text-xs text-slate-400 ml-2">{new Date((activity as any).timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-500">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};