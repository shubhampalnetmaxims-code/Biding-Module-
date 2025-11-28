import React, { useState, useContext } from 'react';
import { BiddingContext } from '../context/BiddingContext';
import { PlusCircleIcon, TrashIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';
import { useToast } from '../context/ToastContext';

export const LocationManagement: React.FC = () => {
    const { locations, addLocation, deleteLocation } = useContext(BiddingContext);
    const { addToast } = useToast();
    const [newLocation, setNewLocation] = useState('');
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const handleAddLocation = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLocation.trim() === '') {
            addToast('Location name cannot be empty.', 'error');
            return;
        }
        if (locations.some(loc => loc.toLowerCase() === newLocation.trim().toLowerCase())) {
            addToast('This location already exists.', 'error');
            return;
        }
        addLocation(newLocation.trim());
        addToast(`Location "${newLocation.trim()}" added successfully.`, 'success');
        setNewLocation('');
    };

    const handleDelete = (location: string) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Delete Location',
            message: `Are you sure you want to delete the location "${location}"? This may affect booths currently assigned to this location.`,
            onConfirm: () => {
                deleteLocation(location);
                addToast(`Location "${location}" deleted.`, 'info');
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Manage Locations</h2>
                <form onSubmit={handleAddLocation} className="flex flex-col sm:flex-row items-start gap-3 mb-6">
                    <div className="w-full">
                        <label htmlFor="new-location" className="sr-only">New Location</label>
                        <input
                            id="new-location"
                            type="text"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            placeholder="Enter a new location name"
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black"
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Add Location</span>
                    </button>
                </form>

                <h3 className="text-lg font-bold text-slate-800 mb-3">Existing Locations</h3>
                <div className="space-y-2">
                    {locations.length > 0 ? (
                        locations.sort().map(location => (
                            <div key={location} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                                <span className="font-medium text-slate-700">{location}</span>
                                <button onClick={() => handleDelete(location)} className="text-slate-500 hover:text-red-600 transition-colors" aria-label={`Delete ${location}`}>
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-sm">No locations have been added yet.</p>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                confirmText="Delete"
            />
        </div>
    );
};