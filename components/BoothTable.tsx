import React from 'react';
import { Booth } from './BoothManagement';
import { EditIcon, TrashIcon } from './icons';

interface BoothTableProps {
    booths: Booth[];
    onEdit: (booth: Booth) => void;
    onDelete: (boothId: number) => void;
    onViewDetails: (boothId: number) => void;
}

const getStatusBadgeClass = (status: Booth['status']) => {
    switch (status) {
        case 'Open': return 'bg-green-100 text-green-800';
        case 'Closed': return 'bg-red-100 text-red-800';
        case 'Sold': return 'bg-slate-100 text-slate-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(date);
    } catch (e) {
        return dateString; // fallback
    }
};

export const BoothTable: React.FC<BoothTableProps> = ({ booths, onEdit, onDelete, onViewDetails }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Booth Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Base Price ($)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Increment ($)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Buy Out Price ($)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bid End Date</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {booths.map((booth) => (
                        <tr key={booth.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                <span onClick={() => onViewDetails(booth.id)} className="cursor-pointer hover:text-pink-600 hover:underline">
                                    {booth.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booth.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booth.status)}`}>
                                    {booth.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booth.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booth.basePrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booth.increment.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booth.buyOutPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(booth.bidEndDate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => onEdit(booth)} className="text-slate-500 hover:text-pink-600 transition-colors" aria-label="Edit Booth">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(booth.id)} className="text-slate-500 hover:text-red-600 transition-colors" aria-label="Delete Booth">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};