import React, { createContext, useState, ReactNode } from 'react';
import { Booth } from '../components/BoothManagement';

// --- INITIAL MOCK DATA ---
const initialBoothsData: Booth[] = [
    { id: 1, name: 'Food Stall A1', type: 'Food', status: 'Open', location: 'Zone A, Spot 1', basePrice: 500, buyOutPrice: 1000, bidEndDate: '2025-07-01T17:00', description: 'Premium spot near the main stage.', increment: 50, currentBid: 650 },
    { id: 2, name: 'Craft Corner B3', type: 'Craft', status: 'Closed', location: 'Zone B, Spot 3', basePrice: 250, buyOutPrice: 600, bidEndDate: '2025-06-28T17:00', description: 'Corner booth with high foot traffic.', increment: 25 },
    { id: 3, name: 'Info Point C2', type: 'Service', status: 'Sold', location: 'Zone C, Spot 2', basePrice: 100, buyOutPrice: 300, bidEndDate: '2025-06-25T17:00', description: 'Central location, ideal for services.', increment: 10, winner: 'Vendor 2', currentBid: 120, paymentSubmitted: true, paymentConfirmed: true },
    { id: 4, name: 'Artisan Row A2', type: 'Craft', status: 'Open', location: 'Zone A, Spot 2', basePrice: 300, buyOutPrice: 750, bidEndDate: '2025-07-02T18:00', description: 'Excellent visibility on the main walkway.', increment: 25, currentBid: 325 },
    { id: 5, name: 'Taco Truck Fiesta', type: 'Food', status: 'Open', location: 'Food Court, Spot 5', basePrice: 700, buyOutPrice: 1500, bidEndDate: '2025-07-03T12:00', description: 'Large space suitable for a food truck.', increment: 50, currentBid: 750 },
    { id: 6, name: 'Handmade Jewelry', type: 'Craft', status: 'Open', location: 'Artisan Row, Spot 8', basePrice: 200, buyOutPrice: 500, bidEndDate: '2025-07-02T19:00', description: 'Small booth perfect for delicate items.', increment: 20 },
    { id: 7, name: 'Local Charity Info', type: 'Service', status: 'Open', location: 'Community Zone, Spot 1', basePrice: 50, buyOutPrice: 150, bidEndDate: '2025-06-30T17:00', description: 'Discounted rate for non-profits.', increment: 5 },
    { id: 8, name: 'Gourmet Coffee Cart', type: 'Food', status: 'Sold', location: 'Entrance, Spot 1', basePrice: 400, buyOutPrice: 900, bidEndDate: '2025-06-29T17:00', description: 'High traffic area near the main entrance.', increment: 25, winner: 'Vendor 1', currentBid: 500, paymentSubmitted: false, paymentConfirmed: false },
];

interface UserBidDetails {
    bidAmount: number;
    circuits: number;
}
interface UserBids {
    // FIX: Using string for boothId index signature as object keys are strings in JS.
    [vendorName: string]: { [boothId: string]: UserBidDetails };
}

interface Bid extends UserBidDetails {
    id: number;
    vendorName: string;
    timestamp: string;
}
interface AllBids {
    // FIX: Using string for boothId index signature as object keys are strings in JS.
    [boothId: string]: Bid[];
}

const initialBidsData: AllBids = {
    1: [
        { id: 101, vendorName: 'Vendor 1', bidAmount: 550, circuits: 1, timestamp: '2025-06-20T10:00:00Z' },
        { id: 102, vendorName: 'Vendor 2', bidAmount: 600, circuits: 2, timestamp: '2025-06-20T11:30:00Z' },
        { id: 103, vendorName: 'Vendor 1', bidAmount: 650, circuits: 1, timestamp: '2025-06-21T09:00:00Z' },
    ],
    4: [
        { id: 401, vendorName: 'Vendor 2', bidAmount: 325, circuits: 0, timestamp: '2025-06-22T14:00:00Z' },
    ],
    3: [
        { id: 301, vendorName: 'Vendor 2', bidAmount: 120, circuits: 0, timestamp: '2025-06-24T10:00:00Z' },
    ],
    5: [
        { id: 501, vendorName: 'Vendor 2', bidAmount: 750, circuits: 3, timestamp: '2025-06-25T11:00:00Z' },
    ],
    8: [
        { id: 801, vendorName: 'Vendor 1', bidAmount: 450, circuits: 1, timestamp: '2025-06-26T10:00:00Z' },
        { id: 802, vendorName: 'Vendor 2', bidAmount: 475, circuits: 1, timestamp: '2025-06-26T12:00:00Z' },
        { id: 803, vendorName: 'Vendor 1', bidAmount: 500, circuits: 1, timestamp: '2025-06-27T14:00:00Z' },
    ]
};

const initialUserBidsData: UserBids = {
    'Vendor 1': {
        1: { bidAmount: 650, circuits: 1 },
        8: { bidAmount: 500, circuits: 1 },
    },
    'Vendor 2': {
        1: { bidAmount: 600, circuits: 2 },
        4: { bidAmount: 325, circuits: 0 },
        3: { bidAmount: 120, circuits: 0 },
        5: { bidAmount: 750, circuits: 3 },
        8: { bidAmount: 475, circuits: 1 },
    }
}

interface Notification {
    title: string;
    message: string;
}
interface AllNotifications {
    [vendorName: string]: Notification[];
}


// --- CONTEXT DEFINITION ---

interface BiddingContextType {
    booths: Booth[];
    bids: AllBids;
    userBids: UserBids;
    notifications: AllNotifications;
    placeBid: (vendorName: string, boothId: number, amount: number, circuits: number) => { success: boolean, message: string };
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
    const [notifications, setNotifications] = useState<AllNotifications>({});

    const addNotification = (vendorName: string, title: string, message: string) => {
        setNotifications(prev => ({
            ...prev,
            [vendorName]: [...(prev[vendorName] || []), { title, message }]
        }));
    };
    
    const placeBid = (vendorName: string, boothId: number, amount: number, circuits: number) => {
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
            // FIX: The `id` from Object.keys should be a string, but a type inference issue causes it to be treated as `unknown`.
            // Explicitly casting `id` to a string and adding a radix to parseInt resolves the error and improves robustness.
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

        return { success: true, message: `Successfully placed a bid of $${amount.toFixed(2)} for ${booth.name}!` };
    };

    const confirmBid = (boothId: number, winningBidId: number) => {
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
            `Your bid for "${booth.name}" has been accepted! Please pay the total amount of $${totalPayable.toFixed(2)} within 24 hours to secure your spot.`
        );

        // FIX: Explicitly type losingBidders to resolve an issue where loserName was inferred as 'unknown'.
        const losingBidders: Set<string> = new Set(boothBids
            .filter(b => b.vendorName !== winnerName)
            .map(b => b.vendorName)
        );
        
        losingBidders.forEach(loserName => {
            addNotification(
                loserName,
                'Update on Your Bid',
                `The auction for the booth "${booth.name}" has now closed. Thank you for your participation.`
            );
        });
    };

    const submitPayment = (boothId: number) => {
        setBooths(prev => prev.map(b => 
            b.id === boothId ? { ...b, paymentSubmitted: true } : b
        ));
    };

    const confirmPayment = (boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if(booth && booth.winner) {
             setBooths(prev => prev.map(b => 
                b.id === boothId ? { ...b, paymentConfirmed: true } : b
            ));
            addNotification(booth.winner, 'Payment Confirmed!', `Your payment for "${booth.name}" has been successfully confirmed by the administrator.`);
        }
    };
    
    const revokeBid = (boothId: number) => {
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
            addNotification(revokedWinner, 'Bid Revoked', `Unfortunately, your winning bid for "${booth.name}" has been revoked by the administrator. Please contact them for more details.`);
        }
    };

    const addBooth = (boothData: Omit<Booth, 'id'>) => {
        const newBooth: Booth = { ...boothData, id: Date.now() };
        setBooths(prev => [newBooth, ...prev]);
    };

    const updateBooth = (boothId: number, updatedBooth: Booth) => {
        setBooths(prev => prev.map(b => b.id === boothId ? updatedBooth : b));
    };

    const deleteBooth = (boothId: number) => {
        setBooths(prev => prev.filter(b => b.id !== boothId));
    };


    return (
        <BiddingContext.Provider value={{ booths, bids, userBids, notifications, placeBid, confirmBid, addBooth, updateBooth, deleteBooth, submitPayment, confirmPayment, revokeBid }}>
            {children}
        </BiddingContext.Provider>
    );
};