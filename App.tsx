import React, { useState, useEffect, useContext } from 'react';
import { Header, View } from './components/Header';
import { AdminView } from './components/AdminView';
import { VendorView } from './components/VendorView';
import { BiddingProvider, BiddingContext } from './context/BiddingContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationModal } from './components/NotificationModal';

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('vendor1');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    
    const { notifications } = useContext(BiddingContext);
    const vendorName = view.startsWith('vendor') ? `Vendor ${view.slice(-1)}` : '';
    const vendorNotifications = notifications[vendorName] || [];

    useEffect(() => {
        if (view !== 'admin') {
            setIsSidebarOpen(false);
        }
    }, [view]);

    return (
        <>
            <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
                <Header
                    activeView={view}
                    setView={setView}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    notificationCount={vendorNotifications.length}
                />
                <div className={`container mx-auto max-w-7xl ${view !== 'admin' ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
                    {view === 'vendor1' && <VendorView vendorName="Vendor 1" key="vendor1" onOpenNotifications={() => setIsNotificationModalOpen(true)}/>}
                    {view === 'vendor2' && <VendorView vendorName="Vendor 2" key="vendor2" onOpenNotifications={() => setIsNotificationModalOpen(true)}/>}
                    {view === 'vendor3' && <VendorView vendorName="Vendor 3" key="vendor3" onOpenNotifications={() => setIsNotificationModalOpen(true)}/>}
                    {view === 'admin' && <AdminView isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />}
                </div>
            </div>
            {vendorName && (
                <NotificationModal
                    isOpen={isNotificationModalOpen}
                    onClose={() => setIsNotificationModalOpen(false)}
                    notifications={vendorNotifications}
                />
            )}
        </>
    );
};


const App: React.FC = () => {
  return (
    <ToastProvider>
      <BiddingProvider>
        <AppContent />
      </BiddingProvider>
    </ToastProvider>
  );
};

export default App;