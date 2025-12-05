import React, { useContext } from 'react';
import { Booth } from './BoothManagement';
import { EditIcon, TrashIcon, ExclamationTriangleIcon, DollarSignIcon, ClockIcon } from './icons';
import { CountdownTimer } from './CountdownTimer';
import { BiddingContext } from '../context/BiddingContext';

interface BoothTableProps {
    booths: Booth[];
    onEdit: (booth: Booth) => void;
    onDelete: (boothId: number) => void;
    onRestore: (boothId: number) => void;
    onViewDetails: (boothId: number) => void;
    selectedBooths: number[];
    onSelectAll: () => void;
    onSelectOne: (boothId: number) => void;
    isArchivedView?: boolean;
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

export const BoothTable: React.FC<BoothTableProps> = ({ booths, onEdit, onDelete, onRestore, onViewDetails, selectedBooths, onSelectAll, onSelectOne, isArchivedView = false }) => {
    const { buyoutRequests, highlightedBooth } = useContext(BiddingContext);
    
    const getRowClass = (booth: Booth, isSelected: boolean) => {
        if (isSelected) return 'bg-pink-50 hover:bg-pink-100';
        if (isArchivedView) return 'bg-slate-50/50 hover:bg-slate-100';

        const hasPendingBuyout = (buyoutRequests[booth.id] || []).length > 0;
        if (hasPendingBuyout) return 'bg-yellow-50 hover:bg-yellow-100';
        
        const isAwaitingPayment = booth.paymentSubmitted && !booth.paymentConfirmed;
        if (isAwaitingPayment) return 'bg-blue-50 hover:bg-blue-100';

        const timeLeft = +new Date(booth.bidEndDate) - +new Date();
        const hoursLeft = timeLeft / (1000 * 60 * 60);
        if (booth.status === 'Open' && hoursLeft > 0 && hoursLeft < 24) return 'bg-red-50 hover:bg-red-100';
        
        return 'hover:bg-slate-50';
    };
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                           <input 
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                                checked={booths.length > 0 && selectedBooths.length === booths.length}
                                onChange={onSelectAll}
                                aria-label="Select all booths"
                                disabled={isArchivedView}
                           />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Booth Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Bid</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bid End Date</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {booths.map((booth) => {
                        const isSelected = selectedBooths.includes(booth.id);
                        const hasPendingBuyout = (buyoutRequests[booth.id] || []).length > 0;
                        const isAwaitingPayment = booth.paymentSubmitted && !booth.paymentConfirmed;
                        const isHighlighted = highlightedBooth === booth.id;
                        
                        return (
                            <tr key={booth.id} className={`${getRowClass(booth, isSelected)} ${isHighlighted ? 'highlight-bid' : ''} transition-colors`}>
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                                        checked={isSelected}
                                        onChange={() => onSelectOne(booth.id)}
                                        aria-label={`Select booth ${booth.title}`}
                                        disabled={isArchivedView}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <span onClick={() => onViewDetails(booth.id)} className="cursor-pointer hover:text-pink-600 hover:underline">
                                            {booth.title}
                                        </span>
                                        {hasPendingBuyout && <span title="Pending Buyout Request"><ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" /></span>}
                                        {isAwaitingPayment && <span title="Awaiting Payment Confirmation"><DollarSignIcon className="w-4 h-4 text-blue-500" /></span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">${(booth.currentBid || booth.basePrice).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booth.status)}`}>
                                        {booth.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booth.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booth.size}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {booth.status === 'Open' ? <CountdownTimer endDate={booth.bidEndDate}/> : formatDate(booth.bidEndDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isArchivedView ? (
                                        <button onClick={() => onRestore(booth.id)} className="font-semibold text-green-600 hover:text-green-800 transition-colors">
                                            Unarchive
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => onEdit(booth)} className="text-slate-500 hover:text-pink-600 transition-colors" aria-label="Edit Booth">
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onDelete(booth.id)} className="text-slate-500 hover:text-red-600 transition-colors" aria-label="Delete Booth">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};