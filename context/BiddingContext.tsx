import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Booth } from '../components/BoothManagement';

// --- DYNAMIC DATE HELPERS ---
const now = new Date();
const futureDate = (days: number, hours: number = 0, minutes: number = 0) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000).toISOString();
const pastDate = (days: number, hours: number = 0) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000).toISOString();


// --- INITIAL MOCK DATA ---
const initialBoothsData: Booth[] = [
    { id: 1, title: 'Food Stall A1', type: '10x20', status: 'Open', location: 'Zone A', basePrice: 500, buyOutPrice: 1000, bidEndDate: futureDate(2, 4), description: 'Premium spot near the main stage.', increment: 50, buyoutMethod: 'Admin approve', currentBid: 650 },
    { id: 2, title: 'Craft Corner B3', type: '10x10', status: 'Closed', location: 'Zone B', basePrice: 250, buyOutPrice: 600, bidEndDate: pastDate(2), description: 'Corner booth with high foot traffic.', increment: 25, buyoutMethod: 'Direct pay' },
    { id: 3, title: 'Info Point C2', type: '10x10', status: 'Sold', location: 'Zone C', basePrice: 100, buyOutPrice: 300, bidEndDate: pastDate(5), description: 'Central location, ideal for services.', increment: 10, buyoutMethod: 'Admin approve', winner: 'Vendor 2', currentBid: 120, paymentSubmitted: true, paymentConfirmed: true },
    { id: 4, title: 'Artisan Row A2', type: '10x10', status: 'Open', location: 'Zone A', basePrice: 300, buyOutPrice: 750, bidEndDate: futureDate(4, 18), description: 'Excellent visibility on the main walkway.', increment: 25, buyoutMethod: 'Direct pay', currentBid: 325 },
    { id: 5, title: 'Taco Truck Fiesta', type: '10x20', status: 'Open', location: 'Food Court', basePrice: 700, buyOutPrice: 1500, bidEndDate: futureDate(15), description: 'Large space suitable for a food truck.', increment: 50, buyoutMethod: 'Admin approve', currentBid: 750 },
    { id: 6, title: 'Handmade Jewelry', type: '10x10', status: 'Open', location: 'Artisan Row', basePrice: 200, buyOutPrice: 500, bidEndDate: futureDate(3, 19), description: 'Small booth perfect for delicate items.', increment: 20, buyoutMethod: 'Direct pay' },
    { id: 7, title: 'Local Charity Info', type: '10x10', status: 'Open', location: 'Community Zone', basePrice: 50, buyOutPrice: 150, bidEndDate: futureDate(1, 1), description: 'Discounted rate for non-profits.', increment: 5, buyoutMethod: 'Admin approve' },
    { id: 8, title: 'Gourmet Coffee Cart', type: '10x10', status: 'Sold', location: 'Entrance', basePrice: 400, buyOutPrice: 900, bidEndDate: pastDate(1), description: 'High traffic area near the main entrance.', increment: 25, buyoutMethod: 'Direct pay', winner: 'Vendor 1', currentBid: 500, paymentSubmitted: true, paymentConfirmed: false },
    { id: 9, title: 'Pop-up Gallery D1', type: '10x15', status: 'Open', location: 'Artisan Row', basePrice: 350, buyOutPrice: 800, bidEndDate: futureDate(4, 2), description: 'Spacious booth for art displays.', increment: 25, buyoutMethod: 'Admin approve', currentBid: 375 },
    { id: 10, title: 'Mobile Cafe Spot', type: '10x10', status: 'Open', location: 'Entrance', basePrice: 450, buyOutPrice: 1100, bidEndDate: futureDate(0, 10), description: 'Prime location for a mobile cafe.', increment: 50, buyoutMethod: 'Direct pay', currentBid: 500 },
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
        { id: 101, vendorName: 'Vendor 1', bidAmount: 550, circuits: 1, timestamp: pastDate(3, 2) },
        { id: 102, vendorName: 'Vendor 2', bidAmount: 600, circuits: 2, timestamp: pastDate(3, 1) },
        { id: 103, vendorName: 'Vendor 1', bidAmount: 650, circuits: 1, timestamp: pastDate(2, 5) },
    ],
    '4': [
        { id: 401, vendorName: 'Vendor 2', bidAmount: 325, circuits: 0, timestamp: pastDate(1, 10) },
    ],
    '3': [
        { id: 301, vendorName: 'Vendor 2', bidAmount: 120, circuits: 0, timestamp: pastDate(6) },
    ],
    '5': [
        { id: 501, vendorName: 'Vendor 2', bidAmount: 750, circuits: 3, timestamp: pastDate(4) },
    ],
    '8': [
        { id: 801, vendorName: 'Vendor 1', bidAmount: 450, circuits: 1, timestamp: pastDate(2, 1) },
        { id: 802, vendorName: 'Vendor 2', bidAmount: 475, circuits: 1, timestamp: pastDate(1, 20) },
        { id: 803, vendorName: 'Vendor 1', bidAmount: 500, circuits: 1, timestamp: pastDate(1, 12) },
    ],
    '9': [
        { id: 901, vendorName: 'Vendor 1', bidAmount: 375, circuits: 1, timestamp: pastDate(0, 5) },
    ],
    '10': [
        { id: 1001, vendorName: 'Vendor 2', bidAmount: 500, circuits: 2, timestamp: pastDate(0, 2) },
    ]
};

const initialUserBidsData: UserBids = {
    'Vendor 1': {
        '1': { bidAmount: 650, circuits: 1 },
        '8': { bidAmount: 500, circuits: 1 },
        '9': { bidAmount: 375, circuits: 1 },
    },
    'Vendor 2': {
        '1': { bidAmount: 600, circuits: 2 },
        '4': { bidAmount: 325, circuits: 0 },
        '3': { bidAmount: 120, circuits: 0 },
        '5': { bidAmount: 750, circuits: 3 },
        '8': { bidAmount: 475, circuits: 1 },
        '10': { bidAmount: 500, circuits: 2 },
    }
}

interface Notification {
    title: string;
    message: string;
}
interface AllNotifications {
    [vendorName: string]: Notification[];
}

export interface BuyoutRequest {
    vendorName: string;
    circuits: number;
    timestamp: string;
}
interface AllBuyoutRequests {
    [boothId: string]: BuyoutRequest[];
}

interface Watchlist {
    [vendorName: string]: Set<number>;
}

interface BiddingContextType {
    booths: Booth[];
    bids: AllBids;
    userBids: UserBids;
    notifications: AllNotifications;
    locations: string[];
    buyoutRequests: AllBuyoutRequests;
    watchlist: Watchlist;
    toggleWatchlist: (vendorName: string, boothId: number) => void;
    addLocation: (location: string) => void;
    deleteLocation: (location: string) => void;
    placeBid: (vendorName: string, boothId: number, amount: number, circuits: number) => { success: boolean, message: string };
    requestBuyOut: (vendorName: string, boothId: number, circuits: number) => void;
    directBuyOut: (vendorName: string, boothId: number, circuits: number) => void;
    approveBuyOut: (boothId: number, vendorName: string) => void;
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
    const [buyoutRequests, setBuyoutRequests] = useState<AllBuyoutRequests>({});
    const [watchlist, setWatchlist] = useState<Watchlist>({
        'Vendor 1': new Set([4]),
        'Vendor 2': new Set([6]),
    });

    const toggleWatchlist = useCallback((vendorName: string, boothId: number) => {
        setWatchlist(prev => {
            const newWatchlist = { ...prev };
            if (!newWatchlist[vendorName]) {
                newWatchlist[vendorName] = new Set();
            }
            
            const userWatchlist = newWatchlist[vendorName];
            if (userWatchlist.has(boothId)) {
                userWatchlist.delete(boothId);
            } else {
                userWatchlist.add(boothId);
            }
            
            return newWatchlist;
        });
    }, []);

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

        if (booth.buyoutMethod === 'Admin approve' && (buyoutRequests[boothId] || []).length > 0) {
            return { success: false, message: "This booth has a pending buyout request. Only buyout offers are being accepted at this time." };
        }

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
    }, [booths, userBids, buyoutRequests]);

    const requestBuyOut = useCallback((vendorName: string, boothId: number, circuits: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;
        const newRequest: BuyoutRequest = { vendorName, circuits, timestamp: new Date().toISOString() };
        
        setBuyoutRequests(prev => ({
            ...prev,
            [boothId]: [...(prev[boothId] || []), newRequest]
        }));
        
        addNotification('admin', 'Buy Out Request', `${vendorName} has requested to buy out "${booth.title}" for $${booth.buyOutPrice.toFixed(2)} (plus circuit costs).`);
    }, [booths, addNotification]);

    const approveBuyOut = useCallback((boothId: number, winnerName: string) => {
        const booth = booths.find(b => b.id === boothId);
        const requests = buyoutRequests[boothId] || [];
        const winningRequest = requests.find(r => r.vendorName === winnerName);

        if (!booth || !winningRequest) return;

        const totalPayable = booth.buyOutPrice + (winningRequest.circuits * 60);

        setBooths(prev => prev.map(b => 
            b.id === boothId 
                ? { ...b, status: 'Sold', winner: winnerName, currentBid: totalPayable, paymentSubmitted: false, paymentConfirmed: false }
                : b
        ));

        setBuyoutRequests(prev => {
            const newRequests = { ...prev };
            delete newRequests[boothId];
            return newRequests;
        });

        addNotification(
            winnerName,
            'Congratulations! Your Buyout Was Approved!',
            `Your buyout request for "${booth.title}" has been accepted! Please pay the total amount of $${totalPayable.toFixed(2)} within 24 hours to secure your spot.`
        );
        
        // Notify other vendors who requested a buyout for this booth
        requests.forEach(req => {
            if (req.vendorName !== winnerName) {
                addNotification(
                    req.vendorName,
                    'Update on Your Buyout Request',
                    `The booth "${booth.title}" has been sold to another vendor. Thank you for your interest.`
                );
            }
        });
    }, [booths, buyoutRequests, addNotification]);


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
        <BiddingContext.Provider value={{ booths, bids, userBids, notifications, locations, buyoutRequests, watchlist, toggleWatchlist, addLocation, deleteLocation, placeBid, requestBuyOut, directBuyOut, approveBuyOut, confirmBid, addBooth, updateBooth, deleteBooth, submitPayment, confirmPayment, revokeBid }}>
            {children}
        </BiddingContext.Provider>
    );
};