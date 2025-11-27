import React from 'react';
import { InfoIcon } from './icons';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string | null;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
    if (!isOpen || !message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <InfoIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">An error occurred</h3>
                        <p className="mt-2 text-slate-700">
                           {message}
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50/75 rounded-b-xl flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
