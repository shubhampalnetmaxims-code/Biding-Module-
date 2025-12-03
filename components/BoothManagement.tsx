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
    isBiddingEnabled: boolean;
    allowBuyout?: boolean;
    hideBiddingPrice?: boolean;
    hideIncrementValue?: boolean;
    circuitLimit?: number;
    allowDirectAssignment?: boolean;
    winner?: string;
    currentBid?: number;
    paymentConfirmed?: boolean;
    paymentSubmitted?: boolean;
    winningCircuits?: number;
}

interface BoothManagementProps {
    onViewDetails: (boothId: number) => void;
    onGoToCreate: () => void;
    onGoToEdit: (booth: Booth) => void;
}

type BoothTab = 'bidding' | 'nonBidding';

export const BoothManagement: React.FC<BoothManagementProps> = ({ onViewDetails, onGoToCreate, onGoToEdit }) => {
    const { booths, deleteBooth } = useContext(BiddingContext);
    const [activeTab, setActiveTab] = useState<BoothTab>('bidding');
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    
    const { biddingBooths, nonBiddingBooths } = useMemo(() => {
        const bidding = booths.filter(b => b.isBiddingEnabled);
        const nonBidding = booths.filter(b => !b.isBiddingEnabled);
        return { biddingBooths: bidding, nonBiddingBooths: nonBidding };
    }, [booths]);

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
    
    const displayedBooths = activeTab === 'bidding' ? biddingBooths : nonBiddingBooths;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900">Booth Management</h2>
                <button 
                    onClick={onGoToCreate}
                    className="flex-shrink-0 flex items-center gap-2 bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Create Booth</span>
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-200 mb-4">
                  <nav className="-mb-px flex gap-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('bidding')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bidding' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        Booths Open for Bidding ({biddingBooths.length})
                    </button>
                     <button
                        onClick={() => setActiveTab('nonBidding')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'nonBidding' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        Booths Not for Bidding ({nonBiddingBooths.length})
                    </button>
                  </nav>
                </div>
                
                {displayedBooths.length > 0 ? (
                    <BoothTable booths={displayedBooths} onEdit={onGoToEdit} onDelete={handleDelete} onViewDetails={onViewDetails} />
                ) : (
                    <p className="text-sm text-slate-500 py-4 text-center">
                        {activeTab === 'bidding' ? 'No booths are currently enabled for bidding.' : 'No booths are currently configured as not for bidding.'}
                    </p>
                )}
            </div>

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