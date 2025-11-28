import React, { useContext } from 'react';
import { Booth } from './BoothManagement';
import { EditIcon, TrashIcon, ExclamationTriangleIcon, DollarSignIcon, ClockIcon } from './icons';
import { CountdownTimer } from './CountdownTimer';
import { BiddingContext } from '../context/BiddingContext';

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
    const { buyoutRequests } = useContext(BiddingContext);
    
    const getRowClass = (booth: Booth) => {
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Booth Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Bid</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bid End Date</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {booths.map((booth) => {
                        const hasPendingBuyout = (buyoutRequests[booth.id] || []).length > 0;
                        const isAwaitingPayment = booth.paymentSubmitted && !booth.paymentConfirmed;
                        
                        return (
                            <tr key={booth.id} className={`${getRowClass(booth)} transition-colors`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <span onClick={() => onViewDetails(booth.id)} className="cursor-pointer hover:text-pink-600 hover:underline">
                                            {booth.title}
                                        </span>
                                        {/* FIX: Wrap icon in a span with a title attribute for tooltip, as the icon component does not accept a 'title' prop. */}
                                        {hasPendingBuyout && <span title="Pending Buyout Request"><ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" /></span>}
                                        {/* FIX: Wrap icon in a span with a title attribute for tooltip, as the icon component does not accept a 'title' prop. */}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {booth.status === 'Open' ? <CountdownTimer endDate={booth.bidEndDate}/> : formatDate(booth.bidEndDate)}
                                </td>
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
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};