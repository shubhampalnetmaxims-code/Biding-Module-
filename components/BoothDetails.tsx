import React, { useContext, useState } from 'react';
import { SectionCard } from './SectionCard';
import { InfoItem } from './InfoItem';
import { ArrowLeftIcon, CheckCircleIcon } from './icons';
import { BiddingContext, BuyoutRequest, VENDOR_DETAILS } from '../context/BiddingContext';
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
    const { bids, buyoutRequests, confirmBid, approveBuyOut, confirmPayment, revokeBid } = useContext(BiddingContext);
    const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bidToConfirm, setBidToConfirm] = useState<Bid | null>(null);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const boothBids = bids[booth.id] || [];
    const sortedBids = [...boothBids].sort((a, b) => b.bidAmount - a.bidAmount);
    const boothBuyoutRequests = buyoutRequests[booth.id] || [];
    
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

    const handleApproveBuyout = (boothId: number, request: BuyoutRequest) => {
        const totalPayable = booth.buyOutPrice + (request.circuits * 60);
        setConfirmModalState({
            isOpen: true,
            title: 'Approve Buyout Request',
            message: `Are you sure you want to approve the buyout request from ${request.vendorName} for a total of $${totalPayable.toFixed(2)}? This will sell the booth and cannot be undone.`,
            onConfirm: () => {
                approveBuyOut(boothId, request.vendorName);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
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

            <SectionCard title={booth.title}>
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
                    <InfoItem label="Size" value={booth.size} />
                    <InfoItem label="Status" value={booth.status} />
                    <InfoItem label="Location" value={booth.location} />
                    <InfoItem label="Bidding Enabled" value={booth.isBiddingEnabled ? 'Yes' : 'No'} />
                     <InfoItem label="Buyout Enabled" value={booth.allowBuyout ? 'Yes' : 'No'} />
                    {booth.isBiddingEnabled && (
                        <>
                            <InfoItem label="Base Price" value={`$${booth.basePrice.toFixed(2)}`} />
                            <InfoItem label="Bid Increment" value={`$${booth.increment.toFixed(2)}`} />
                            {booth.allowBuyout && <InfoItem label="Buy Out Price" value={`$${booth.buyOutPrice.toFixed(2)}`} />}
                            <InfoItem label="Bidding Payment Method" value={booth.biddingPaymentMethod} />
                            {booth.allowBuyout && <InfoItem label="Buyout Method" value={booth.buyoutMethod} />}
                            <InfoItem label="Bid End Date" value={formatDate(booth.bidEndDate)} />
                        </>
                    )}
                    <InfoItem label="Circuit Limit" value={booth.circuitLimit ?? 'Unlimited'} />
                    <InfoItem label="Direct Assignment" value={booth.allowDirectAssignment ? 'Enabled' : 'Disabled'} />
                    <InfoItem label="Pricing Visible" value={!booth.hideBiddingPrice ? 'Yes' : 'No'} />
                    <InfoItem label="Increment Visible" value={!booth.hideIncrementValue ? 'Yes' : 'No'} />
                    <div className="md:col-span-full">
                        <InfoItem label="Description" value={booth.description} />
                    </div>
                </div>
            </SectionCard>
            
            {booth.status === 'Open' && boothBuyoutRequests.length > 0 && (
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-bold text-slate-900 mb-4">Buyout Requests ({boothBuyoutRequests.length})</h3>
                     <div className="space-y-3">
                        {boothBuyoutRequests.map(req => {
                            const totalPayable = booth.buyOutPrice + (req.circuits * 60);
                            return (
                                <div key={req.vendorName} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-slate-800">{req.vendorName}</p>
                                        <div className="text-sm text-slate-600 mt-1">
                                            <span>Buyout: ${booth.buyOutPrice.toFixed(2)}</span>
                                            <span className="mx-2 text-slate-400">|</span>
                                            <span>Circuits: {req.circuits} (${(req.circuits * 60).toFixed(2)})</span>
                                            <span className="mx-2 text-slate-400">|</span>
                                            <span className="font-semibold">Total: ${totalPayable.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleApproveBuyout(booth.id, req)} className="bg-pink-600 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-pink-700 transition-colors shadow-sm text-sm w-full sm:w-auto">
                                        Approve
                                    </button>
                                </div>
                            )
                        })}
                     </div>
                 </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Bidding History ({sortedBids.length} bids)</h3>
                
                {booth.status === 'Sold' && booth.winner && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-bold text-slate-800 mb-2">Winner Information</h4>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <InfoItem label="Winning Vendor" value={<span className="font-bold text-slate-900">{booth.winner}</span>} />
                                <InfoItem label="Final Price" value={<span className="font-bold text-slate-900">${booth.currentBid?.toFixed(2)}</span>} />
                            </div>
                            <div className="flex items-center justify-end gap-2 flex-shrink-0 w-full sm:w-auto">
                                {booth.paymentConfirmed ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-600"/>
                                            <span className="font-semibold text-green-700">Payment Confirmed</span>
                                        </div>
                                        <button onClick={() => handleRevoke(booth.id)} className="bg-red-500 text-white font-semibold px-3 py-1 text-xs rounded-md hover:bg-red-600 transition-colors shadow-sm">
                                            Revoke
                                        </button>
                                    </>
                                ) : booth.paymentSubmitted ? (
                                    <button onClick={() => handleAdminConfirmPayment(booth.id)} className="bg-green-500 text-white font-semibold px-3 py-1.5 text-sm rounded-md hover:bg-green-600 transition-colors shadow-sm">
                                        Confirm Payment
                                    </button>
                                ) : (
                                    <span className="font-semibold text-blue-700">Awaiting Payment</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
                                    const isWinningBid = booth.winner === bid.vendorName && booth.currentBid === bid.bidAmount;
                                    const vendorDetails = VENDOR_DETAILS[bid.vendorName as keyof typeof VENDOR_DETAILS];

                                    return(
                                        <React.Fragment key={bid.id}>
                                            <tr className={`border-b border-slate-200 ${isSelected ? 'bg-pink-50' : ''} ${isWinningBid ? "bg-blue-50" : (index === 0 && booth.status === 'Open' ? "bg-green-50" : "")}`}>
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
                                                </td>
                                            </tr>
                                            {isSelected && vendorDetails && (
                                                <tr className="border-b border-slate-200">
                                                    <td colSpan={5} className="p-4 bg-slate-50 animate-fade-in">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                            <div>
                                                                <h4 className="text-md font-bold text-slate-800 mb-3">Bid Details</h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                                    <InfoItem label="Bid Amount" value={`$${selectedBid.bidAmount.toFixed(2)}`} />
                                                                    <InfoItem label="Electrical Circuits" value={`${selectedBid.circuits} circuit(s)`} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-md font-bold text-slate-800 mb-3">Vendor Business Details</h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                                    <InfoItem label="Business Name" value={vendorDetails.businessName} />
                                                                    <InfoItem label="Contact Person" value={vendorDetails.contactPerson} />
                                                                    <InfoItem label="Contact Email" value={vendorDetails.email} />
                                                                    <InfoItem label="Contact Phone" value={vendorDetails.phone} />
                                                                </div>
                                                            </div>
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