
import React, { useState, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { BoothManagement } from './BoothManagement';
import { BoothDetails } from './BoothDetails';
import { BiddingContext } from '../context/BiddingContext';

export const AdminView: React.FC = () => {
    const [selectedBoothId, setSelectedBoothId] = useState<number | null>(null);
    const { booths } = useContext(BiddingContext);

    const handleViewBoothDetails = (boothId: number) => {
        setSelectedBoothId(boothId);
    };

    const handleBackToList = () => {
        setSelectedBoothId(null);
    };
    
    const selectedBooth = booths.find(b => b.id === selectedBoothId);

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1">
                {selectedBooth ? (
                    <BoothDetails booth={selectedBooth} onBack={handleBackToList} />
                ) : (
                    <BoothManagement onViewDetails={handleViewBoothDetails} />
                )}
            </main>
        </div>
    );
};
