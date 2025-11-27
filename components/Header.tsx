import React from 'react';

export type View = 'vendor1' | 'vendor2' | 'admin';

interface HeaderProps {
    activeView: View;
    setView: (view: View) => void;
}

const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                ? 'bg-pink-600 text-white' 
                : 'text-slate-100 hover:bg-white/20'
            }`}
        >
            {children}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ activeView, setView }) => {
  return (
    <header className="bg-slate-800 shadow-md">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                 <div className="flex items-center">
                    <span className="font-bold text-lg text-white">Event Dashboard</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <NavButton onClick={() => setView('vendor1')} isActive={activeView === 'vendor1'}>Vendor 1</NavButton>
                    <NavButton onClick={() => setView('vendor2')} isActive={activeView === 'vendor2'}>Vendor 2</NavButton>
                    <NavButton onClick={() => setView('admin')} isActive={activeView === 'admin'}>Admin</NavButton>
                 </div>
            </div>
        </div>
    </header>
  );
};