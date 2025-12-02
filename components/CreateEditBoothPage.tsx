import React, { useState, useEffect, useContext } from 'react';
import { Booth } from './BoothManagement';
import { BiddingContext } from '../context/BiddingContext';
import { ArrowLeftIcon } from './icons';
import { ToggleSwitch } from './ToggleSwitch';

interface CreateEditBoothPageProps {
    onSave: (booth: Omit<Booth, 'id'> | Booth) => void;
    onCancel: () => void;
    boothToEdit?: Booth | null;
}

const initialFormData = {
    title: '',
    type: 'Food' as Booth['type'],
    size: '',
    status: 'Open' as Booth['status'],
    location: '',
    basePrice: '',
    buyOutPrice: '',
    increment: '',
    bidEndDate: '',
    description: '',
    buyoutMethod: 'Admin approve' as Booth['buyoutMethod'],
    hideBiddingPrice: false,
};

export const CreateEditBoothPage: React.FC<CreateEditBoothPageProps> = ({ onSave, onCancel, boothToEdit = null }) => {
    const { locations } = useContext(BiddingContext);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormData, string>>>({});
    
    const isEditing = boothToEdit !== null;

    useEffect(() => {
        if (isEditing && boothToEdit) {
            setFormData({
                title: boothToEdit.title,
                type: boothToEdit.type,
                size: boothToEdit.size,
                status: boothToEdit.status,
                location: boothToEdit.location,
                description: boothToEdit.description,
                buyoutMethod: boothToEdit.buyoutMethod,
                basePrice: String(boothToEdit.basePrice),
                buyOutPrice: String(boothToEdit.buyOutPrice),
                increment: String(boothToEdit.increment),
                bidEndDate: boothToEdit.bidEndDate,
                hideBiddingPrice: boothToEdit.hideBiddingPrice || false,
            });
        } else {
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
        const newErrors: Partial<Record<keyof typeof initialFormData, string>> = {};
        if (!formData.title.trim()) newErrors.title = "Booth title is required";
        if (!formData.size.trim()) newErrors.size = "Booth size is required";
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

            if (isEditing && boothToEdit) {
                onSave({ ...submissionData, id: boothToEdit.id });
            } else {
                onSave(submissionData);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit Booth' : 'Create New Booth'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Booth Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700">Type</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                                <option>Food</option>
                                <option>Exhibitor</option>
                                <option>Sponsors</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-slate-700">Size</label>
                            <input
                                type="text"
                                name="size"
                                id="size"
                                value={formData.size}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.size ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`}
                                placeholder="e.g., 10x10, 10x20"
                            />
                            {errors.size && <p className="mt-1 text-xs text-red-600">{errors.size}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                        <select id="location" name="location" value={formData.location} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`}>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                            <option>Open</option>
                            <option>Closed</option>
                            <option>Sold</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-slate-700">Base Price ($)</label>
                            <input type="number" name="basePrice" id="basePrice" value={formData.basePrice} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.basePrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="500" />
                            {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>}
                        </div>
                         <div>
                            <label htmlFor="increment" className="block text-sm font-medium text-slate-700">Bid Increment ($)</label>
                            <input type="number" name="increment" id="increment" value={formData.increment} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.increment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="50" />
                            {errors.increment && <p className="mt-1 text-xs text-red-600">{errors.increment}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="buyOutPrice" className="block text-sm font-medium text-slate-700">Buy Out Price ($)</label>
                            <input type="number" name="buyOutPrice" id="buyOutPrice" value={formData.buyOutPrice} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.buyOutPrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="1000" />
                            {errors.buyOutPrice && <p className="mt-1 text-xs text-red-600">{errors.buyOutPrice}</p>}
                        </div>
                        <div>
                            <label htmlFor="buyoutMethod" className="block text-sm font-medium text-slate-700">Buyout Method</label>
                            <select id="buyoutMethod" name="buyoutMethod" value={formData.buyoutMethod} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                                <option value="Admin approve">Admin approve</option>
                                <option value="Direct pay">Direct pay</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="bidEndDate" className="block text-sm font-medium text-slate-700">Bid end date and time</label>
                        <input type="datetime-local" name="bidEndDate" id="bidEndDate" value={formData.bidEndDate} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.bidEndDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`} />
                        {errors.bidEndDate && <p className="mt-1 text-xs text-red-600">{errors.bidEndDate}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black" placeholder="Add a description for the booth..."></textarea>
                    </div>

                    <ToggleSwitch
                        label="Hide Prices on Card"
                        description="When enabled, vendors won't see the current bid or buyout price on the main card view."
                        enabled={formData.hideBiddingPrice}
                        onChange={() => setFormData(prev => ({ ...prev, hideBiddingPrice: !prev.hideBiddingPrice }))}
                    />
                </div>
                <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
                        Save Booth
                    </button>
                </div>
            </form>
        </div>
    );
};