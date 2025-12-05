import React from 'react';
import { LocationPinIcon, CalendarIcon, MapIcon, MoreHorizontalIcon, ChevronDownIcon, BellIcon } from './icons';

interface EventHeaderProps {
  onOpenNotifications?: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ onOpenNotifications }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src="https://picsum.photos/64" alt="Event logo" className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-cover" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Nova Multifest 2025</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <LocationPinIcon className="w-4 h-4" />
              <span>ALDERLY LANDING, DARTMOUTH</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              <span>2025-07-24 to 2025-07-27</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-pink-600" />
              <a href="#" className="text-pink-600 hover:underline font-medium">Event map</a>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center text-slate-500">
        <button className="p-2 rounded-full hover:bg-slate-100">
          <MoreHorizontalIcon />
        </button>
        <button className="p-2 rounded-full hover:bg-slate-100">
          <ChevronDownIcon />
        </button>
      </div>
    </div>
  );
};