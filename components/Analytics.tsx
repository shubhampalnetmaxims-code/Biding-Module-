import React, { useContext, useMemo } from 'react';
import { BiddingContext } from '../context/BiddingContext';

const StatCard: React.FC<{ title: string; value: string; description: string; }> = ({ title, value, description }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
);

const BarChart: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 0);
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600 w-1/3 truncate text-right">{item.label}</span>
                        <div className="w-2/3 bg-slate-100 rounded-full h-6">
                            <div
                                className="bg-pink-500 h-6 rounded-full flex items-center justify-start pl-2"
                                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                            >
                                <span className="text-xs font-bold text-white">{item.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Leaderboard: React.FC<{ title: string, data: { label: string, value: string }[], unit: string }> = ({title, data, unit}) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
        <ul className="space-y-2">
            {data.map((item, index) => (
                <li key={item.label} className="flex items-center justify-between p-2 rounded-md even:bg-slate-50">
                    <span className="font-medium text-slate-700">{index + 1}. {item.label}</span>
                    <span className="font-bold text-slate-800">{item.value} <span className="font-normal text-sm text-slate-500">{unit}</span></span>
                </li>
            ))}
        </ul>
    </div>
);

export const Analytics: React.FC = () => {
    const { booths, bids } = useContext(BiddingContext);
    
    const analyticsData = useMemo(() => {
        const soldBooths = booths.filter(b => b.status === 'Sold');
        
        const confirmedRevenue = soldBooths
            .filter(b => b.paymentConfirmed)
            .reduce((sum, b) => sum + (b.currentBid || 0), 0);
        
        const potentialRevenue = soldBooths
            .reduce((sum, b) => sum + (b.currentBid || 0), 0);
        
        const topBooths = Object.entries(bids)
            .map(([boothId, bidList]) => ({
                boothId,
                bidCount: bidList.length,
            }))
            .sort((a, b) => b.bidCount - a.bidCount)
            .slice(0, 5)
            .map(item => {
                const booth = booths.find(b => b.id === parseInt(item.boothId));
                return { label: booth?.title || `ID ${item.boothId}`, value: item.bidCount };
            });

        const topBidders = Object.values(bids)
            .flat()
            .reduce((acc, bid) => {
                acc[bid.vendorName] = (acc[bid.vendorName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
        const sortedBidders = Object.entries(topBidders)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([label, value]) => ({ label, value: value.toString() }));
            
        const revenueByLocation = soldBooths
            .filter(b => b.paymentConfirmed)
            .reduce((acc, booth) => {
                acc[booth.location] = (acc[booth.location] || 0) + (booth.currentBid || 0);
                return acc;
            }, {} as Record<string, number>);
            
        const sortedRevenueByLocation = Object.entries(revenueByLocation)
            .sort(([, a], [, b]) => b - a)
            .map(([label, value]) => ({ label, value: `$${value.toLocaleString()}` }));

        return {
            confirmedRevenue,
            potentialRevenue,
            topBooths,
            sortedBidders,
            sortedRevenueByLocation
        };
    }, [booths, bids]);

    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
             <h2 className="text-3xl font-bold text-slate-900">Analytics & Reporting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Confirmed Revenue"
                    value={formatCurrency(analyticsData.confirmedRevenue)}
                    description="Total from booths with confirmed payments."
                />
                 <StatCard 
                    title="Potential Revenue"
                    value={formatCurrency(analyticsData.potentialRevenue)}
                    description="Total from all sold booths (paid and unpaid)."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <BarChart title="Top 5 Most Bid-On Booths" data={analyticsData.topBooths} />
                 <Leaderboard title="Top Bidders by Bid Count" data={analyticsData.sortedBidders} unit="bids" />
                 <Leaderboard title="Revenue by Location" data={analyticsData.sortedRevenueByLocation} unit="" />
            </div>
        </div>
    );
};