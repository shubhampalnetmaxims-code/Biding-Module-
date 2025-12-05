import React, { useContext, useState } from 'react';
import { BiddingContext } from '../context/BiddingContext';
import { ConfirmationModal } from './ConfirmationModal';
import { useToast } from '../context/ToastContext';

export const Settings: React.FC = () => {
    const { eventStatus, setEventStatus } = useContext(BiddingContext);
    const { addToast } = useToast();
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const handlePauseBidding = () => {
        setConfirmModalState({
            isOpen: true,
            title: 'Pause All Bidding',
            message: 'Are you sure you want to pause all bidding? Vendors will not be able to place new bids or request buyouts until you resume.',
            onConfirm: () => {
                setEventStatus('paused');
                addToast('All bidding activity has been paused.', 'info');
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };
    
    const handleResumeBidding = () => {
        setEventStatus('running');
        addToast('Bidding activity has been resumed.', 'success');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Global Event State</h3>
                 <p className="text-sm text-slate-500 mb-4 max-w-2xl">
                    Use these controls to manage the overall state of the bidding event. Pausing the event will temporarily disable all bidding and buyout functions for all vendors.
                </p>

                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-800">Current Event Status</p>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={`w-3 h-3 rounded-full ${eventStatus === 'running' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            <span className="font-bold text-slate-700 uppercase text-sm tracking-wider">
                                {eventStatus}
                            </span>
                        </div>
                    </div>
                     {eventStatus === 'running' ? (
                        <button onClick={handlePauseBidding} className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
                            Pause Bidding
                        </button>
                    ) : (
                        <button onClick={handleResumeBidding} className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                            Resume Bidding
                        </button>
                    )}
                </div>
            </div>
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