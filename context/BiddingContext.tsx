import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Booth } from '../components/BoothManagement';

// FIX: Add and export VENDOR_DETAILS with mock data to resolve import error in BoothDetails.tsx.
export const VENDOR_DETAILS = {
    'Vendor 1': {
      businessName: 'Gourmet Coffee Inc.',
      contactPerson: 'Alice Johnson',
      email: 'alice.j@gourmetcoffee.com',
      phone: '+1 (555) 111-2222'
    },
    'Vendor 2': {
      businessName: 'Crafty Creations',
      contactPerson: 'Bob Williams',
      email: 'bob.w@craftycreations.co',
      phone: '+1 (555) 333-4444'
    },
    'Vendor 3': {
      businessName: 'Jewels by Jane',
      contactPerson: 'Jane Doe',
      email: 'jane.d@jewels.com',
      phone: '+1 (555) 555-6666'
    }
};

// --- DYNAMIC DATE HELPERS ---
const now = new Date();
const futureDate = (days: number, hours: number = 0, minutes: number = 0) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000).toISOString();
const pastDate = (days: number, hours: number = 0) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000).toISOString();


// --- INITIAL MOCK DATA ---
const initialBoothsData: Booth[] = [
    { id: 1, title: 'Food Stall A1', type: 'Food', size: '10x20', status: 'Open', location: 'Zone A', basePrice: 500, buyOutPrice: 1000, bidEndDate: futureDate(2, 4), description: 'Premium spot near the main stage.', increment: 50, buyoutMethod: 'Admin approve', biddingPaymentMethod: 'Admin approve', currentBid: 650, hideBiddingPrice: true, hideIncrementValue: false, isBiddingEnabled: true, allowBuyout: true },
    { id: 2, title: 'Craft Corner B3', type: 'Exhibitor', size: '10x10', status: 'Closed', location: 'Zone B', basePrice: 250, buyOutPrice: 600, bidEndDate: pastDate(2), description: 'Corner booth with high foot traffic.', increment: 25, buyoutMethod: 'Direct pay', biddingPaymentMethod: 'Admin approve', hideBiddingPrice: false, hideIncrementValue: true, isBiddingEnabled: true, allowBuyout: false },
    { id: 3, title: 'Info Point C2', type: 'Sponsors', size: '10x10', status: 'Sold', location: 'Zone C', basePrice: 100, buyOutPrice: 300, bidEndDate: pastDate(5), description: 'Central location, ideal for services.', increment: 10, buyoutMethod: 'Admin approve', biddingPaymentMethod: 'Admin approve', winner: 'Vendor 2', currentBid: 120, winningCircuits: 0, paymentSubmitted: true, paymentConfirmed: true, hideBiddingPrice: false, isBiddingEnabled: true, allowBuyout: true },
    { id: 4, title: 'Artisan Row A2', type: 'Exhibitor', size: '10x10', status: 'Open', location: 'Zone A', basePrice: 300, buyOutPrice: 750, bidEndDate: futureDate(4, 18), description: 'Excellent visibility on the main walkway.', increment: 25, buyoutMethod: 'Direct pay', biddingPaymentMethod: 'Admin approve', currentBid: 325, hideBiddingPrice: false, isBiddingEnabled: true, allowBuyout: true },
    { id: 5, title: 'Taco Truck Fiesta', type: 'Food', size: '10x20', status: 'Open', location: 'Food Court', basePrice: 700, buyOutPrice: 1500, bidEndDate: futureDate(15), description: 'Large space suitable for a food truck.', increment: 50, buyoutMethod: 'Admin approve', biddingPaymentMethod: 'Admin approve', currentBid: 750, hideBiddingPrice: true, hideIncrementValue: true, isBiddingEnabled: true, allowBuyout: true },
    { id: 6, title: 'Handmade Jewelry', type: 'Exhibitor', size: '10x10', status: 'Open', location: 'Artisan Row', basePrice: 200, buyOutPrice: 500, bidEndDate: futureDate(3, 19), description: 'Small booth perfect for delicate items.', increment: 20, buyoutMethod: 'Direct pay', biddingPaymentMethod: 'Admin approve', currentBid: 220, hideBiddingPrice: false, isBiddingEnabled: true, allowBuyout: true },
    { id: 7, title: 'Local Charity Info', type: 'Sponsors', size: '10x10', status: 'Open', location: 'Community Zone', basePrice: 50, buyOutPrice: 150, bidEndDate: futureDate(1, 1), description: 'Discounted rate for non-profits.', increment: 5, buyoutMethod: 'Admin approve', biddingPaymentMethod: 'Admin approve', hideBiddingPrice: true, isBiddingEnabled: false, allowDirectAssignment: true },
    { id: 8, title: 'Gourmet Coffee Cart', type: 'Food', size: '10x10', status: 'Sold', location: 'Entrance', basePrice: 400, buyOutPrice: 900, bidEndDate: pastDate(1), description: 'High traffic area near the main entrance.', increment: 25, buyoutMethod: 'Direct pay', biddingPaymentMethod: 'Admin approve', winner: 'Vendor 1', currentBid: 500, winningCircuits: 1, paymentSubmitted: true, paymentConfirmed: false, hideBiddingPrice: false, isBiddingEnabled: true, allowBuyout: true },
    { id: 9, title: 'Pop-up Gallery D1', type: 'Exhibitor', size: '10x15', status: 'Open', location: 'Artisan Row', basePrice: 350, buyOutPrice: 800, bidEndDate: futureDate(4, 2), description: 'Spacious booth for art displays.', increment: 25, buyoutMethod: 'Admin approve', biddingPaymentMethod: 'Admin approve', currentBid: 375, hideBiddingPrice: false, isBiddingEnabled: true, allowBuyout: true },
    { id: 10, title: 'Mobile Cafe Spot', type: 'Food', size: '10x10', status: 'Open', location: 'Entrance', basePrice: 450, buyOutPrice: 1100, bidEndDate: futureDate(0, 10), description: 'Prime location for a mobile cafe.', increment: 50, buyoutMethod: 'Direct pay', biddingPaymentMethod: 'Direct pay', currentBid: 550, hideBiddingPrice: true, isBiddingEnabled: true, allowBuyout: true },
    { id: 11, title: 'Pre-assigned Booth', type: 'Exhibitor', size: '10x10', status: 'Closed', location: 'Zone D', basePrice: 400, buyOutPrice: 0, bidEndDate: '', description: 'A booth available for direct assignment by an admin.', increment: 0, buyoutMethod: 'Admin approve', biddingPaymentMethod: 'Admin approve', isBiddingEnabled: false, allowDirectAssignment: true },
    { id: 12, title: 'Sponsorship Banner Space', type: 'Sponsors', size: '20x5', status: 'Closed', location: 'Main Stage', basePrice: 1000, buyOutPrice: 0, bidEndDate: '', description: 'Banner space for sponsors, assignable by admin.', increment: 0, buyoutMethod: 'Admin approve', biddingPaymentMethod: 'Admin approve', isBiddingEnabled: false, allowDirectAssignment: true },
];

const initialLocationsData = Array.from(new Set(initialBoothsData.map(b => b.location)));

export interface UserBidDetails {
    bidAmount: number;
    circuits: number;
}
interface UserBids {
    [vendorName: string]: { [boothId: string]: UserBidDetails };
}

export interface Bid extends UserBidDetails {
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
    '6': [
        { id: 601, vendorName: 'Vendor 3', bidAmount: 220, circuits: 0, timestamp: pastDate(0, 1) },
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
        { id: 1002, vendorName: 'Vendor 3', bidAmount: 550, circuits: 1, timestamp: pastDate(0, 1) },
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
    },
    'Vendor 3': {
        '6': { bidAmount: 220, circuits: 0 },
        '10': { bidAmount: 550, circuits: 1 },
    }
}

interface Notification {
    title: string;
    message: string;
    type: 'system' | 'broadcast';
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

interface BroadcastMessage {
    message: string;
    timestamp: string;
}

interface AuditLogEntry {
    id: number;
    timestamp: string;
    action: string;
    details: string;
}

type BulkAction =
  | { type: 'delete' }
  | { type: 'changeStatus', status: Booth['status'] }
  | { type: 'extendBidding', hours: number };

interface BiddingContextType {
    booths: Booth[];
    bids: AllBids;
    userBids: UserBids;
    notifications: AllNotifications;
    locations: string[];
    buyoutRequests: AllBuyoutRequests;
    watchlist: Watchlist;
    broadcastHistory: BroadcastMessage[];
    eventStatus: 'running' | 'paused';
    auditLog: AuditLogEntry[];
    highlightedBooth: number | null;
    setEventStatus: (status: 'running' | 'paused') => void;
    goToEditBooth: (booth: Booth) => void;
    setGoToEditBooth: (fn: (booth: Booth) => void) => void;
    toggleWatchlist: (vendorName: string, boothId: number) => void;
    addLocation: (location: string) => void;
    deleteLocation: (location: string) => void;
    placeBid: (vendorName: string, boothId: number, amount: number, circuits: number) => { success: boolean, message: string };
    removeBid: (vendorName: string, boothId: number) => { success: boolean, message: string };
    requestBuyOut: (vendorName: string, boothId: number, circuits: number) => void;
    directBuyOut: (vendorName: string, boothId: number, circuits: number) => void;
    approveBuyOut: (boothId: number, vendorName: string) => void;
    confirmBid: (boothId: number, winningBidId: number) => void;
    addBooth: (booth: Omit<Booth, 'id'>) => void;
    updateBooth: (boothId: number, updatedBooth: Booth) => void;
    archiveBooth: (boothId: number) => void;
    restoreBooth: (boothId: number) => void;
    bulkUpdateBooths: (boothIds: number[], action: BulkAction) => void;
    submitPayment: (boothId: number) => void;
    confirmPayment: (boothId: number) => void;
    revokeBid: (boothId: number) => void;
    assignBoothToVendor: (boothId: number, vendorName: string, price: number) => void;
    unassignBooth: (boothId: number) => void;
    notifyAllVendors: (message: string) => void;
}

export const BiddingContext = createContext<BiddingContextType>(null!);

export const BiddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [booths, setBooths] = useState<Booth[]>(initialBoothsData);
    const [bids, setBids] = useState<AllBids>(initialBidsData);
    const [userBids, setUserBids] = useState<UserBids>(initialUserBidsData);
    const [notifications, setNotifications] = useState<AllNotifications>({ 'admin': [] });
    const [locations, setLocations] = useState<string[]>(initialLocationsData);
    const [buyoutRequests, setBuyoutRequests] = useState<AllBuyoutRequests>({});
    const [broadcastHistory, setBroadcastHistory] = useState<BroadcastMessage[]>([]);
    const [goToEditBooth, setGoToEditBooth] = useState<(booth: Booth) => void>(() => () => {});
    const [eventStatus, setEventStatusState] = useState<'running' | 'paused'>('running');
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [highlightedBooth, setHighlightedBooth] = useState<number | null>(null);
    
    const [watchlist, setWatchlist] = useState<Watchlist>({
        'Vendor 1': new Set([4]),
        'Vendor 2': new Set([6]),
        'Vendor 3': new Set([1]),
    });

    const addAuditLog = useCallback((action: string, details: string) => {
        const newEntry: AuditLogEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action,
            details,
        };
        setAuditLog(prev => [...prev, newEntry]);
    }, []);
    
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

    const addNotification = useCallback((vendorName: string, title: string, message: string, type: Notification['type'] = 'system') => {
        setNotifications(prev => ({
            ...prev,
            [vendorName]: [...(prev[vendorName] || []), { title, message, type }]
        }));
    }, []);

    const setEventStatus = useCallback((status: 'running' | 'paused') => {
        setEventStatusState(status);
        addAuditLog('Event Status Changed', `Event status set to "${status}".`);
    }, [addAuditLog]);
    
    const placeBid = useCallback((vendorName: string, boothId: number, amount: number, circuits: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return { success: false, message: "Booth not found." };
        if (eventStatus === 'paused') return { success: false, message: "Bidding is currently paused by the administrator." };
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

        if (openBidsCount >= 3 && !hasAlreadyBid) {
            return { success: false, message: "Bidding limit reached." };
        }

        const allBoothBids = bids[boothId] || [];
        const previousHighestBid = allBoothBids.length > 0
            ? allBoothBids.reduce((max, bid) => bid.bidAmount > max.bidAmount ? bid : max, allBoothBids[0])
            : null;

        const timeLeft = +new Date(booth.bidEndDate) - +new Date();
        const minutesLeft = timeLeft / (1000 * 60);

        let newEndDate = booth.bidEndDate;
        let bidExtended = false;
        if (minutesLeft > 0 && minutesLeft <= 5) {
            const extendedDate = new Date(booth.bidEndDate);
            extendedDate.setMinutes(extendedDate.getMinutes() + 5);
            newEndDate = extendedDate.toISOString();
            bidExtended = true;
        }

        const newBid: Bid = { id: Date.now(), vendorName, bidAmount: amount, circuits, timestamp: new Date().toISOString() };
        setBids(prev => ({ ...prev, [boothId]: [...(prev[boothId] || []), newBid] }));
        setUserBids(prev => ({ ...prev, [vendorName]: { ...(prev[vendorName] || {}), [boothId]: { bidAmount: amount, circuits } } }));
        setBooths(prev => prev.map(b => b.id === boothId ? { ...b, currentBid: amount, bidEndDate: newEndDate } : b));
        
        setHighlightedBooth(boothId);
        setTimeout(() => setHighlightedBooth(null), 2000);
        
        const previousHighestBidderName = previousHighestBid ? previousHighestBid.vendorName : null;

        if (previousHighestBidderName && previousHighestBidderName !== vendorName) {
            addNotification(
                previousHighestBidderName,
                "You've been outbid!",
                `Another vendor has placed a higher bid on "${booth.title}". The new current bid is $${amount.toFixed(2)}.`
            );
            
            if (bidExtended) {
                addNotification(
                    previousHighestBidderName,
                    'Auction Extended!',
                    `A last-minute bid on "${booth.title}" has extended the auction by 5 minutes.`
                );
            }
        }
        
        if (bidExtended) {
            addNotification(
                vendorName,
                'Auction Extended!',
                `Your last-minute bid on "${booth.title}" has extended the auction by 5 minutes.`
            );
        }

        return { success: true, message: `Successfully placed a bid of $${amount.toFixed(2)} for ${booth.title}!` };
    }, [booths, userBids, buyoutRequests, addNotification, eventStatus, bids]);

    // Effect to simulate real-time bidding from another vendor
    useEffect(() => {
        const timer = setTimeout(() => {
            const boothToBidOn = booths.find(b => b.id === 4 && b.status === 'Open');
            if (boothToBidOn) {
                const currentBid = boothToBidOn.currentBid || boothToBidOn.basePrice;
                const newBidAmount = currentBid + boothToBidOn.increment;
                placeBid('Vendor 3', 4, newBidAmount, 0);
            }
        }, 5000); // After 5 seconds, Vendor 3 places a bid on booth 4

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const removeBid = useCallback((vendorName: string, boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return { success: false, message: "Booth not found." };
        if (booth.status !== 'Open') return { success: false, message: "Cannot remove a bid from a closed booth." };
        if (booth.buyoutMethod === 'Admin approve' && (buyoutRequests[boothId] || []).length > 0) {
            return { success: false, message: "Cannot remove bid while a buyout request is pending." };
        }

        const vendorBidsOnBooth = (bids[boothId] || []).filter(b => b.vendorName === vendorName);
        if (vendorBidsOnBooth.length === 0) {
            return { success: false, message: "You do not have an active bid on this booth." };
        }

        const previousHighestBidderWasThisVendor = booth.currentBid === (userBids[vendorName]?.[boothId]?.bidAmount);
        const remainingBids = (bids[boothId] || []).filter(b => b.vendorName !== vendorName);
        setBids(prev => ({ ...prev, [boothId]: remainingBids }));
        setUserBids(prev => {
            const newUserBids = JSON.parse(JSON.stringify(prev));
            if (newUserBids[vendorName]) delete newUserBids[vendorName][boothId];
            return newUserBids;
        });
        const newHighestBidderDetails = remainingBids.length > 0
            ? remainingBids.reduce((max, bid) => bid.bidAmount > max.bidAmount ? bid : max, remainingBids[0])
            : null;

        setBooths(prev => prev.map(b => {
            if (b.id === boothId) return { ...b, currentBid: newHighestBidderDetails ? newHighestBidderDetails.bidAmount : undefined };
            return b;
        }));

        if (newHighestBidderDetails && previousHighestBidderWasThisVendor && newHighestBidderDetails.vendorName !== vendorName) {
            addNotification(newHighestBidderDetails.vendorName, "You are now the highest bidder!", `The previous high bidder for "${booth.title}" has removed their bid. You are now the leading bidder with a bid of $${newHighestBidderDetails.bidAmount.toFixed(2)}.`);
        }
        return { success: true, message: `Your bid for "${booth.title}" has been successfully removed.` };
    }, [booths, bids, userBids, buyoutRequests, addNotification]);

    const requestBuyOut = useCallback((vendorName: string, boothId: number, circuits: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;
        const newRequest: BuyoutRequest = { vendorName, circuits, timestamp: new Date().toISOString() };
        setBuyoutRequests(prev => ({ ...prev, [boothId]: [...(prev[boothId] || []), newRequest] }));
        addNotification('admin', 'Buy Out Request', `${vendorName} has requested to buy out "${booth.title}" for $${booth.buyOutPrice.toFixed(2)} (plus circuit costs).`);
    }, [booths, addNotification]);

    const approveBuyOut = useCallback((boothId: number, winnerName: string) => {
        const booth = booths.find(b => b.id === boothId);
        const requests = buyoutRequests[boothId] || [];
        const winningRequest = requests.find(r => r.vendorName === winnerName);

        if (!booth || !winningRequest) return;
        const totalPayable = booth.buyOutPrice + (winningRequest.circuits * 60);
        setBooths(prev => prev.map(b => b.id === boothId ? { ...b, status: 'Sold', winner: winnerName, currentBid: booth.buyOutPrice, winningCircuits: winningRequest.circuits, paymentSubmitted: false, paymentConfirmed: false } : b ));
        setBuyoutRequests(prev => {
            const newRequests = { ...prev };
            delete newRequests[boothId];
            return newRequests;
        });

        addAuditLog('Buyout Approved', `Approved buyout for "${booth.title}" for vendor ${winnerName}.`);
        addNotification(winnerName, 'Congratulations! Your Buyout Was Approved!', `Your buyout request for "${booth.title}" has been accepted! Please pay the total amount of $${totalPayable.toFixed(2)} within 24 hours to secure your spot.`);
        requests.forEach(req => {
            if (req.vendorName !== winnerName) addNotification( req.vendorName, 'Update on Your Buyout Request', `The booth "${booth.title}" has been sold to another vendor. Thank you for your interest.`);
        });
    }, [booths, buyoutRequests, addNotification, addAuditLog]);

    const directBuyOut = useCallback((vendorName: string, boothId: number, circuits: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth || booth.status !== 'Open') return;
        setBooths(prev => prev.map(b => b.id === boothId ? { ...b, status: 'Sold', winner: vendorName, currentBid: b.buyOutPrice, winningCircuits: circuits, paymentSubmitted: true, paymentConfirmed: true } : b));
        addNotification(vendorName, 'Purchase Successful!', `You have successfully purchased "${booth.title}" for $${booth.buyOutPrice.toFixed(2)}. Your payment is confirmed.`);
        addNotification('admin', 'Booth Sold (Direct Pay)', `"${booth.title}" has been sold to ${vendorName} for $${booth.buyOutPrice.toFixed(2)} via direct payment.`);
    }, [booths, addNotification]);

    const confirmBid = useCallback((boothId: number, winningBidId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;
        const boothBids = bids[boothId] || [];
        const winningBid = boothBids.find(b => b.id === winningBidId);

        if (!winningBid) return;
        const winnerName = winningBid.vendorName;
        const totalPayable = winningBid.bidAmount + (winningBid.circuits * 60);
        setBooths(prev => prev.map(b => b.id === boothId ? { ...b, status: 'Sold', winner: winnerName, currentBid: winningBid.bidAmount, winningCircuits: winningBid.circuits, paymentSubmitted: false, paymentConfirmed: false } : b));

        addAuditLog('Bid Winner Confirmed', `Confirmed ${winnerName} as winner of "${booth.title}".`);
        addNotification(winnerName, 'Congratulations! You Won a Bid!', `Your bid for "${booth.title}" has been accepted! Please pay the total amount of $${totalPayable.toFixed(2)} within 24 hours to secure your spot.`);
        const losingBidders: Set<string> = new Set(boothBids.filter(b => b.vendorName !== winnerName).map(b => b.vendorName));
        losingBidders.forEach(loserName => addNotification(loserName, 'Update on Your Bid', `The auction for the booth "${booth.title}" has now closed. Thank you for your participation.`));
    }, [booths, bids, addNotification, addAuditLog]);

    const submitPayment = useCallback((boothId: number) => {
        setBooths(prev => prev.map(b => b.id === boothId ? { ...b, paymentSubmitted: true } : b));
    }, []);

    const confirmPayment = useCallback((boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if(booth && booth.winner) {
            setBooths(prev => prev.map(b => b.id === boothId ? { ...b, paymentConfirmed: true } : b));
            addAuditLog('Payment Confirmed', `Confirmed payment for "${booth.title}" from vendor ${booth.winner}.`);
            addNotification(booth.winner, 'Payment Confirmed!', `Your payment for "${booth.title}" has been successfully confirmed by the administrator.`);
        }
    }, [booths, addNotification, addAuditLog]);
    
    const revokeBid = useCallback((boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (booth && booth.winner) {
            const revokedWinner = booth.winner;
            const secondHighestBid = (bids[boothId] || [])
                .filter(b => b.vendorName !== revokedWinner)
                .sort((a, b) => b.bidAmount - a.bidAmount)[0];

            setBooths(prev => prev.map(b => {
                if (b.id === boothId) {
                    const { winner, paymentConfirmed, paymentSubmitted, winningCircuits, ...rest } = b;
                    return { ...rest, status: 'Open', currentBid: secondHighestBid ? secondHighestBid.bidAmount : b.basePrice };
                }
                return b;
            }));
            addAuditLog('Bid Revoked', `Revoked winning bid for "${booth.title}" from vendor ${revokedWinner}.`);
            addNotification(revokedWinner, 'Bid Revoked', `Unfortunately, your winning bid for "${booth.title}" has been revoked by the administrator. Please contact them for more details.`);
        }
    }, [booths, addNotification, addAuditLog, bids]);

    const assignBoothToVendor = useCallback((boothId: number, vendorName: string, price: number) => {
        const boothToAssign = booths.find(b => b.id === boothId);
        if (!boothToAssign) return;
        setBooths(prev => prev.map(b => b.id === boothId ? { ...b, status: 'Sold', winner: vendorName, currentBid: price, paymentSubmitted: true, paymentConfirmed: true, winningCircuits: 0 } : b));
        addAuditLog('Booth Assigned', `Assigned "${boothToAssign.title}" to ${vendorName} for $${price.toFixed(2)}.`);
        addNotification(vendorName, 'Booth Assigned to You', `The administrator has assigned booth "${boothToAssign.title}" to you.`);
    }, [booths, addNotification, addAuditLog]);

    const unassignBooth = useCallback((boothId: number) => {
        const boothToUnassign = booths.find(b => b.id === boothId);
        if (boothToUnassign && boothToUnassign.winner) {
            const unassignedWinner = boothToUnassign.winner;
            setBooths(prev => prev.map(b => {
                if (b.id === boothId) {
                    const { winner, currentBid, paymentConfirmed, paymentSubmitted, winningCircuits, ...rest } = b;
                    return { ...rest, status: 'Open', currentBid: undefined };
                }
                return b;
            }));
            addAuditLog('Booth Unassigned', `Unassigned "${boothToUnassign.title}" from vendor ${unassignedWinner}.`);
            addNotification(unassignedWinner, 'Booth Unassigned', `The booth "${boothToUnassign.title}" has been unassigned from you by the administrator.`);
        }
    }, [booths, addNotification, addAuditLog]);
    
    const notifyAllVendors = useCallback((message: string) => {
        const VENDORS = ['Vendor 1', 'Vendor 2', 'Vendor 3'];
        VENDORS.forEach(vendor => { addNotification(vendor, 'Admin Broadcast', message, 'broadcast'); });
        setBroadcastHistory(prev => [...prev, { message, timestamp: new Date().toISOString() }]);
        addAuditLog('Broadcast Sent', `Sent notification to all vendors: "${message}"`);
    }, [addNotification, addAuditLog]);

    const addBooth = useCallback((boothData: Omit<Booth, 'id'>) => {
        const newBooth: Booth = { ...boothData, id: Date.now() };
        setBooths(prev => [newBooth, ...prev]);
        addAuditLog('Booth Created', `Created new booth: "${newBooth.title}".`);
    }, [addAuditLog]);

    const updateBooth = useCallback((boothId: number, updatedBooth: Booth) => {
        setBooths(prev => prev.map(b => b.id === boothId ? updatedBooth : b));
        addAuditLog('Booth Updated', `Updated details for booth: "${updatedBooth.title}".`);
    }, [addAuditLog]);

    const archiveBooth = useCallback((boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (booth) {
            setBooths(prev => prev.map(b => b.id === boothId ? { ...b, isArchived: true } : b));
            addAuditLog('Booth Archived', `Archived booth: "${booth.title}".`);
        }
    }, [booths, addAuditLog]);

    const restoreBooth = useCallback((boothId: number) => {
        const booth = booths.find(b => b.id === boothId);
        if (booth) {
            setBooths(prev => prev.map(b => b.id === boothId ? { ...b, isArchived: false } : b));
            addAuditLog('Booth Restored', `Restored booth: "${booth.title}".`);
        }
    }, [booths, addAuditLog]);

    const bulkUpdateBooths = useCallback((boothIds: number[], action: BulkAction) => {
        setBooths(prev => {
            if (action.type === 'delete') {
                addAuditLog('Bulk Action: Archive', `Archived ${boothIds.length} booths.`);
                return prev.map(b => boothIds.includes(b.id) ? { ...b, isArchived: true } : b);
            }
            if (action.type === 'changeStatus') {
                addAuditLog('Bulk Action: Change Status', `Changed status to "${action.status}" for ${boothIds.length} booths.`);
            }
            if (action.type === 'extendBidding') {
                addAuditLog('Bulk Action: Extend Bidding', `Extended bidding by ${action.hours} hour(s) for ${boothIds.length} booths.`);
            }
            return prev.map(b => {
                if (boothIds.includes(b.id)) {
                    if (action.type === 'changeStatus') {
                        return { ...b, status: action.status };
                    }
                    if (action.type === 'extendBidding' && b.status === 'Open' && b.bidEndDate) {
                        const newEndDate = new Date(b.bidEndDate);
                        newEndDate.setHours(newEndDate.getHours() + action.hours);
                        return { ...b, bidEndDate: newEndDate.toISOString() };
                    }
                }
                return b;
            });
        });
    }, [addAuditLog]);

    const addLocation = useCallback((location: string) => {
        if (location && !locations.includes(location)) {
            setLocations(prev => [...prev, location]);
            addAuditLog('Location Added', `Added new location: "${location}".`);
        }
    }, [locations, addAuditLog]);

    const deleteLocation = useCallback((locationToDelete: string) => {
        setLocations(prev => prev.filter(loc => loc !== locationToDelete));
        setBooths(prev => prev.map(b => b.location === locationToDelete ? { ...b, location: '' } : b));
        addAuditLog('Location Deleted', `Deleted location: "${locationToDelete}".`);
    }, [addAuditLog]);

    return (
        <BiddingContext.Provider value={{ booths, bids, userBids, notifications, locations, buyoutRequests, watchlist, broadcastHistory, eventStatus, auditLog, highlightedBooth, setEventStatus, goToEditBooth, setGoToEditBooth, toggleWatchlist, addLocation, deleteLocation, placeBid, removeBid, requestBuyOut, directBuyOut, approveBuyOut, confirmBid, addBooth, updateBooth, archiveBooth, restoreBooth, bulkUpdateBooths, submitPayment, confirmPayment, revokeBid, assignBoothToVendor, unassignBooth, notifyAllVendors }}>
            {children}
        </BiddingContext.Provider>
    );
};