import React, { useState, useContext, useMemo } from 'react';
import { PlusCircleIcon } from './icons';
import { BoothTable } from './BoothTable';
import { SaveBoothModal } from './CreateBoothModal';
import { BiddingContext } from '../context/BiddingContext';
import { ConfirmationModal } from './ConfirmationModal';

export interface Booth {
    id: number;
    title: string;
    type: string;
    status: 'Open' | 'Closed' | 'Sold';
    location: string;
    basePrice: number;
    buyOutPrice: number;
    bidEndDate: string;
    description: string;
    increment: number;
    buyoutMethod: 'Direct pay' | 'Admin approve';
    winner?: string;
    currentBid?: number;
    paymentConfirmed?: boolean;
    paymentSubmitted?: boolean;
}

interface BoothManagementProps {
    onViewDetails: (boothId: number) => void;
}

export const BoothManagement: React.FC<BoothManagementProps> = ({ onViewDetails }) => {
    const { booths, addBooth, updateBooth, deleteBooth } = useContext(BiddingContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [filters, setFilters] = useState({
        location: 'All',
        status: 'All',
        bidEndDate: '',
    });

    const locations = ['All', ...Array.from(new Set(booths.map(b => b.location)))];
    const statuses: Array<'All' | Booth['status']> = ['All', 'Open', 'Closed', 'Sold'];

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            location: 'All',
            status: 'All',
            bidEndDate: '',
        });
    };

    const filteredBooths = useMemo(() => {
        return booths.filter(booth => {
            const locationMatch = filters.location === 'All' || booth.location === filters.location;
            const statusMatch = filters.status === 'All' || booth.status === filters.status;
            // The date input gives a YYYY-MM-DD string. The booth data is a full ISO string.
            // .startsWith() is a safe way to check if the day is the same, avoiding timezone issues.
            const dateMatch = !filters.bidEndDate || (booth.bidEndDate && booth.bidEndDate.startsWith(filters.bidEndDate));
            
            return locationMatch && statusMatch && dateMatch;
        });
    }, [booths, filters]);

    const handleCreate = () => {
        setEditingBooth(null);
        setIsModalOpen(true);
    };

    const handleEdit = (booth: Booth) => {
        setEditingBooth(booth);
        setIsModalOpen(true);
    };

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

    const handleSave = (boothData: Omit<Booth, 'id'> | Booth) => {
        if ('id' in boothData) {
            updateBooth(boothData.id, boothData);
        } else {
            addBooth(boothData);
        }
        setIsModalOpen(false);
        setEditingBooth(null);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Bidding Booths</h2>
                <button 
                    onClick={handleCreate}
                    className="flex-shrink-0 flex items-center gap-2 bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Create Booth</span>
                </button>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="location-filter" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <select id="location-filter" name="location" value={filters.location} onChange={handleFilterChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black">
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black">
                        {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="date-filter" className="block text-sm font-medium text-slate-700 mb-1">Bid End Date</label>
                    <input type="date" id="date-filter" name="bidEndDate" value={filters.bidEndDate} onChange={handleFilterChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black" />
                </div>
                <div className="flex-shrink-0">
                    <button onClick={handleResetFilters} className="w-full bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        Reset
                    </button>
                </div>
            </div>

            <BoothTable booths={filteredBooths} onEdit={handleEdit} onDelete={handleDelete} onViewDetails={onViewDetails} />

            {isModalOpen && (
                <SaveBoothModal
                    boothToEdit={editingBooth}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingBooth(null);
                    }}
                    onSave={handleSave}
                />
            )}
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