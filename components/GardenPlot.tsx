'use client';

import { useMemo } from 'react';

interface GardenPlotProps {
    habit: any;
}

export default function GardenPlot({ habit }: GardenPlotProps) {
    const { streak, title, completedDates, sharedWith } = habit;
    
    const isShared = sharedWith && sharedWith.length > 0;
    
    // Determine Plant Stage based on Streak
    const gardenData = useMemo(() => {
        if (streak >= 100) return { emoji: '✨🌳✨', stage: 'Ancient Spirit', scale: 'scale-150' };
        if (streak >= 50) return { emoji: '🌲', stage: 'Mighty Tree', scale: 'scale-125' };
        if (streak >= 30) return { emoji: '🌳', stage: 'Small Tree', scale: 'scale-110' };
        if (streak >= 14) return { emoji: '🌻', stage: 'Flower', scale: 'scale-105' };
        if (streak >= 7) return { emoji: '🌿', stage: 'Herb', scale: 'scale-100' };
        if (streak >= 3) return { emoji: '🌱', stage: 'Sprout', scale: 'scale-95' };
        return { emoji: '🌰', stage: 'Seed', scale: 'scale-90' };
    }, [streak]);

    // Check if watered (completed today)
    const isWatered = useMemo(() => {
        if (!completedDates || completedDates.length === 0) return false;
        const lastCompleted = new Date(completedDates[completedDates.length - 1]).toDateString();
        const today = new Date().toDateString();
        return lastCompleted === today;
    }, [completedDates]);

    return (
        <div className="flex flex-col items-center group relative cursor-help p-2" title={`${title}: ${streak} day streak`}>
            {/* Plot Surface */}
            <div className={`absolute bottom-4 w-12 h-4 rounded-full bg-stone-200/50 -z-10 transition-colors ${isShared ? 'bg-amber-100/50' : ''}`}></div>
            
            {/* Team Glow */}
            {isShared && (
                <div className="absolute inset-0 rounded-full glow-team opacity-30 -z-20 pointer-events-none"></div>
            )}

            {/* Plant Emoji */}
            <div className={`text-3xl transition-all duration-700 relative z-10 ${gardenData.scale} ${isWatered ? 'animate-float drop-shadow-md' : 'opacity-50 grayscale-[40%]'}`}>
                {gardenData.emoji}
                
                {/* Team Indicator */}
                {isShared && (
                    <div className="absolute -top-1 -left-1 text-[10px] bg-amber-400 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        👥
                    </div>
                )}
            </div>

            {/* Watering Reminder */}
            {!isWatered && (
                <div className="absolute top-0 right-0 animate-water text-blue-400 text-sm">
                    💧
                </div>
            )}
            
            {/* Label (Optional hover) */}
            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap z-50">
                {title} ({streak}d)
            </div>
        </div>
    );
}
