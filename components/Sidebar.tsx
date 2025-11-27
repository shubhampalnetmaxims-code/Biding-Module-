import React from 'react';
import { BiddingModuleIcon } from './icons';

const SidebarLink: React.FC<{ text: string; isActive?: boolean }> = ({ text, isActive }) => (
    <a 
        href="#" 
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive 
            ? 'bg-pink-50 text-pink-700' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        <BiddingModuleIcon className="w-5 h-5" />
        <span>{text}</span>
    </a>
)

export const Sidebar: React.FC = () => {
  return (
    <aside className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <nav className="flex flex-col gap-1">
        <SidebarLink text="Bidding Module" isActive={true} />
      </nav>
    </aside>
  );
};