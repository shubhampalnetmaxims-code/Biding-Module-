import React, { useState, useContext } from 'react';
import { Booth } from './BoothManagement';
import { BiddingContext } from '../context/BiddingContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    booth: Booth | null;
    circuits: number;
    vendorName: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, booth, circuits, vendorName }) => {
    const { directBuyOut } = useContext(BiddingContext);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !booth) return null;

    const totalPayable = booth.buyOutPrice + (circuits * 60);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            directBuyOut(vendorName, booth.id, circuits);
            setIsProcessing(false);
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handlePayment}>
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900">Complete Your Payment</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <h4 className="font-bold text-slate-800">Order Summary</h4>
                            <div className="mt-2 bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">{booth.title} (Buy Out)</span>
                                    <span className="font-medium text-slate-800">${booth.buyOutPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Electrical Circuits ({circuits} x $60)</span>
                                    <span className="font-medium text-slate-800">${(circuits * 60).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="font-bold text-slate-700">Total Amount Due</span>
                                    <span className="font-bold text-pink-600 text-lg">${totalPayable.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-800">Payment Details</h4>
                            <div className="mt-2 space-y-4">
                                <div>
                                    <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700">Card Number</label>
                                    <input type="text" name="cardNumber" id="cardNumber" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black" placeholder="•••• •••• •••• 4242" defaultValue="4242424242424242" required/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700">Expiry Date</label>
                                        <input type="text" name="expiryDate" id="expiryDate" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black" placeholder="MM / YY" defaultValue="12/26" required />
                                    </div>
                                     <div>
                                        <label htmlFor="cvc" className="block text-sm font-medium text-slate-700">CVC</label>
                                        <input type="text" name="cvc" id="cvc" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black" placeholder="•••" defaultValue="123" required />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50/75 rounded-b-xl flex justify-end gap-3">
                         <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors" disabled={isProcessing}>
                            Cancel
                        </button>
                        <button type="submit" className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm w-40 flex justify-center items-center" disabled={isProcessing}>
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : `Pay $${totalPayable.toFixed(2)}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};