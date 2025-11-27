import React, { useState } from 'react';
import { Header, View } from './components/Header';
import { AdminView } from './components/AdminView';
import { VendorView } from './components/VendorView';
import { BiddingProvider } from './context/BiddingContext';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  const [view, setView] = useState<View>('vendor1');

  return (
    <ToastProvider>
      <BiddingProvider>
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
          <Header activeView={view} setView={setView} />
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
            {view === 'vendor1' && <VendorView vendorName="Vendor 1" key="vendor1" />}
            {view === 'vendor2' && <VendorView vendorName="Vendor 2" key="vendor2" />}
            {view === 'admin' && <AdminView />}
          </div>
        </div>
      </BiddingProvider>
    </ToastProvider>
  );
};

export default App;