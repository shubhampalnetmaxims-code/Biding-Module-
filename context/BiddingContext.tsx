import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Booth } from '../components/BoothManagement';

// --- INITIAL MOCK DATA ---
const initialBoothsData: Booth[] = [
    { id: 1, title: 'Food Stall A1', type: '10x20', status: 'Open', location: 'Zone A', basePrice: 500, buyOutPrice: 1000, bidEndDate: '2025-07-01T17:00', description: 'Premium spot near the main stage.', increment: 50, buyoutMethod: 'Admin approve', currentBid: 650 },
    { id: 2, title: 'Craft Corner B3', type: '10x10', status: 'Closed', location: 'Zone B', basePrice: 250, buyOutPrice: 600, bidEndDate: '2025-06-28T17:00', description: 'Corner booth with high foot traffic.', increment: 25, buyoutMethod: 'Direct pay' },
    { id: 3, title: 'Info Point C2', type: '10x10', status: 'Sold', location: 'Zone C', basePrice: 100, buyOutPrice: 300, bidEndDate: '2025-06-25T17:00', description: 'Central location, ideal for services.', increment: 10, buyoutMethod: 'Admin approve', winner: 'Vendor 2', currentBid: 120, paymentSubmitted: true, paymentConfirmed: true },
    { id: 4, title: 'Artisan Row A2', type: '10x10', status: 'Open', location: 'Zone A', basePrice: 300, buyOutPrice: 750, bidEndDate: '2025-07-02T18:00', description: 'Excellent visibility on the main walkway.', increment: 25, buyoutMethod: 'Direct pay', currentBid: 325 },
    { id: 5, title: 'Taco Truck Fiesta', type: '10x20', status: 'Open', location: 'Food Court', basePrice: 700, buyOutPrice: 1500, bidEndDate: '2025-07-03T12:00', description: 'Large space suitable for a food truck.', increment: 50, buyoutMethod: 'Admin approve', currentBid: 750 },
    { id: 6, title: 'Handmade Jewelry', type: '10x10', status: 'Open', location: 'Artisan Row', basePrice: 200, buyOutPrice: 500, bidEndDate: '2025-07-02T19:00', description: 'Small booth perfect for delicate items.', increment: 20, buyoutMethod: 'Direct pay' },
    { id: 7, title: 'Local Charity Info', type: '10x10', status: 'Open', location: 'Community Zone', basePrice: 50, buyOutPrice: 150, bidEndDate: '2025-06-30T17:00', description: 'Discounted rate for non-profits.', increment: 5, buyoutMethod: 'Admin approve' },
    { id: 8, title: 'Gourmet Coffee Cart', type: '10x10', status: 'Sold', location: 'Entrance', basePrice: 400, buyOutPrice: 900, bidEndDate: '2025-06-29T17:00', description: 'High traffic area near the main entrance.', increment: 25, buyoutMethod: 'Direct pay', winner: 'Vendor 1', currentBid: 500, paymentSubmitted: true, paymentConfirmed: false },
];

const initialLocationsData = Array.from(new Set(initialBoothsData.map(b => b.location)));

interface UserBidDetails {
    bidAmount: number;
    circuits: number;
}
interface UserBids {
    [vendorName: string]: { [boothId: string]: UserBidDetails };
}

interface Bid extends UserBidDetails {
    id: number;
    vendorName: string;
    timestamp: string;
}
interface AllBids {
    [boothId: string]: Bid[];
}

const initialBidsData: AllBids = {
    '1': [
        { id: 101, vendorName: 'Vendor 1', bidAmount: 550, circuits: 1, timestamp: '2025-06-20T10:00:00Z' },
        { id: 102, vendorName: 'Vendor 2', bidAmount: 600, circuits: 2, timestamp: '2025-06-20T11:30:00Z' },
        { id: 103, vendorName: 'Vendor 1', bidAmount: 650, circuits: 1, timestamp: '2025-06-21T09:00:00Z' },
    ],
    '4': [
        { id: 401, vendorName: 'Vendor 2', bidAmount: 325, circuits: 0, timestamp: '2025-06-22T14:00:00Z' },
    ],
    '3': [
        { id: 301, vendorName: 'Vendor 2', bidAmount: 120, circuits: 0, timestamp: '2025-06-24T10:00:00Z' },
    ],
    '5': [
        { id: 501, vendorName: 'Vendor 2', bidAmount: 750, circuits: 3, timestamp: '2025-06-25T11:00:00Z' },
    ],
    '8': [
        { id: 801, vendorName: 'Vendor 1', bidAmount: 450, circuits: 1, timestamp: '2025-06-26T10:00:00Z' },
        { id: 802, vendorName: 'Vendor 2', bidAmount: 475, circuits: 1, timestamp: '2025-06-26T12:00:00Z' },
        { id: 803, vendorName: 'Vendor 1', bidAmount: 500, circuits: 1, timestamp: '2025-06-27T14:00:00Z' },
    ]
};

const initialUserBidsData: UserBids = {
    'Vendor 1': {
        '1': { bidAmount: 650, circuits: 1 },
        '8': { bidAmount: 500, circuits: 1 },
    },
    'Vendor 2': {
        '1': { bidAmount: 600, circuits: 2 },
        '4': { bidAmount: 325, circuits: 0 },
        '3': { bidAmount: 120, circuits: 0 },
        '5': { bidAmount: 750, circuits: 3 },
        '8': { bidAmount: 475, circuits: 1 },
    }
}

interface Notification {
    title: string;
    message: string;
}
interface AllNotifications {
    [vendorName: string]: Notification[];
}

interface BiddingContextType {
    booths: Booth[];
    bids: AllBids;
    userBids: UserBids;
    notifications: AllNotifications;
    locations: string[];
    addLocation: (location: string) => void;
    deleteLocation: (location: string) => void;
    placeBid: (vendorName: string, boothId: number, amount: number, circuits: number) => { success: boolean, message: string };
    requestBuyOut: (vendorName: string, boothId: number) => void;
    directBuyOut: (vendorName: string, boothId: number, circuits: number) => void;
    confirmBid: (boothId: number, winningBidId: number) => void;
    addBooth: (booth: Omit<Booth, 'id'>) => void;
    updateBooth: (boothId: number, updatedBooth: Booth) => void;
    deleteBooth: (boothId: number) => void;
    submitPayment: (boothId: number) => void;
    confirmPayment: (boothId: number) => void;
    revokeBid: (boothId: number) => void;
}

export const BiddingContext = createContext<BiddingContextType>(null!);

export const BiddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [booths, setBooths] = useState<Booth[]>(initialBoothsData);
    const [bids, setBids] = useState<AllBids>(initialBidsData);
    const [userBids, setUserBids] = useState<UserBids>(initialUserBidsData);
    const [notifications, setNotifications] = useState<AllNotifications>({ 'admin': [] });
    const [locations, setLocations] = useState<string[]>(initialLocationsData);

    const addNotification = useCallback((vendorName: string, title: string, message: string) => {
        setNotifications(prev => ({
            ...prev,
            [vendorName]: [...(prev[vendorName] || []), { title, message }]
        }));
    }, []);
    
    const placeBid = useCallback((vendorName: string, boothId: number, amount: number, circuits: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return { success: false, message: "Booth not found." };
        if (booth.status !== 'Open') return { success: false, message: "Bidding for this booth is closed." };

        const currentHighestBid = booth.currentBid || booth.basePrice;
        if (amount < currentHighestBid + booth.increment) {
            return { success: false, message: `Your bid must be at least $${(currentHighestBid + booth.increment).toFixed(2)}.` };
        }

        const vendorActiveBids = userBids[vendorName] || {};
        const hasAlreadyBid = vendorActiveBids.hasOwnProperty(boothId);
        const openBidsCount = Object.keys(vendorActiveBids).filter(id => {
            const b = booths.find(booth => booth.id === parseInt(id as string, 10));
            return b && b.status === 'Open';
        }).length;

        if(openBidsCount >= 3 && !hasAlreadyBid) {
            return { success: false, message: "You can only bid on a maximum of 3 open booths." };
        }

        const newBid: Bid = { id: Date.now(), vendorName, bidAmount: amount, circuits, timestamp: new Date().toISOString() };
        setBids(prev => ({
            ...prev,
            [boothId]: [...(prev[boothId] || []), newBid]
        }));
        
        setUserBids(prev => ({
            ...prev,
            [vendorName]: { ...(prev[vendorName] || {}), [boothId]: { bidAmount: amount, circuits } }
        }));
        
        setBooths(prev => prev.map(b => b.id === boothId ? { ...b, currentBid: amount } : b));

        return { success: true, message: `Successfully placed a bid of $${amount.toFixed(2)} for ${booth.title}!` };
    }, [booths, userBids]);

    const requestBuyOut = useCallback((vendorName: string, boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;
        addNotification('admin', 'Buy Out Request', `${vendorName} has requested to buy out "${booth.title}" for $${booth.buyOutPrice.toFixed(2)}.`);
    }, [booths, addNotification]);

    const directBuyOut = useCallback((vendorName: string, boothId: number, circuits: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth || booth.status !== 'Open') return;
        
        setBooths(prev => prev.map(b => 
            b.id === boothId 
                ? { 
                    ...b, 
                    status: 'Sold', 
                    winner: vendorName, 
                    currentBid: b.buyOutPrice, 
                    paymentSubmitted: true, 
                    paymentConfirmed: true 
                  }
                : b
        ));
        
        addNotification(
            vendorName, 
            'Purchase Successful!', 
            `You have successfully purchased "${booth.title}" for $${booth.buyOutPrice.toFixed(2)}. Your payment is confirmed.`
        );
        
        addNotification(
            'admin', 
            'Booth Sold (Direct Pay)', 
            `"${booth.title}" has been sold to ${vendorName} for $${booth.buyOutPrice.toFixed(2)} via direct payment.`
        );
    }, [booths, addNotification]);

    const confirmBid = useCallback((boothId: number, winningBidId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;
        
        const boothBids = bids[boothId] || [];
        const winningBid = boothBids.find(b => b.id === winningBidId);

        if (!winningBid) {
            console.error("Winning bid not found!");
            return;
        }

        const winnerName = winningBid.vendorName;
        const totalPayable = winningBid.bidAmount + (winningBid.circuits * 60);

        setBooths(prev => prev.map(b => 
            b.id === boothId 
                ? { ...b, status: 'Sold', winner: winnerName, currentBid: winningBid.bidAmount, paymentSubmitted: false, paymentConfirmed: false }
                : b
        ));

        addNotification(
            winnerName,
            'Congratulations! You Won a Bid!',
            `Your bid for "${booth.title}" has been accepted! Please pay the total amount of $${totalPayable.toFixed(2)} within 24 hours to secure your spot.`
        );
        
        const losingBidders: Set<string> = new Set(boothBids
            .filter(b => b.vendorName !== winnerName)
            .map(b => b.vendorName)
        );
        
        losingBidders.forEach(loserName => {
            addNotification(
                loserName,
                'Update on Your Bid',
                `The auction for the booth "${booth.title}" has now closed. Thank you for your participation.`
            );
        });
    }, [booths, bids, addNotification]);

    const submitPayment = useCallback((boothId: number) => {
        setBooths(prev => prev.map(b => 
            b.id === boothId ? { ...b, paymentSubmitted: true } : b
        ));
    }, []);

    const confirmPayment = useCallback((boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if(booth && booth.winner) {
             setBooths(prev => prev.map(b => 
                b.id === boothId ? { ...b, paymentConfirmed: true } : b
            ));
            addNotification(booth.winner, 'Payment Confirmed!', `Your payment for "${booth.title}" has been successfully confirmed by the administrator.`);
        }
    }, [booths, addNotification]);
    
    const revokeBid = useCallback((boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (booth && booth.winner) {
            const revokedWinner = booth.winner;
            setBooths(prev => prev.map(b => {
                if (b.id === boothId) {
                    const { winner, currentBid, paymentConfirmed, paymentSubmitted, ...rest } = b;
                    return { ...rest, status: 'Open', currentBid: b.basePrice };
                }
                return b;
            }));
            addNotification(revokedWinner, 'Bid Revoked', `Unfortunately, your winning bid for "${booth.title}" has been revoked by the administrator. Please contact them for more details.`);
        }
    }, [booths, addNotification]);

    const addBooth = useCallback((boothData: Omit<Booth, 'id'>) => {
        const newBooth: Booth = { ...boothData, id: Date.now() };
        setBooths(prev => [newBooth, ...prev]);
    }, []);

    const updateBooth = useCallback((boothId: number, updatedBooth: Booth) => {
        setBooths(prev => prev.map(b => b.id === boothId ? updatedBooth : b));
    }, []);

    const deleteBooth = useCallback((boothId: number) => {
        setBooths(prev => prev.filter(b => b.id !== boothId));
    }, []);

    const addLocation = useCallback((location: string) => {
        if (location && !locations.includes(location)) {
            setLocations(prev => [...prev, location]);
        }
    }, [locations]);

    const deleteLocation = useCallback((locationToDelete: string) => {
        setLocations(prev => prev.filter(loc => loc !== locationToDelete));
        // Optional: Also handle what happens to booths with this location
        setBooths(prev => prev.map(b => b.location === locationToDelete ? { ...b, location: '' } : b));
    }, []);


    return (
        <BiddingContext.Provider value={{ booths, bids, userBids, notifications, locations, addLocation, deleteLocation, placeBid, requestBuyOut, directBuyOut, confirmBid, addBooth, updateBooth, deleteBooth, submitPayment, confirmPayment, revokeBid }}>
            {children}
        </BiddingContext.Provider>
    );
};