import React, { useState, useContext } from 'react';
import { BiddingContext } from '../context/BiddingContext';
import { useToast } from '../context/ToastContext';
import { BellIcon } from './icons';

export const NotifyVendors: React.FC = () => {
    const { notifyAllVendors, broadcastHistory } = useContext(BiddingContext);
    const { addToast } = useToast();
    const [message, setMessage] = useState('');

    const handleSendNotification = () => {
        if (message.trim() === '') {
            addToast('Message cannot be empty.', 'error');
            return;
        }

        notifyAllVendors(message.trim());
        addToast('Notification sent to all vendors successfully!', 'success');
        setMessage('');
    };
    
    const handleReuseMessage = (oldMessage: string) => {
        setMessage(oldMessage);
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Notify All Vendors</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <div className="max-w-2xl">
                    <div>
                        <label htmlFor="notification-message" className="block text-sm font-medium text-slate-700">
                            Notification Message
                        </label>
                        <textarea
                            id="notification-message"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here... This will be broadcast to all vendors on their dashboard."
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        />
                    </div>
                     <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSendNotification}
                            disabled={!message.trim()}
                            className="flex items-center gap-2 bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            <BellIcon className="w-5 h-5" />
                            <span>Send Notification</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Broadcast History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {broadcastHistory.length > 0 ? (
                        [...broadcastHistory].reverse().map((item, index) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-700">{item.message}</p>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                                    <span className="text-xs text-slate-500">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </span>
                                    <button onClick={() => handleReuseMessage(item.message)} className="text-xs font-semibold text-pink-600 hover:underline">
                                        Reuse Message
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500">No broadcast messages have been sent yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};