import React, { useContext, useState } from 'react';
import { BiddingContext } from '../context/BiddingContext';
import { FileTextIcon } from './icons';

export const AuditLog: React.FC = () => {
    const { auditLog } = useContext(BiddingContext);
    const [filter, setFilter] = useState('');

    const filteredLog = auditLog.filter(entry => 
        entry.action.toLowerCase().includes(filter.toLowerCase()) || 
        entry.details.toLowerCase().includes(filter.toLowerCase())
    ).reverse(); // Show most recent first

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Admin Audit Log</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="mb-4">
                    <label htmlFor="audit-filter" className="sr-only">Filter log</label>
                    <input
                        type="text"
                        id="audit-filter"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder="Filter by action or details..."
                        className="w-full max-w-md rounded-md border border-slate-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-3 py-2 bg-white text-black"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredLog.length > 0 ? filteredLog.map(entry => (
                                <tr key={entry.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                                        {entry.action}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {entry.details}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-10 px-6 text-slate-500">
                                        <FileTextIcon className="w-12 h-12 mx-auto text-slate-300" />
                                        <h3 className="mt-2 text-lg font-medium text-slate-800">No Log Entries Found</h3>
                                        <p className="mt-1">There are no log entries matching your filter.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};