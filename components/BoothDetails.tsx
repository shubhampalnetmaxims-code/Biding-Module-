import React, { useContext, useState } from 'react';
import { SectionCard } from './SectionCard';
import { InfoItem } from './InfoItem';
import { ArrowLeftIcon, CheckCircleIcon } from './icons';
import { BiddingContext } from '../context/BiddingContext';
import { Booth } from './BoothManagement';
import { ConfirmBidModal } from './ConfirmBidModal';
import { ConfirmationModal } from './ConfirmationModal';

interface Bid {
    id: number;
    vendorName: string;
    bidAmount: number;
    circuits: number;
    timestamp: string;
}

interface BoothDetailsProps {
    booth: Booth;
    onBack: () => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        }).format(date);
    } catch (e) {
        return dateString;
    }
};

export const BoothDetails: React.FC<BoothDetailsProps> = ({ booth, onBack }) => {
    const { bids, confirmBid, confirmPayment, revokeBid } = useContext(BiddingContext);
    const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bidToConfirm, setBidToConfirm] = useState<Bid | null>(null);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const boothBids = bids[booth.id] || [];
    const sortedBids = [...boothBids].sort((a, b) => b.bidAmount - a.bidAmount);
    
    const handleOpenConfirmModal = (bid: Bid) => {
        setBidToConfirm(bid);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setBidToConfirm(null);
        setIsConfirmModalOpen(false);
    };

    const handleConfirmWinner = () => {
        if (bidToConfirm) {
            confirmBid(booth.id, bidToConfirm.id);
            handleCloseConfirmModal();
        }
    };

    const handleAdminConfirmPayment = (boothId: number) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Payment',
            message: 'Are you sure you want to confirm this payment? This will notify the vendor and cannot be undone.',
            onConfirm: () => {
                confirmPayment(boothId);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };
    
    const handleRevoke = (boothId: number) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Revoke Bid',
            message: 'Are you sure you want to revoke this bid? The booth will become available for bidding again and the vendor will be notified.',
            onConfirm: () => {
                revokeBid(boothId);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                onBack();
            }
        });
    };

    const handleSelectVendor = (bid: Bid) => {
        if (selectedBid && selectedBid.id === bid.id) {
            setSelectedBid(null); // Toggle off if already selected
        } else {
            setSelectedBid(bid);
        }
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900">Booth Details</h2>
            </div>

            <SectionCard title={booth.name}>
                 {booth.status === 'Sold' && (
                     <div className="mb-4 bg-green-100 text-green-800 p-3 rounded-md flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        <p className="font-semibold text-sm">
                            This booth has been sold to {booth.winner} for ${booth.currentBid?.toFixed(2)}.
                        </p>
                    </div>
                 )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <InfoItem label="Type" value={booth.type} />
                    <InfoItem label="Status" value={booth.status} />
                    <InfoItem label="Location" value={booth.location} />
                    <InfoItem label="Base Price" value={`$${booth.basePrice.toFixed(2)}`} />
                    <InfoItem label="Bid Increment" value={`$${booth.increment.toFixed(2)}`} />
                    <InfoItem label="Buy Out Price" value={`$${booth.buyOutPrice.toFixed(2)}`} />
                    <InfoItem label="Bid End Date" value={formatDate(booth.bidEndDate)} />
                    <div className="md:col-span-2">
                        <InfoItem label="Description" value={booth.description} />
                    </div>
                </div>
            </SectionCard>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Bidding History ({sortedBids.length} bids)</h3>
                {sortedBids.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bid Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Payable</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {sortedBids.map((bid, index) => {
                                    const totalPayable = bid.bidAmount + (bid.circuits * 60);
                                    const isSelected = selectedBid?.id === bid.id;
                                    const isWinnerRow = booth.winner === bid.vendorName;

                                    return(
                                        <React.Fragment key={bid.id}>
                                            <tr className={`border-b border-slate-200 ${isSelected ? 'bg-pink-50' : ''} ${index === 0 && booth.status === 'Open' ? "bg-green-50" : (isWinnerRow ? "bg-blue-50" : "")}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    <span onClick={() => handleSelectVendor(bid)} className="cursor-pointer hover:underline hover:text-pink-600">
                                                        {bid.vendorName}
                                                    </span>
                                                    {index === 0 && booth.status === 'Open' && <span className="ml-2 text-xs font-semibold text-green-800">(Highest Bid)</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">${bid.bidAmount.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${totalPayable.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(bid.timestamp)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    {booth.status === 'Open' && (
                                                        <button onClick={() => handleOpenConfirmModal(bid)} className="font-semibold text-pink-600 hover:text-pink-800 transition-colors">
                                                            Confirm Bid
                                                        </button>
                                                    )}
                                                    {isWinnerRow && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            {booth.paymentConfirmed ? (
                                                                <>
                                                                    <span className="font-semibold text-green-700">Payment Confirmed</span>
                                                                    <button onClick={() => handleRevoke(booth.id)} className="bg-red-500 text-white font-semibold px-2 py-1 text-xs rounded-md hover:bg-red-600 transition-colors shadow-sm">
                                                                        Revoke
                                                                    </button>
                                                                </>
                                                            ) : booth.paymentSubmitted ? (
                                                                <button onClick={() => handleAdminConfirmPayment(booth.id)} className="bg-green-500 text-white font-semibold px-3 py-1 text-xs rounded-md hover:bg-green-600 transition-colors shadow-sm">
                                                                    Confirm Payment
                                                                </button>
                                                            ) : (
                                                                <span className="font-semibold text-blue-700">Winner (Awaiting Payment)</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {isSelected && (
                                                <tr className="border-b border-slate-200">
                                                    <td colSpan={5} className="p-4 bg-slate-50 animate-fade-in">
                                                        <h4 className="text-md font-bold text-slate-800 mb-3">Bid Details for {selectedBid.vendorName}</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                            <InfoItem label="Bid Amount" value={`$${selectedBid.bidAmount.toFixed(2)}`} />
                                                            <InfoItem label="Electrical Circuits" value={`${selectedBid.circuits} circuit(s)`} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm">No bids have been placed on this booth yet.</p>
                )}
            </div>
            <ConfirmBidModal 
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmWinner}
                booth={booth}
                bid={bidToConfirm}
            />
            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
            />
        </div>
    );
};