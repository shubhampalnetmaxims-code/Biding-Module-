import React, { useState, useEffect, useContext } from 'react';
import { Booth } from './BoothManagement';
import { BiddingContext } from '../context/BiddingContext';

interface SaveBoothModalProps {
    onClose: () => void;
    onSave: (booth: Omit<Booth, 'id'> | Booth) => void;
    boothToEdit: Booth | null;
}

const initialFormData = {
    title: '',
    type: '',
    status: 'Open' as Booth['status'],
    location: '',
    basePrice: '',
    buyOutPrice: '',
    increment: '',
    bidEndDate: '',
    description: '',
    buyoutMethod: 'Admin approve' as Booth['buyoutMethod'],
};

export const SaveBoothModal: React.FC<SaveBoothModalProps> = ({ onClose, onSave, boothToEdit }) => {
    const { locations } = useContext(BiddingContext);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Partial<typeof formData>>({});
    
    const isEditing = boothToEdit !== null;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                ...boothToEdit,
                basePrice: String(boothToEdit.basePrice),
                buyOutPrice: String(boothToEdit.buyOutPrice),
                increment: String(boothToEdit.increment),
            });
        } else {
            // Set default location to the first available location if not editing
            setFormData({
                ...initialFormData,
                location: locations[0] || ''
            });
        }
    }, [boothToEdit, isEditing, locations]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const validate = () => {
        const newErrors: Partial<typeof formData> = {};
        if (!formData.title.trim()) newErrors.title = "Booth title is required";
        if (!formData.type.trim()) newErrors.type = "Booth type is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (isNaN(parseFloat(formData.basePrice)) || parseFloat(formData.basePrice) <= 0) newErrors.basePrice = "Must be a positive number";
        if (isNaN(parseFloat(formData.buyOutPrice)) || parseFloat(formData.buyOutPrice) <= 0) newErrors.buyOutPrice = "Must be a positive number";
        if (isNaN(parseFloat(formData.increment)) || parseFloat(formData.increment) <= 0) newErrors.increment = "Must be a positive number";
        if (!formData.bidEndDate) newErrors.bidEndDate = "Bid end date is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const submissionData = {
                ...formData,
                basePrice: parseFloat(formData.basePrice),
                buyOutPrice: parseFloat(formData.buyOutPrice),
                increment: parseFloat(formData.increment),
            };

            if (isEditing) {
                onSave({ ...submissionData, id: boothToEdit.id });
            } else {
                onSave(submissionData);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Booth' : 'Create New Booth'}</h3>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Booth Title</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white text-black ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-slate-700">Type</label>
                                <input
                                    type="text"
                                    name="type"
                                    id="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white text-black ${errors.type ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`}
                                    placeholder="e.g., Food, Craft, Service"
                                />
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black">
                                    <option>Open</option>
                                    <option>Closed</option>
                                    <option>Sold</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                            <select id="location" name="location" value={formData.location} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white text-black ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`}>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="basePrice" className="block text-sm font-medium text-slate-700">Base Price ($)</label>
                                <input type="number" name="basePrice" id="basePrice" value={formData.basePrice} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white text-black ${errors.basePrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="500" />
                                {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>}
                            </div>
                             <div>
                                <label htmlFor="increment" className="block text-sm font-medium text-slate-700">Bid Increment ($)</label>
                                <input type="number" name="increment" id="increment" value={formData.increment} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white text-black ${errors.increment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="50" />
                                {errors.increment && <p className="mt-1 text-xs text-red-600">{errors.increment}</p>}
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="buyOutPrice" className="block text-sm font-medium text-slate-700">Buy Out Price ($)</label>
                                <input type="number" name="buyOutPrice" id="buyOutPrice" value={formData.buyOutPrice} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white text-black ${errors.buyOutPrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="1000" />
                                {errors.buyOutPrice && <p className="mt-1 text-xs text-red-600">{errors.buyOutPrice}</p>}
                            </div>
                            <div>
                                <label htmlFor="buyoutMethod" className="block text-sm font-medium text-slate-700">Buyout Method</label>
                                <select id="buyoutMethod" name="buyoutMethod" value={formData.buyoutMethod} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black">
                                    <option value="Admin approve">Admin approve</option>
                                    <option value="Direct pay">Direct pay</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="bidEndDate" className="block text-sm font-medium text-slate-700">Bid end date and time</label>
                            <input type="datetime-local" name="bidEndDate" id="bidEndDate" value={formData.bidEndDate} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white text-black ${errors.bidEndDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} />
                            {errors.bidEndDate && <p className="mt-1 text-xs text-red-600">{errors.bidEndDate}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white text-black" placeholder="Add a description for the booth..."></textarea>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50/75 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
                            Save Booth
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};