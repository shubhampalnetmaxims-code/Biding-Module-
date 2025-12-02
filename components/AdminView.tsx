import React, { useState, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { BoothManagement } from './BoothManagement';
import { BoothDetails } from './BoothDetails';
import { BiddingContext } from '../context/BiddingContext';
import { LocationManagement } from './LocationManagement';
import { InfoIcon } from './icons';
import { AdminDashboard } from './AdminDashboard';

export type AdminViewType = 'dashboard' | 'booths' | 'locations';

interface AdminViewProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const [activeView, setActiveView] = useState<AdminViewType>('dashboard');
    const [selectedBoothId, setSelectedBoothId] = useState<number | null>(null);
    const { booths, notifications } = useContext(BiddingContext);
    const adminNotifications = notifications['admin'] || [];

    const handleViewBoothDetails = (boothId: number) => {
        setActiveView('booths'); // Ensure we are in the right main view
        setSelectedBoothId(boothId);
    };

    const handleBackToList = () => {
        setSelectedBoothId(null);
    };
    
    const selectedBooth = booths.find(b => b.id === selectedBoothId);

    const handleSidebarItemClick = (view: AdminViewType) => {
        setActiveView(view);
        setSelectedBoothId(null);
        setIsSidebarOpen(false);
    };
    
    const renderContent = () => {
        if (selectedBooth) { // Always show details if a booth is selected, regardless of activeView
            return <BoothDetails booth={selectedBooth} onBack={handleBackToList} />;
        }

        switch (activeView) {
            case 'dashboard':
                return <AdminDashboard setActiveView={setActiveView} onViewDetails={handleViewBoothDetails} />;
            case 'booths':
                return <BoothManagement onViewDetails={handleViewBoothDetails} />;
            case 'locations':
                return <LocationManagement />;
            default:
                return null;
        }
    }

    return (
        <div className="relative">
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            />
            
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar activeView={activeView} setActiveView={handleSidebarItemClick} />
            </div>

            <main className="p-4 sm:p-6 lg:p-8">
                {adminNotifications.length > 0 && activeView === 'dashboard' && ( // Only show notifications on dashboard
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