import React, { useState, useEffect, useContext } from 'react';
import { Booth } from './BoothManagement';
import { BiddingContext } from '../context/BiddingContext';
import { ArrowLeftIcon, InfoIcon } from './icons';
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
    biddingPaymentMethod: 'Admin approve' as Booth['biddingPaymentMethod'],
    isBiddingEnabled: true,
    allowBuyout: true,
    hideBiddingPrice: false,
    hideIncrementValue: false,
    circuitLimit: '',
    allowDirectAssignment: false,
};

export const CreateEditBoothPage: React.FC<CreateEditBoothPageProps> = ({ onSave, onCancel, boothToEdit = null }) => {
    const { locations, bids, eventStatus } = useContext(BiddingContext);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormData, string>>>({});
    
    const isEditing = boothToEdit !== null;
    const hasBids = isEditing && boothToEdit && (bids[boothToEdit.id] || []).length > 0;
    const isLiveAuction = isEditing && boothToEdit && boothToEdit.status === 'Open' && hasBids;


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
                biddingPaymentMethod: boothToEdit.biddingPaymentMethod || 'Admin approve',
                basePrice: String(boothToEdit.basePrice),
                buyOutPrice: String(boothToEdit.buyOutPrice),
                increment: String(boothToEdit.increment),
                bidEndDate: boothToEdit.bidEndDate ? new Date(boothToEdit.bidEndDate).toISOString().slice(0, 16) : '',
                isBiddingEnabled: boothToEdit.isBiddingEnabled,
                allowBuyout: boothToEdit.allowBuyout ?? true,
                hideBiddingPrice: boothToEdit.hideBiddingPrice || false,
                hideIncrementValue: boothToEdit.hideIncrementValue || false,
                circuitLimit: boothToEdit.circuitLimit !== undefined ? String(boothToEdit.circuitLimit) : '',
                allowDirectAssignment: boothToEdit.allowDirectAssignment || false,
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

    const handleToggleChange = (name: keyof typeof initialFormData) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof typeof initialFormData, string>> = {};
        if (!formData.title.trim()) newErrors.title = "Booth title is required";
        if (!formData.size.trim()) newErrors.size = "Booth size is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        
        if (formData.isBiddingEnabled) {
            if (isNaN(parseFloat(formData.basePrice)) || parseFloat(formData.basePrice) <= 0) newErrors.basePrice = "Must be a positive number";
            if (isNaN(parseFloat(formData.increment)) || parseFloat(formData.increment) <= 0) newErrors.increment = "Must be a positive number";
            if (!formData.bidEndDate) newErrors.bidEndDate = "Bid end date is required";
        }

        if (formData.allowBuyout) {
            if (isNaN(parseFloat(formData.buyOutPrice)) || parseFloat(formData.buyOutPrice) <= 0) newErrors.buyOutPrice = "Must be a positive number";
        }


        if (formData.circuitLimit && (isNaN(parseInt(formData.circuitLimit)) || parseInt(formData.circuitLimit) < 0)) {
            newErrors.circuitLimit = "Must be a non-negative number";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const submissionData = {
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                buyOutPrice: parseFloat(formData.buyOutPrice) || 0,
                increment: parseFloat(formData.increment) || 0,
                circuitLimit: formData.circuitLimit ? parseInt(formData.circuitLimit) : undefined,
                bidEndDate: formData.isBiddingEnabled ? new Date(formData.bidEndDate).toISOString() : '',
                status: (formData.isBiddingEnabled || formData.allowBuyout) ? formData.status : 'Closed' as Booth['status'],
            };

            if (isEditing && boothToEdit) {
                onSave({ ...submissionData, id: boothToEdit.id });
            } else {
                onSave(submissionData);
            }
        }
    };

    const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { name: keyof typeof initialFormData, label: string }> = ({ name, label, ...props }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
            <input 
                name={name} 
                id={name} 
                value={formData[name]} 
                onChange={handleChange}
                disabled={ (isLiveAuction && ['basePrice', 'increment'].includes(name)) || (name === 'buyOutPrice' && isLiveAuction && eventStatus !== 'paused') }
                className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors[name] ? 'border-red-500' : 'border-slate-300'} disabled:bg-slate-100 disabled:cursor-not-allowed`}
                {...props}
            />
            {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit Booth' : 'Create New Booth'}</h2>
            </div>

            {isLiveAuction && (
                <div className="mb-6 p-4 bg-amber-50 text-amber-800 border-l-4 border-amber-400 rounded-r-lg">
                    <div className="flex">
                        <div className="py-1"><InfoIcon className="h-5 w-5 text-amber-500 mr-3" /></div>
                        <div>
                            <p className="font-bold">This is a live auction with active bids.</p>
                            {eventStatus === 'paused' ? (
                                <p className="text-sm">Bidding is globally paused, so you may edit the Buyout Price. Base Price and Bid Increment remain locked for fairness.</p>
                            ) : (
                                <p className="text-sm">To ensure fairness, critical financial fields (Base Price, Buyout Price, Bid Increment) are disabled. To edit the Buyout Price, you must first pause all bidding activity from the Settings page.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Section 1: Basic Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Basic Information</h3>
                    <InputField name="title" label="Title" type="text" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700">Type</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black">
                                <option>Food</option>
                                <option>Exhibitor</option>
                                <option>Sponsors</option>
                            </select>
                        </div>
                        <InputField name="size" label="Size" type="text" placeholder="e.g., 10x10, 10x20" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                        <select id="location" name="location" value={formData.location} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-white text-black ${errors.location ? 'border-red-500' : 'border border-slate-300 focus:border-pink-500 focus:ring-pink-500'}`}>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black" placeholder="Add a description..."></textarea>
                    </div>
                </div>

                {/* Section 2: Pricing & Bidding */}
                {(formData.isBiddingEnabled || formData.allowBuyout) && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Pricing & Methods</h3>
                        {formData.isBiddingEnabled && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField name="basePrice" label="Base Price ($)" type="number" placeholder="800" />
                                    <InputField name="increment" label="Bid Increment ($)" type="number" placeholder="50" />
                                </div>
                                <InputField name="bidEndDate" label="Bid end date and time" type="datetime-local" />
                                <div>
                                    <label htmlFor="biddingPaymentMethod" className="block text-sm font-medium text-slate-700">Bidding Payment Method</label>
                                    <select id="biddingPaymentMethod" name="biddingPaymentMethod" value={formData.biddingPaymentMethod} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2">
                                        <option value="Admin approve">Admin approve</option>
                                        <option value="Direct pay">Direct pay</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        {formData.allowBuyout && (
                             <div className="space-y-6">
                                <InputField name="buyOutPrice" label="Buyout Price ($)" type="number" placeholder="1500" />
                                <div>
                                    <label htmlFor="buyoutMethod" className="block text-sm font-medium text-slate-700">Buyout Method</label>
                                    <select id="buyoutMethod" name="buyoutMethod" value={formData.buyoutMethod} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2">
                                        <option value="Admin approve">Admin approve</option>
                                        <option value="Direct pay">Direct pay</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* Section 3: Configuration & Visibility */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Configuration & Visibility</h3>
                    <ToggleSwitch
                        label="Allow Bidding on this Booth"
                        description="Enables auction-style bidding. If disabled, vendors cannot place bids."
                        enabled={formData.isBiddingEnabled}
                        onChange={() => handleToggleChange('isBiddingEnabled')}
                    />
                    <ToggleSwitch
                        label="Allow Buyout for Vendors"
                        description="Enables immediate purchase at a fixed price. If both are disabled, booth is for admin assignment only."
                        enabled={formData.allowBuyout}
                        onChange={() => handleToggleChange('allowBuyout')}
                    />
                    {isEditing && (
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2">
                                <option>Open</option>
                                <option>Closed</option>
                                <option>Sold</option>
                            </select>
                        </div>
                    )}
                    <InputField name="circuitLimit" label="Electrical Circuit Limit" type="number" placeholder="Leave blank for no limit" />

                    <ToggleSwitch
                        label="Show Pricing"
                        description="Show base price and current bid to vendors on the main card."
                        enabled={!formData.hideBiddingPrice}
                        onChange={() => handleToggleChange('hideBiddingPrice')}
                    />
                    <ToggleSwitch
                        label="Show Bid Increment"
                        description="Show the bid increment amount to vendors."
                        enabled={!formData.hideIncrementValue}
                        onChange={() => handleToggleChange('hideIncrementValue')}
                    />
                     <ToggleSwitch
                        label="Allow Direct Assignment"
                        description="Enable assigning this to a vendor without bidding from the Vendor Management module."
                        enabled={formData.allowDirectAssignment}
                        onChange={() => handleToggleChange('allowDirectAssignment')}
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