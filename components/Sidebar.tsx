import React from 'react';
import { BiddingModuleIcon, MapIcon, DashboardIcon, SettingsIcon, UsersIcon, BellIcon, FileTextIcon } from './icons';
import { AdminViewType } from './AdminView';

interface SidebarLinkProps {
    text: string;
    isActive?: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ text, isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
            isActive 
            ? 'bg-pink-50 text-pink-700' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        {icon}
        <span>{text}</span>
    </button>
)

interface SidebarProps {
    activeView: AdminViewType;
    setActiveView: (view: AdminViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="bg-white w-64 h-full border-r border-slate-200">
      <div className="p-4">
        <nav className="flex flex-col gap-1">
          <SidebarLink 
              text="Dashboard" 
              isActive={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')}
              icon={<DashboardIcon className="w-5 h-5" />}
          />
          <SidebarLink 
              text="Booth Management" 
              isActive={activeView === 'booths'} 
              onClick={() => setActiveView('booths')}
              icon={<BiddingModuleIcon className="w-5 h-5" />}
          />
          <SidebarLink 
              text="Location Management" 
              isActive={activeView === 'locations'} 
              onClick={() => setActiveView('locations')}
              icon={<MapIcon className="w-5 h-5" />}
          />
          <SidebarLink 
              text="Vendor Management" 
              isActive={activeView === 'vendorManagement'} 
              onClick={() => setActiveView('vendorManagement')}
              icon={<UsersIcon className="w-5 h-5" />}
          />
          <SidebarLink 
              text="Notify Vendors" 
              isActive={activeView === 'notify'} 
              onClick={() => setActiveView('notify')}
              icon={<BellIcon className="w-5 h-5" />}
          />
          <SidebarLink 
              text="Audit Log"
              isActive={activeView === 'auditLog'}
              onClick={() => setActiveView('auditLog')}
              icon={<FileTextIcon className="w-5 h-5" />}
          />
          <SidebarLink 
              text="Settings" 
              isActive={activeView === 'settings'} 
              onClick={() => setActiveView('settings')}
              icon={<SettingsIcon className="w-5 h-5" />}
          />
        </nav>
      </div>
    </aside>
  );
};