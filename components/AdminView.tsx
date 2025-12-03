import React, { useState, useContext, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BoothManagement } from './BoothManagement';
import { BoothDetails } from './BoothDetails';
import { BiddingContext } from '../context/BiddingContext';
import { LocationManagement } from './LocationManagement';
import { InfoIcon } from './icons';
import { AdminDashboard } from './AdminDashboard';
import { CreateEditBoothPage } from './CreateEditBoothPage';
import { Booth } from './BoothManagement';
import { Settings } from './Settings';
import { VendorManagement } from './VendorManagement';
import { NotifyVendors } from './NotifyVendors';

export type AdminViewType = 'dashboard' | 'booths' | 'locations' | 'vendorManagement' | 'notify' | 'settings';

interface AdminViewProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const [activeView, setActiveView] = useState<AdminViewType>('dashboard');
    const [boothViewMode, setBoothViewMode] = useState<'list' | 'details' | 'create' | 'edit'>('list');
    const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
    const { booths, notifications, addBooth, updateBooth, setGoToEditBooth } = useContext(BiddingContext);
    const adminNotifications = notifications['admin'] || [];

    const handleViewBoothDetails = (boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (booth) {
            setSelectedBooth(booth);
            setBoothViewMode('details');
            setActiveView('booths');
        }
    };

    const handleBackToList = () => {
        setSelectedBooth(null);
        setBoothViewMode('list');
    };
    
    const handleGoToCreate = () => {
        setSelectedBooth(null);
        setBoothViewMode('create');
    };
    
    const handleGoToEdit = (booth: Booth) => {
        setSelectedBooth(booth);
        setBoothViewMode('edit');
        setActiveView('booths'); // Ensure we are on the booths page
    };

    useEffect(() => {
        setGoToEditBooth(() => handleGoToEdit);
    }, [setGoToEditBooth]);


    const handleSaveBooth = (boothData: Omit<Booth, 'id'> | Booth) => {
        if ('id' in boothData) {
            updateBooth(boothData.id, boothData);
        } else {
            addBooth(boothData);
        }
        handleBackToList();
    };

    const handleSidebarItemClick = (view: AdminViewType) => {
        setActiveView(view);
        setBoothViewMode('list'); // Reset to list when changing main view
        setSelectedBooth(null);
        setIsSidebarOpen(false);
    };
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <AdminDashboard setActiveView={setActiveView} onViewDetails={handleViewBoothDetails} />;
            case 'locations':
                return <LocationManagement />;
            case 'vendorManagement':
                return <VendorManagement />;
            case 'notify':
                return <NotifyVendors />;
            case 'settings':
                return <Settings />;
            case 'booths':
                switch (boothViewMode) {
                    case 'list':
                        return <BoothManagement onViewDetails={handleViewBoothDetails} onGoToCreate={handleGoToCreate} onGoToEdit={handleGoToEdit} />;
                    case 'details':
                        return selectedBooth ? <BoothDetails booth={selectedBooth} onBack={handleBackToList} /> : null;
                    case 'create':
                        return <CreateEditBoothPage onSave={handleSaveBooth} onCancel={handleBackToList} />;
                    case 'edit':
                        return selectedBooth ? <CreateEditBoothPage boothToEdit={selectedBooth} onSave={handleSaveBooth} onCancel={handleBackToList} /> : null;
                    default:
                        return null;
                }
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