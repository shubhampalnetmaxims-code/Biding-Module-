import React, { useState, useContext } from 'react';
import { BiddingContext } from '../../context/BiddingContext';
import { Booth } from '../BoothManagement';
import { LocationPinIcon, ClockIcon } from '../icons';
import { ChangeBoothInfoModal } from '../ChangeBoothInfoModal';
import { ConfirmationModal } from '../ConfirmationModal';
import { useToast } from '../../context/ToastContext';

interface MyBoothsSectionProps {
    vendorName: string;
}

const WonBoothCard: React.FC<{ booth: Booth; onPaymentSubmit: (id: number) => void; onChangeRequest: () => void; }> = ({ booth, onPaymentSubmit, onChangeRequest }) => {
    const getStatusBadge = () => {
        if (booth.paymentConfirmed) {
            return { text: 'Payment Confirmed', className: 'bg-green-100 text-green-800' };
        }
        if (booth.paymentSubmitted) {
            return { text: 'Awaiting Confirmation', className: 'bg-blue-100 text-blue-800' };
        }
        return { text: 'Awaiting Payment', className: 'bg-amber-100 text-amber-800' };
    };

    const statusBadge = getStatusBadge();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-5">
                <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-lg font-bold text-slate-900 pr-2">
                        {booth.title} <span className="text-base font-medium text-slate-500">({booth.type})</span>
                    </h3>
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                        {statusBadge.text}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <LocationPinIcon className="w-4 h-4" />
                    <span>{booth.location}</span>
                </div>
                <div className={`mt-4 bg-slate-50 rounded-lg p-3 space-y-2 text-sm`}>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Winning Bid:</span>
                        <span className="font-bold text-slate-800 text-base">${booth.currentBid?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" />
                            <span>Bid Ended:</span>
                        </div>
                        <span className="font-medium text-slate-600">{new Date(booth.bidEndDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50/75 p-4 mt-auto rounded-b-xl space-y-3">
                {booth.paymentConfirmed ? (
                    <button
                        onClick={onChangeRequest}
                        className="w-full bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm text-sm"
                    >
                        Change Booth
                    </button>
                ) : booth.paymentSubmitted ? (
                    <button className="w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg cursor-default shadow-sm text-sm" disabled>
                        Payment Submitted
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onPaymentSubmit(booth.id)}
                            className="w-full font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm text-sm bg-green-500 text-white hover:bg-green-600"
                        >
                            Payment Done
                        </button>
                        <button
                            onClick={onChangeRequest}
                            className="w-full bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm text-sm"
                        >
                            Change Booth
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const MyBoothsSection: React.FC<MyBoothsSectionProps> = ({ vendorName }) => {
    const { booths, submitPayment } = useContext(BiddingContext);
    const { addToast } = useToast();
    const [isChangeBoothModalOpen, setIsChangeBoothModalOpen] = useState(false);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const myWonBooths = booths.filter(b => b.status === 'Sold' && b.winner === vendorName);
    const awaitingPaymentBooths = myWonBooths.filter(b => !b.paymentSubmitted && !b.paymentConfirmed);
    const awaitingConfirmationBooths = myWonBooths.filter(b => b.paymentSubmitted && !b.paymentConfirmed);
    const confirmedBooths = myWonBooths.filter(b => b.paymentConfirmed);
    
    const handleSubmitPayment = (boothId: number) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Payment Submission',
            message: 'Have you completed the payment for this booth? This will notify the admin to verify your payment.',
            onConfirm: () => {
                submitPayment(boothId);
                addToast("Payment submitted successfully! The admin will verify your payment shortly.", 'success');
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Awaiting Payment ({awaitingPaymentBooths.length})</h2>
                {awaitingPaymentBooths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {awaitingPaymentBooths.map(booth => (
                            <WonBoothCard
                                key={booth.id}
                                booth={booth}
                                onPaymentSubmit={handleSubmitPayment}
                                onChangeRequest={() => setIsChangeBoothModalOpen(true)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-white rounded-lg border border-slate-200">
                        <h3 className="text-lg font-medium text-slate-800">No Booths Awaiting Payment</h3>
                        <p className="text-slate-500 mt-1">You have no winning bids that are pending payment.</p>
                    </div>
                )}
            </div>
            
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Awaiting Confirmation ({awaitingConfirmationBooths.length})</h2>
                {awaitingConfirmationBooths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {awaitingConfirmationBooths.map(booth => (
                            <WonBoothCard
                                key={booth.id}
                                booth={booth}
                                onPaymentSubmit={handleSubmitPayment}
                                onChangeRequest={() => setIsChangeBoothModalOpen(true)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-white rounded-lg border border-slate-200">
                        <h3 className="text-lg font-medium text-slate-800">No Booths Awaiting Confirmation</h3>
                        <p className="text-slate-500 mt-1">Once you submit payment, booths will appear here until the admin confirms it.</p>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Confirmed ({confirmedBooths.length})</h2>
                {confirmedBooths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {confirmedBooths.map(booth => (
                            <WonBoothCard
                                key={booth.id}
                                booth={booth}
                                onPaymentSubmit={handleSubmitPayment}
                                onChangeRequest={() => setIsChangeBoothModalOpen(true)}
                            />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 px-6 bg-white rounded-lg border border-slate-200">
                        <h3 className="text-lg font-medium text-slate-800">No Confirmed Booths</h3>
                        <p className="text-slate-500 mt-1">You have not completed payment for any won booths yet.</p>
                    </div>
                )}
            </div>

            <ChangeBoothInfoModal 
                isOpen={isChangeBoothModalOpen} 
                onClose={() => setIsChangeBoothModalOpen(false)} 
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