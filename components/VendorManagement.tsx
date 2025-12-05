import React, { useState, useContext, useMemo } from 'react';
import { BiddingContext, VENDOR_DETAILS } from '../context/BiddingContext';
import { Booth } from './BoothManagement';
import { ConfirmationModal } from './ConfirmationModal';
import { useToast } from '../context/ToastContext';
import { InfoIcon, EditIcon } from './icons';
import { InfoItem } from './InfoItem';

// Modal to show assigned vendor details
const VendorInfoModal: React.FC<{ isOpen: boolean; onClose: () => void; vendorName: string | null }> = ({ isOpen, onClose, vendorName }) => {
    if (!isOpen || !vendorName) return null;
    const vendorDetails = VENDOR_DETAILS[vendorName as keyof typeof VENDOR_DETAILS];
    if (!vendorDetails) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">{vendorDetails.businessName}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem label="Contact Person" value={vendorDetails.contactPerson} />
                    <InfoItem label="Contact Email" value={vendorDetails.email} />
                    <InfoItem label="Contact Phone" value={vendorDetails.phone} />
                </div>
                <div className="p-4 bg-slate-50/75 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal to show assigned booth details
const AssignedBoothDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; booth: Booth | null; onEdit: (booth: Booth) => void; }> = ({ isOpen, onClose, booth, onEdit }) => {
    if (!isOpen || !booth) return null;
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">{booth.title}</h3>
                    <button onClick={() => onEdit(booth)} className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-800 transition-colors">
                        <EditIcon className="w-4 h-4"/> Edit
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem label="Status" value={booth.status} />
                    <InfoItem label="Assigned To" value={booth.winner || '-'} />
                    <InfoItem label="Final Price" value={`$${booth.currentBid?.toFixed(2)}`} />
                    <InfoItem label="Location" value={booth.location} />
                    <InfoItem label="Size" value={booth.size} />
                    <InfoItem label="Type" value={booth.type} />
                </div>
                <div className="p-4 bg-slate-50/75 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}


export const VendorManagement: React.FC = () => {
    const { booths, assignBoothToVendor, unassignBooth, goToEditBooth } = useContext(BiddingContext);
    const { addToast } = useToast();

    const [selectedBoothId, setSelectedBoothId] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('Vendor 1');
    const [negotiatedPrice, setNegotiatedPrice] = useState('');
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [viewingVendor, setViewingVendor] = useState<string | null>(null);
    const [viewingBooth, setViewingBooth] = useState<Booth | null>(null);

    const VENDORS = ['Vendor 1', 'Vendor 2', 'Vendor 3'];

    const { assignedBooths, unassignedBooths } = useMemo(() => {
        const assigned = booths.filter(b => b.winner);
        const unassigned = booths.filter(b => !b.winner && b.allowDirectAssignment);
        return { assignedBooths: assigned, unassignedBooths: unassigned };
    }, [booths]);

    const handleAssign = () => {
        const price = parseFloat(negotiatedPrice);
        if (!selectedBoothId || !selectedVendor) {
            addToast('Please select both a booth and a vendor.', 'error');
            return;
        }
        if (isNaN(price) || price <= 0) {
            addToast('Please enter a valid negotiated price.', 'error');
            return;
        }

        const booth = unassignedBooths.find(b => b.id === parseInt(selectedBoothId));
        if (!booth) return;
        
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Assignment',
            message: `Are you sure you want to assign "${booth.title}" to ${selectedVendor} for $${price.toFixed(2)}? This will mark the booth as sold.`,
            onConfirm: () => {
                assignBoothToVendor(parseInt(selectedBoothId), selectedVendor, price);
                addToast(`Booth assigned successfully to ${selectedVendor}.`, 'success');
                setSelectedBoothId('');
                setNegotiatedPrice('');
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };
    
    const handleUnassign = (booth: Booth) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Unassignment',
            message: `Are you sure you want to unassign "${booth.title}" from ${booth.winner}? The booth will become available again.`,
            onConfirm: () => {
                unassignBooth(booth.id);
                addToast(`Booth unassigned successfully.`, 'info');
                setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    const handleEditBooth = (booth: Booth) => {
        setViewingBooth(null); // Close modal
        goToEditBooth(booth);
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Vendor Management</h2>

            {/* Section 1: Assign a Booth */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Assign a Booth</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4">
                    <div className="lg:col-span-1">
                        <label htmlFor="booth-select" className="block text-sm font-medium text-slate-700 mb-1">Select Booth</label>
                        <select id="booth-select" value={selectedBoothId} onChange={(e) => setSelectedBoothId(e.target.value)} className="w-full rounded-md border-slate-300">
                            <option value="">-- Choose a booth --</option>
                            {unassignedBooths.map(booth => <option key={booth.id} value={booth.id}>{booth.title}</option>)}
                        </select>
                    </div>
                     <div className="lg:col-span-1">
                        <label htmlFor="vendor-select" className="block text-sm font-medium text-slate-700 mb-1">Assign to Vendor</label>
                        <select id="vendor-select" value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="w-full rounded-md border-slate-300">
                            {VENDORS.map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="negotiated-price" className="block text-sm font-medium text-slate-700 mb-1">Negotiated Price ($)</label>
                        <input type="number" id="negotiated-price" value={negotiatedPrice} onChange={(e) => setNegotiatedPrice(e.target.value)} placeholder="e.g., 500.00" className="w-full rounded-md border-slate-300"/>
                    </div>
                    <div className="lg:col-span-1">
                        <button onClick={handleAssign} disabled={!selectedBoothId || !selectedVendor || !negotiatedPrice} className="w-full bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 shadow-sm disabled:bg-slate-400">
                            Assign Booth
                        </button>
                    </div>
                </div>
                {unassignedBooths.length === 0 && (
                     <p className="text-sm text-slate-500 mt-4">
                        <InfoIcon className="inline w-4 h-4 mr-1 text-slate-400" />
                        There are no unassigned booths available for direct assignment. Enable "Allow Direct Assignment" in a booth's settings to make it appear here.
                    </p>
                )}
            </div>
            
            {/* Section 2: Assigned Booths */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Assigned Booths ({assignedBooths.length})</h3>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Booth Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Vendor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Price</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                             {assignedBooths.map(booth => (
                                <tr key={booth.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        <span onClick={() => setViewingBooth(booth)} className="cursor-pointer hover:text-pink-600 hover:underline">
                                            {booth.title}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">
                                        <span onClick={() => setViewingVendor(booth.winner || null)} className="cursor-pointer hover:text-pink-600 hover:underline">
                                            {booth.winner}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${booth.currentBid?.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleUnassign(booth)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">
                                            Unassign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {assignedBooths.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No booths are currently assigned to a vendor.</p>}
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
            />
            <VendorInfoModal isOpen={!!viewingVendor} onClose={() => setViewingVendor(null)} vendorName={viewingVendor} />
            <AssignedBoothDetailModal isOpen={!!viewingBooth} onClose={() => setViewingBooth(null)} booth={viewingBooth} onEdit={handleEditBooth} />
        </div>
    );
};