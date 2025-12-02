import React, { useState, useEffect } from 'react';
import { Header, View } from './components/Header';
import { AdminView } from './components/AdminView';
import { VendorView } from './components/VendorView';
import { BiddingProvider } from './context/BiddingContext';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  const [view, setView] = useState<View>('vendor1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Automatically close the sidebar when the view changes from admin to vendor
    if (view !== 'admin') {
      setIsSidebarOpen(false);
    }
  }, [view]);

  return (
    <ToastProvider>
      <BiddingProvider>
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
          <Header
            activeView={view}
            setView={setView}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <div className={`container mx-auto max-w-7xl ${view !== 'admin' ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
            {view === 'vendor1' && <VendorView vendorName="Vendor 1" key="vendor1" />}
            {view === 'vendor2' && <VendorView vendorName="Vendor 2" key="vendor2" />}
            {view === 'vendor3' && <VendorView vendorName="Vendor 3" key="vendor3" />}
            {view === 'admin' && <AdminView isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />}
          </div>
        </div>
      </BiddingProvider>
    </ToastProvider>
  );
};

export default App;