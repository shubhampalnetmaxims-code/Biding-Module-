import React from 'react';
import { InfoIcon, BellIcon } from './icons';

interface Notification {
    title: string;
    message: string;
    type: 'system' | 'broadcast';
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, notifications }) => {
    if (!isOpen) return null;

    const reversedNotifications = [...notifications].reverse();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BellIcon />
                        Notifications
                    </h3>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {reversedNotifications.length > 0 ? (
                        reversedNotifications.map((note, index) => (
                            <div key={index} className={`p-4 rounded-md border-l-4 ${note.type === 'broadcast' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'}`}>
                                <div className="flex">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <InfoIcon className={`h-5 w-5 ${note.type === 'broadcast' ? 'text-yellow-500' : 'text-blue-500'}`} />
                                    </div>
                                    <div className="ml-3">
                                        <p className={`font-bold ${note.type === 'broadcast' ? 'text-yellow-800' : 'text-blue-800'}`}>{note.title}</p>
                                        <p className="mt-1 text-sm text-slate-700">{note.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-8">You have no notifications.</p>
                    )}
                </div>
                <div className="p-4 bg-slate-50/75 rounded-b-xl flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};