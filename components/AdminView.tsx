import React, { useState, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { BoothManagement } from './BoothManagement';
import { BoothDetails } from './BoothDetails';
import { BiddingContext } from '../context/BiddingContext';
import { LocationManagement } from './LocationManagement';
import { InfoIcon } from './icons';

export type AdminViewType = 'booths' | 'locations';

interface AdminViewProps {
    isSidebarOpen: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({ isSidebarOpen }) => {
    const [activeView, setActiveView] = useState<AdminViewType>('booths');
    const [selectedBoothId, setSelectedBoothId] = useState<number | null>(null);
    const { booths, notifications } = useContext(BiddingContext);
    const adminNotifications = notifications['admin'] || [];

    const handleViewBoothDetails = (boothId: number) => {
        setSelectedBoothId(boothId);
    };

    const handleBackToList = () => {
        setSelectedBoothId(null);
    };
    
    const selectedBooth = booths.find(b => b.id === selectedBoothId);
    
    const renderContent = () => {
        if (activeView === 'booths') {
             if (selectedBooth) {
                return <BoothDetails booth={selectedBooth} onBack={handleBackToList} />;
            }
            return <BoothManagement onViewDetails={handleViewBoothDetails} />;
        }
        if (activeView === 'locations') {
            return <LocationManagement />;
        }
        return null;
    }

    return (
        <div className="flex">
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
                <div className="w-64">
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
                </div>
            </div>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {adminNotifications.length > 0 && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-md space-y-3 mb-6" role="alert">
                        <h3 className="font-bold text-lg">Admin Notifications</h3>
                        {adminNotifications.map((note, index) => (
                            <div key={index} className="flex">
                                <div className="py-1 flex-shrink-0"><InfoIcon className="h-5 w-5 text-blue-500 mr-3" /></div>
                                <div>
                                    <p className="font-bold">{note.title}</p>
                                    <p className="text-sm">{note.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};