import React from 'react';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">How Bidding Works</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-slate-700">
                   <div className="space-y-2">
                     <h4 className="font-bold text-slate-800">Acquiring a Booth</h4>
                     <p>Booths in the 'Bidding Module' can be acquired in different ways. The available options will be clearly displayed on each booth's detail page:</p>
                      <ul className="list-disc list-inside pl-4 space-y-2 mt-2">
                           <li>
                                <span className="font-semibold">Bidding and Buyout:</span> Some booths allow you to either place a competitive bid or purchase the booth immediately at a fixed "Buyout Price".
                           </li>
                           <li>
                                <span className="font-semibold">Buyout Only:</span> Some booths may only be available for immediate purchase at the "Buyout Price", without a bidding option.
                           </li>
                           <li>
                                <span className="font-semibold">Bidding Only:</span> Other booths are only available through auction-style bidding, and do not have a "Buyout Price".
                           </li>
                       </ul>
                       <p className="text-sm text-slate-600">Always check the booth details to see which options are available to you.</p>
                   </div>
                   <div className="space-y-2">
                        <h4 className="font-bold text-slate-800">Buyout Methods</h4>
                        <p>Some booths offer a "Buy Out" option, allowing you to purchase them immediately for a fixed price. There are two types:</p>
                        <ul className="list-disc list-inside pl-4 space-y-2 mt-2">
                           <li>
                                <span className="font-semibold">Direct Pay:</span> Clicking "Buy Out" will take you directly to a payment screen. Once payment is complete, the booth is yours instantly and removed from the auction.
                           </li>
                           <li>
                                <span className="font-semibold">Admin Approve:</span> Clicking "Buy Out" submits a request to the event administrator.
                               <ul className="list-disc list-inside pl-6 mt-1 text-sm">
                                   <li>When the first buyout request is made, regular bidding on that booth is **paused**.</li>
                                   <li>Other vendors can still submit competing buyout requests for the same booth.</li>
                                   <li>The admin will review all buyout offers and approve a winner. You will be notified of the outcome.</li>
                               </ul>
                           </li>
                        </ul>
                   </div>
                   <div className="space-y-2">
                        <h4 className="font-bold text-slate-800">Placing a Bid</h4>
                        <p>To place a bid, enter an amount that meets or exceeds the required increment over the current highest bid. You can bid on up to 3 booths simultaneously.</p>
                   </div>
                   <div className="space-y-2">
                        <h4 className="font-bold text-slate-800">Electrical Circuits</h4>
                        <p>The number of additional electrical circuits you select will be included in your total cost for both winning bids and buyout purchases.</p>
                   </div>
                </div>
                <div className="p-6 bg-slate-50/75 rounded-b-xl flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};