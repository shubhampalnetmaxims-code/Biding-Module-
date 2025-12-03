import React from 'react';

interface ChangeBoothInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangeBoothInfoModal: React.FC<ChangeBoothInfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">Help & Support</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-slate-700">
                        For any questions or requests, including changing your booth, please contact the event administrator directly. 
                        Please provide your business name and the details of the booth you have won.
                    </p>
                    <div className="text-sm">
                        <p><span className="font-semibold text-slate-800">Email:</span> <a href="mailto:admin@gmail.com" className="text-blue-600 hover:underline">admin@gmail.com</a></p>
                        <p><span className="font-semibold text-slate-800">Phone:</span> +1 (555) 123-4567</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-50/75 rounded-b-xl flex justify-end">
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