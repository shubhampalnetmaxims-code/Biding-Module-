import React, { useState, useContext } from 'react';
import { PlusCircleIcon } from './icons';
import { BoothTable } from './BoothTable';
import { SaveBoothModal } from './CreateBoothModal';
import { BiddingContext } from '../context/BiddingContext';
import { ConfirmationModal } from './ConfirmationModal';

export interface Booth {
    id: number;
    name: string;
    type: string;
    status: 'Open' | 'Closed' | 'Sold';
    location: string;
    basePrice: number;
    buyOutPrice: number;
    bidEndDate: string;
    description: string;
    increment: number;
    winner?: string;
    currentBid?: number;
    paymentConfirmed?: boolean;
    paymentSubmitted?: boolean;
}

interface BoothManagementProps {
    onViewDetails: (boothId: number) => void;
}

export const BoothManagement: React.FC<BoothManagementProps> = ({ onViewDetails }) => {
    const { booths, addBooth, updateBooth, deleteBooth } = useContext(BiddingContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const handleCreate = () => {
        setEditingBooth(null);
        setIsModalOpen(true);
    };

    const handleEdit = (booth: Booth) => {
        setEditingBooth(booth);
        setIsModalOpen(true);
    };

    const handleDelete = (boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;

        setConfirmModalState({
            isOpen: true,
            title: 'Delete Booth',
            message: `Are you sure you want to delete the booth "${booth.name}"? This action cannot be undone.`,
            onConfirm: () => {
                deleteBooth(boothId);
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    const handleSave = (boothData: Omit<Booth, 'id'> | Booth) => {
        if ('id' in boothData) {
            updateBooth(boothData.id, boothData);
        } else {
            addBooth(boothData);
        }
        setIsModalOpen(false);
        setEditingBooth(null);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Bidding Booths</h2>
                <button 
                    onClick={handleCreate}
                    className="flex-shrink-0 flex items-center gap-2 bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Create Booth</span>
                </button>
            </div>
            
            <BoothTable booths={booths} onEdit={handleEdit} onDelete={handleDelete} onViewDetails={onViewDetails} />

            {isModalOpen && (
                <SaveBoothModal
                    boothToEdit={editingBooth}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingBooth(null);
                    }}
                    onSave={handleSave}
                />
            )}
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