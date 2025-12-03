import React, { useState, useContext, useEffect } from 'react';
import { Booth } from './BoothManagement';
import { BiddingContext } from '../context/BiddingContext';
import { useToast } from '../context/ToastContext';
import { LocationPinIcon, QuestionMarkCircleIcon, TrendingUpIcon, DollarSignIcon, InfoIcon, ArrowLeftIcon } from './icons';
import { CountdownTimer } from './CountdownTimer';
import { ConfirmationModal } from './ConfirmationModal';
import { PaymentModal } from './PaymentModal';
import { ErrorModal } from './ErrorModal';
import { BiddingLimitModal } from './BiddingLimitModal';

interface VendorBoothDetailPageProps {
    booth: Booth;
    vendorName: string;
    onBack: () => void;
}

export const VendorBoothDetailPage: React.FC<VendorBoothDetailPageProps> = ({ booth, vendorName, onBack }) => {
    const { placeBid, removeBid, userBids, requestBuyOut, buyoutRequests, bids } = useContext(BiddingContext);
    const { addToast } = useToast();

    const [bidInput, setBidInput] = useState('');
    const [selectedCircuits, setSelectedCircuits] = useState(0);
    const [bidError, setBidError] = useState<string | null>(null);
    const [isBiddingLimitModalOpen, setIsBiddingLimitModalOpen] = useState(false);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
    const [paymentModalState, setPaymentModalState] = useState<{isOpen: boolean, booth: Booth | null}>({isOpen: false, booth: null});
    
    useEffect(() => {
        if (booth) {
            const userBidDetails = userBids[vendorName]?.[booth.id];
            setSelectedCircuits(userBidDetails?.circuits || 0);
            setBidInput('');
            setBidError(null);
        }
    }, [booth, vendorName, userBids]);

    if (!booth) return null;

    const vendorBidData = userBids[vendorName] || {};
    const userBidDetails = vendorBidData[booth.id];
    
    const highestBid = booth.currentBid || booth.basePrice;
    const nextMinBid = highestBid + booth.increment;
    
    const hasAnyPendingBuyout = booth.buyoutMethod === 'Admin approve' && (buyoutRequests[booth.id] || []).length > 0;
    const hasVendorRequestedBuyout = (buyoutRequests[booth.id] || []).some(req => req.vendorName === vendorName);
    const isBiddingEnded = booth.isBiddingEnabled && new Date(booth.bidEndDate).getTime() < new Date().getTime();
    
    const maxCircuits = booth.circuitLimit ?? 20;
    const circuitOptions = Array.from({ length: maxCircuits + 1 }, (_, i) => i);

    const vendorBiddingHistory = (bids[booth.id] || [])
        .filter(b => b.vendorName === vendorName)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handlePlaceBid = () => {
        if (selectedCircuits < 1 && booth.type === 'Food') {
            setBidError("Food vendors must select at least 1 electrical circuit to place a bid.");
            return;
        }

        const bidValue = parseFloat(bidInput);
        if (isNaN(bidValue) || bidInput === '') {
            setBidError("Please enter a valid bid amount.");
            return;
        }

        const result = placeBid(vendorName, booth.id, bidValue, selectedCircuits);
        if (result.success) {
            addToast(result.message, 'success');
            setBidInput('');
        } else {
            if (result.message === "Bidding limit reached.") {
                setIsBiddingLimitModalOpen(true);
            } else {
                setBidError(result.message);
            }
        }
    };

    const handleBuyOut = () => {
        if (selectedCircuits < 1 && booth.type === 'Food') {
            setBidError("Food vendors must select at least 1 electrical circuit to request a buyout.");
            return;
        }
        
        const totalPayable = booth.buyOutPrice + (selectedCircuits * 60);

        if (booth.buyoutMethod === 'Direct pay') {
            setConfirmModalState({
                isOpen: true,
                title: 'Confirm Direct Buy Out',
                message: `You are about to purchase ${booth.title} for a total of $${totalPayable.toFixed(2)}. Do you want to proceed to payment?`,
                onConfirm: () => {
                    setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
                    setPaymentModalState({ isOpen: true, booth: booth });
                },
                confirmText: 'Proceed to Payment'
            });
        } else { // Admin approve
            setConfirmModalState({
                isOpen: true,
                title: 'Request Buy Out',
                message: `Are you sure you want to request to buy out ${booth.title} for $${booth.buyOutPrice.toFixed(2)}? This request will include your selection of ${selectedCircuits} additional circuit(s). An admin will review your request.`,
                onConfirm: () => {
                    requestBuyOut(vendorName, booth.id, selectedCircuits);
                    addToast('Buy out request sent to admin for approval.', 'success');
                    setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
                },
                confirmText: 'Request Buy Out'
            });
        }
    };

    const handleRemoveBid = () => {
        setConfirmModalState({
            isOpen: true,
            title: 'Remove Bid',
            message: `Are you sure you want to remove your bid for "${booth.title}"? This will free up one of your bidding slots but cannot be undone.`,
            onConfirm: () => {
                const result = removeBid(vendorName, booth.id);
                if (result.success) {
                    addToast(result.message, 'success');
                } else {
                    setBidError(result.message);
                }
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
            },
            confirmText: 'Remove Bid'
        });
    };
    
    const buyoutTooltip = booth.buyoutMethod === 'Admin approve' 
        ? 'Admin must approve your buyout request. Bidding will be paused while requests are reviewed.' 
        : 'Instantly purchase the booth by proceeding to payment. The booth will be yours immediately.';
    
    const showPlaceBidButton = !hasAnyPendingBuyout && booth.isBiddingEnabled;
    const showBuyOutButton = booth.allowBuyout && !hasVendorRequestedBuyout;
    const useTwoColumnLayout = showPlaceBidButton && showBuyOutButton;
    
    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 text-slate-600 font-semibold">
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Back to Bidding Module</span>
                    </button>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Section: Details & Actions */}
                    <div className="w-full lg:w-3/5 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                             <div className="p-6">
                                <h3 className="text-2xl font-bold text-slate-900">{booth.title} <span className="text-lg font-medium text-slate-500">({booth.type} - {booth.size})</span></h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                                    <LocationPinIcon className="w-4 h-4" />
                                    <span>{booth.location}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-4">{booth.description}</p>
                                
                                <div className={`mt-4 bg-slate-50 rounded-lg p-4 space-y-2 text-sm`}>
                                    {booth.isBiddingEnabled && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Current Bid:</span>
                                            <span className="font-bold text-slate-800 text-base">${highestBid.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {booth.allowBuyout &&
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Buy Out Price:</span>
                                            <span className="font-bold text-pink-600">${booth.buyOutPrice.toFixed(2)}</span>
                                        </div>
                                    }
                                    {booth.allowBuyout && (
                                        <div className="flex justify-between items-center text-slate-500">
                                            <div className="flex items-center gap-1.5" title={buyoutTooltip}>
                                                <QuestionMarkCircleIcon className="w-4 h-4 cursor-help" />
                                                <span>Buyout Type:</span>
                                            </div>
                                            <span className="font-medium text-slate-600">{booth.buyoutMethod}</span>
                                        </div>
                                    )}
                                    {booth.isBiddingEnabled && !booth.hideIncrementValue && (
                                        <div className="flex justify-between items-center text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUpIcon className="w-4 h-4" />
                                                <span>Increment:</span>
                                            </div>
                                            <span className="font-medium text-slate-600">${booth.increment.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {booth.isBiddingEnabled && (
                                        <div className="pt-2 border-t border-slate-200">
                                            <CountdownTimer endDate={booth.bidEndDate} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50/75 rounded-b-xl">
                                {isBiddingEnded ? (
                                    <p className="font-bold text-slate-700 text-center">Bidding has ended.</p>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="circuits-modal" className="block text-sm font-medium text-slate-700 mb-1">
                                                Electrical Circuits 
                                                <span className="inline-block ml-1" title="Each circuit costs $60."><InfoIcon className="w-4 h-4 text-slate-400 cursor-help" /></span>
                                            </label>
                                            <select 
                                                id="circuits-modal" 
                                                value={selectedCircuits} 
                                                onChange={(e) => setSelectedCircuits(parseInt(e.target.value, 10))} 
                                                className="w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black"
                                            >
                                                {circuitOptions.map(i => (
                                                    <option key={i} value={i}>{i}</option>
                                                ))}
                                            </select>
                                            {maxCircuits < 20 && <p className="text-xs text-slate-500 mt-1">Admin has set a limit of {maxCircuits} circuit(s) for this booth.</p>}
                                        </div>
                                        
                                        {booth.isBiddingEnabled && (
                                            hasAnyPendingBuyout ? (
                                                <div className="text-center p-2 bg-yellow-100 text-yellow-800 rounded-md font-semibold text-sm">Bidding is paused due to a pending buyout request.</div>
                                            ) : (
                                                <div>
                                                    <label htmlFor={`bid-modal-${booth.id}`} className="block text-sm font-medium text-slate-700 mb-2">{userBidDetails ? 'Increase Your Bid' : 'Your Bid'}</label>
                                                    <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-md mb-3 text-sm">
                                                        Suggested bid: <span className="font-bold">${nextMinBid.toFixed(2)}</span> or higher.
                                                    </div>
                                                    <div className="relative">
                                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><DollarSignIcon className="h-5 w-5 text-slate-400" /></div>
                                                        <input type="number" id={`bid-modal-${booth.id}`} value={bidInput} onChange={(e) => setBidInput(e.target.value)} placeholder={nextMinBid.toFixed(2)} className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-lg font-semibold text-slate-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white" step={booth.increment} min={nextMinBid} />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                        
                                        {hasVendorRequestedBuyout ? (
                                            <div className="mt-3 text-center p-2 bg-blue-100 text-blue-800 rounded-md font-semibold text-sm">Buyout Requested</div>
                                        ) : (
                                            <div className={`mt-3 ${useTwoColumnLayout ? 'grid grid-cols-2 gap-3' : 'grid'}`}>
                                                {showPlaceBidButton && (
                                                    <button onClick={handlePlaceBid} disabled={!bidInput} className="w-full bg-slate-700 text-white font-semibold px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm disabled:bg-slate-400 disabled:cursor-not-allowed">Place Bid</button>
                                                )}
                                                {showBuyOutButton && <button onClick={handleBuyOut} className="w-full bg-pink-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors shadow-sm text-sm">Buy Out</button>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Bidding History */}
                    <div className="w-full lg:w-2/5">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">My Bidding History</h3>
                            {userBidDetails && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm mb-4">
                                    <h4 className="font-bold text-blue-800 mb-2 text-center">My Current Bid</h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between"><span className="text-slate-600">My Last Bid:</span><span className="font-semibold text-slate-800">${userBidDetails.bidAmount.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-600">Electrical Circuits ({userBidDetails.circuits}):</span><span className="font-semibold text-slate-800">${(userBidDetails.circuits * 60).toFixed(2)}</span></div>
                                        <div className="flex justify-between pt-1 border-t border-blue-200 mt-1"><span className="font-bold text-slate-700">Total Bid Value:</span><span className="font-bold text-slate-900">${(userBidDetails.bidAmount + userBidDetails.circuits * 60).toFixed(2)}</span></div>
                                    </div>
                                    {!hasAnyPendingBuyout && (
                                        <div className="mt-2 pt-2 border-t border-blue-200"><button onClick={handleRemoveBid} className="w-full text-center text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 py-1 rounded-md transition-colors">Remove My Bid</button></div>
                                    )}
                                </div>
                            )}

                            {vendorBiddingHistory.length > 0 ? (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                    {vendorBiddingHistory.map((bid, index) => (
                                        <div key={bid.id} className={`p-3 rounded-lg border ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                            <div className="flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="font-semibold text-slate-800">${bid.bidAmount.toFixed(2)}</span>
                                                    <span className="text-slate-500 ml-2">({bid.circuits} circuits)</span>
                                                </div>
                                                {index === 0 && <span className="text-xs font-bold text-green-700">LATEST BID</span>}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(bid.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">You have not placed any bids on this booth yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <BiddingLimitModal isOpen={isBiddingLimitModalOpen} onClose={() => setIsBiddingLimitModalOpen(false)} />
            <ErrorModal isOpen={!!bidError} onClose={() => setBidError(null)} message={bidError} />
            <ConfirmationModal isOpen={confirmModalState.isOpen} onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' })} onConfirm={confirmModalState.onConfirm} title={confirmModalState.title} message={confirmModalState.message} confirmText={confirmModalState.confirmText} />
            <PaymentModal isOpen={paymentModalState.isOpen} onClose={() => setPaymentModalState({isOpen: false, booth: null})} booth={paymentModalState.booth} circuits={selectedCircuits} vendorName={vendorName} />
        </>
    );
};