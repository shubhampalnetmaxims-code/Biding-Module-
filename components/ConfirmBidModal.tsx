import React from 'react';
import { Booth } from './BoothManagement';
import { InfoItem } from './InfoItem';

interface BidDetails {
    vendorName: string;
    bidAmount: number;
    circuits: number;
}

interface ConfirmBidModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    booth: Booth | null;
    bid: BidDetails | null;
}

export const ConfirmBidModal: React.FC<ConfirmBidModalProps> = ({ isOpen, onClose, onConfirm, booth, bid }) => {
    if (!isOpen || !booth || !bid) return null;

    const totalPayable = bid.bidAmount + (bid.circuits * 60);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">Confirm Bid Winner</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to confirm <span className="font-bold">{bid.vendorName}</span> as the winner for the booth <span className="font-bold">{booth.name}</span>? This action cannot be undone.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                        <InfoItem label="Vendor" value={bid.vendorName} />
                        <InfoItem label="Bid Amount" value={`$${bid.bidAmount.toFixed(2)}`} />
                        <InfoItem label="Electrical Circuits" value={`${bid.circuits} circuit(s)`} />
                        <div className="pt-2 border-t border-slate-200">
                             <p className="text-sm text-slate-500">Total Payable</p>
                             <p className="font-bold text-slate-800 text-lg mt-1">${totalPayable.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-slate-50/75 rounded-b-xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
                        Confirm Winner
                    </button>
                </div>
            </div>
        </div>
    );
};
