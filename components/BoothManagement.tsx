import React, { useState, useContext, useMemo } from 'react';
import { PlusCircleIcon, TrashIcon } from './icons';
import { BoothTable } from './BoothTable';
import { BiddingContext } from '../context/BiddingContext';
import { ConfirmationModal } from './ConfirmationModal';
import { useToast } from '../context/ToastContext';

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
    biddingPaymentMethod: 'Direct pay' | 'Admin approve';
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
    const { booths, deleteBooth, bulkUpdateBooths } = useContext(BiddingContext);
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<BoothTab>('bidding');
    const [selectedBooths, setSelectedBooths] = useState<number[]>([]);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    
    const { biddingBooths, nonBiddingBooths } = useMemo(() => {
        const bidding = booths.filter(b => b.isBiddingEnabled || (b.allowBuyout ?? false));
        const nonBidding = booths.filter(b => !b.isBiddingEnabled && !(b.allowBuyout ?? false));
        return { biddingBooths: bidding, nonBiddingBooths: nonBidding };
    }, [booths]);

    const displayedBooths = activeTab === 'bidding' ? biddingBooths : nonBiddingBooths;

    const handleSelectAll = () => {
        if (selectedBooths.length === displayedBooths.length) {
            setSelectedBooths([]);
        } else {
            setSelectedBooths(displayedBooths.map(b => b.id));
        }
    };
    
    const handleSelectOne = (boothId: number) => {
        setSelectedBooths(prev =>
            prev.includes(boothId)
                ? prev.filter(id => id !== boothId)
                : [...prev, boothId]
        );
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
    
    const handleBulkDelete = () => {
        setConfirmModalState({
            isOpen: true,
            title: `Delete ${selectedBooths.length} Booths`,
            message: `Are you sure you want to delete the selected booths? This action cannot be undone.`,
            onConfirm: () => {
                bulkUpdateBooths(selectedBooths, { type: 'delete' });
                addToast(`${selectedBooths.length} booths deleted.`, 'info');
                setSelectedBooths([]);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    const handleBulkStatusChange = (status: Booth['status']) => {
        setConfirmModalState({
            isOpen: true,
            title: `Change Status for ${selectedBooths.length} Booths`,
            message: `Are you sure you want to change the status of the selected booths to "${status}"?`,
            onConfirm: () => {
                bulkUpdateBooths(selectedBooths, { type: 'changeStatus', status });
                addToast(`Status changed to "${status}" for ${selectedBooths.length} booths.`, 'success');
                setSelectedBooths([]);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    const handleBulkExtend = (hours: number) => {
        setConfirmModalState({
            isOpen: true,
            title: `Extend Bidding for ${selectedBooths.length} Booths`,
            message: `Are you sure you want to extend the bidding end time by ${hours} hour(s) for the selected booths? This only applies to booths currently open for bidding.`,
            onConfirm: () => {
                bulkUpdateBooths(selectedBooths, { type: 'extendBidding', hours });
                addToast(`Bidding extended by ${hours} hour(s) for selected booths.`, 'success');
                setSelectedBooths([]);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };
    
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
                        In Bidding Module ({biddingBooths.length})
                    </button>
                     <button
                        onClick={() => setActiveTab('nonBidding')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'nonBidding' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        Direct Assignment Only ({nonBiddingBooths.length})
                    </button>
                  </nav>
                </div>
                
                {selectedBooths.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-4 animate-fade-in">
                        <div className="flex-shrink-0">
                            <span className="font-semibold text-slate-800">{selectedBooths.length} booth{selectedBooths.length > 1 ? 's' : ''} selected</span>
                        </div>
                        <div className="flex-grow flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2">
                                <select onChange={(e) => handleBulkStatusChange(e.target.value as Booth['status'])} value="" className="text-sm rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-1.5 bg-white text-black">
                                    <option value="" disabled>Change status to...</option>
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <select onChange={(e) => handleBulkExtend(parseInt(e.target.value))} value="" className="text-sm rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-1.5 bg-white text-black">
                                    <option value="" disabled>Extend bidding by...</option>
                                    <option value="1">1 Hour</option>
                                    <option value="6">6 Hours</option>
                                    <option value="24">24 Hours</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5 hover:bg-red-100 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
                
                {displayedBooths.length > 0 ? (
                    <BoothTable booths={displayedBooths} onEdit={onGoToEdit} onDelete={handleDelete} onViewDetails={onViewDetails} selectedBooths={selectedBooths} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} />
                ) : (
                    <p className="text-sm text-slate-500 py-4 text-center">
                        {activeTab === 'bidding' ? 'No booths are currently available in the bidding module.' : 'No booths are currently configured for direct assignment only.'}
                    </p>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                confirmText="Confirm"
            />
        </div>
    );
};