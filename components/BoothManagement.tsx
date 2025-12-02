import React, { useState, useContext, useMemo } from 'react';
import { PlusCircleIcon } from './icons';
import { BoothTable } from './BoothTable';
import { BiddingContext } from '../context/BiddingContext';
import { ConfirmationModal } from './ConfirmationModal';

export interface Booth {
    id: number;
    title: string;
    type: 'Food' | 'Exhibitor' | 'Sponsors';
    size: string;
    status: 'Open' | 'Closed' | 'Sold';
    location: string;
    basePrice: number;
    buyOutPrice: number;
    bidEndDate: string;
    description: string;
    increment: number;
    buyoutMethod: 'Direct pay' | 'Admin approve';
    hideBiddingPrice?: boolean;
    winner?: string;
    currentBid?: number;
    paymentConfirmed?: boolean;
    paymentSubmitted?: boolean;
}

interface BoothManagementProps {
    onViewDetails: (boothId: number) => void;
    onGoToCreate: () => void;
    onGoToEdit: (booth: Booth) => void;
}

export const BoothManagement: React.FC<BoothManagementProps> = ({ onViewDetails, onGoToCreate, onGoToEdit }) => {
    const { booths, bids, buyoutRequests, deleteBooth } = useContext(BiddingContext);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [filters, setFilters] = useState({
        location: 'All',
        status: 'All',
        buyoutMethod: 'All',
        specialStatus: 'All',
    });
     const [sortOption, setSortOption] = useState('default');

    const locations = ['All', ...Array.from(new Set(booths.map(b => b.location)))];
    const statuses: Array<'All' | Booth['status']> = ['All', 'Open', 'Closed', 'Sold'];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const filteredAndSortedBooths = useMemo(() => {
        let filtered = booths.filter(booth => {
            const locationMatch = filters.location === 'All' || booth.location === filters.location;
            const statusMatch = filters.status === 'All' || booth.status === filters.status;
            const buyoutMethodMatch = filters.buyoutMethod === 'All' || booth.buyoutMethod === filters.buyoutMethod;
            
            let specialStatusMatch = true;
            if(filters.specialStatus === 'pendingBuyout') {
                specialStatusMatch = (buyoutRequests[booth.id] || []).length > 0;
            } else if (filters.specialStatus === 'awaitingPayment') {
                specialStatusMatch = booth.paymentSubmitted === true && booth.paymentConfirmed === false;
            }
            
            return locationMatch && statusMatch && buyoutMethodMatch && specialStatusMatch;
        });

        return filtered.sort((a, b) => {
            switch(sortOption) {
                case 'bidCount':
                    return (bids[b.id]?.length || 0) - (bids[a.id]?.length || 0);
                case 'currentBid':
                    return (b.currentBid || b.basePrice) - (a.currentBid || a.basePrice);
                default:
                    return 0; // Or default sort by ID, etc.
            }
        });

    }, [booths, filters, sortOption, bids, buyoutRequests]);

    const handleDelete = (boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;

        setConfirmModalState({
            isOpen: true,
            title: 'Delete Booth',
            message: `Are you sure you want to delete the booth "${booth.title}"? This action cannot be undone.`,
            onConfirm: () => {
                deleteBooth(boothId);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Booth Management</h2>
                <button 
                    onClick={onGoToCreate}
                    className="flex-shrink-0 flex items-center gap-2 bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Create Booth</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {/* Filters */}
                <div>
                    <label htmlFor="location-filter" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <select id="location-filter" name="location" value={filters.location} onChange={handleFilterChange} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                        {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="buyoutMethod-filter" className="block text-sm font-medium text-slate-700 mb-1">Buyout Method</label>
                    <select id="buyoutMethod-filter" name="buyoutMethod" value={filters.buyoutMethod} onChange={handleFilterChange} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                        <option value="All">All</option>
                        <option value="Admin approve">Admin approve</option>
                        <option value="Direct pay">Direct pay</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="specialStatus-filter" className="block text-sm font-medium text-slate-700 mb-1">Special Status</label>
                    <select id="specialStatus-filter" name="specialStatus" value={filters.specialStatus} onChange={handleFilterChange} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                        <option value="All">All</option>
                        <option value="pendingBuyout">Has Pending Buyouts</option>
                        <option value="awaitingPayment">Awaiting Payment</option>
                    </select>
                </div>

                {/* Sorting */}
                 <div>
                    <label htmlFor="sort-option" className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
                    <select id="sort-option" name="sortOption" value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                        <option value="default">Default</option>
                        <option value="bidCount">Number of Bids</option>
                        <option value="currentBid">Current Bid Value</option>
                    </select>
                </div>
            </div>

            <BoothTable booths={filteredAndSortedBooths} onEdit={onGoToEdit} onDelete={handleDelete} onViewDetails={onViewDetails} />

            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                confirmText="Delete"
            />
        </div>
    );
};