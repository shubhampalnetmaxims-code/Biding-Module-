import React from 'react';

export type Tab = 
  | 'Booth Description'
  | 'Business Details'
  | 'Contact & Social'
  | 'Documents'
  | 'Terms and Conditions'
  | 'Invoice/Payment'
  | 'Bidding Module'
  | 'My Booths';

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex flex-wrap gap-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};