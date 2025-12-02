import React from 'react';

interface EventMapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EventMapModal: React.FC<EventMapModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">Event Map</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 bg-slate-50">
                    <div className="aspect-w-16 aspect-h-9">
                        <img 
                            src="https://i.imgur.com/4K4DEb4.png" 
                            alt="Event Map" 
                            className="w-full h-full object-contain rounded-md"
                        />
                    </div>
                </div>
                 <div className="p-4 bg-slate-100 rounded-b-xl flex justify-end">
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