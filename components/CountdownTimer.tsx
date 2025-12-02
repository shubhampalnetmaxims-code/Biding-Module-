import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons';

interface CountdownTimerProps {
    endDate: string;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(date);
    } catch (e) {
        return dateString; // fallback
    }
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const hasTimeLeft = Object.keys(timeLeft).length > 0;
    
    const renderTimeStatus = () => {
        if (!hasTimeLeft) {
            const difference = +new Date() - +new Date(endDate);
            const totalHoursPassed = Math.floor(difference / (1000 * 60 * 60));

            let timeAgo = '';
            if (totalHoursPassed >= 1) {
                timeAgo = `${totalHoursPassed}hr${totalHoursPassed !== 1 ? 's' : ''} ago`;
            } else {
                const totalMinutesPassed = Math.floor(difference / (1000 * 60));
                if (totalMinutesPassed >= 1) {
                    timeAgo = `${totalMinutesPassed}m ago`;
                } else {
                    timeAgo = `just now`;
                }
            }

            return (
                <div className="flex items-center gap-1.5 text-sm">
                    <ClockIcon className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">Ended {timeAgo}</span>
                </div>
            );
        }
        
        const totalHoursLeft = (timeLeft.days || 0) * 24 + (timeLeft.hours || 0);
        
        let displayTime = '';
        if (totalHoursLeft >= 1) {
            displayTime = `${totalHoursLeft}hr${totalHoursLeft !== 1 ? 's' : ''}`;
        } else if (timeLeft.minutes > 0) {
            displayTime = `${timeLeft.minutes}m ${String(timeLeft.seconds).padStart(2, '0')}s`;
        } else {
            displayTime = `${timeLeft.seconds}s`;
        }
        
        const timerColorClass = totalHoursLeft < 1 ? 'text-red-600' : totalHoursLeft < 24 ? 'text-amber-600' : 'text-slate-800';

        return (
            <div className="flex items-center gap-1.5 text-sm">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Ends in:</span>
                <span className={`font-semibold ${timerColorClass}`}>
                    {displayTime}
                </span>
            </div>
        );
    }


    return (
        <div className="space-y-0.5">
            {renderTimeStatus()}
            <div className="text-xs text-slate-500 pl-[22px]">
                {formatDate(endDate)}
            </div>
        </div>
    );
};