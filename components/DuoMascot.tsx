'use client';

import { useMemo } from 'react';

interface DuoMascotProps {
    habit: any;
    members: any[];
}

export default function DuoMascot({ habit, members }: DuoMascotProps) {
    const { streak, dailyProgress } = habit;
    
    // Determine Stage
    const mascot = useMemo(() => {
        if (streak >= 50) return { emoji: '🔥🦅', stage: 'Golden Phoenix', color: 'bg-orange-500', next: 100 };
        if (streak >= 30) return { emoji: '🐲', stage: 'Mighty Dragon', color: 'bg-emerald-600', next: 50 };
        if (streak >= 14) return { emoji: '🐕', stage: 'Loyal Shiba', color: 'bg-amber-500', next: 30 };
        if (streak >= 7) return { emoji: '🐱', stage: 'Playful Cat', color: 'bg-indigo-400', next: 14 };
        if (streak >= 3) return { emoji: '🐥', stage: 'Hatchling Chick', color: 'bg-yellow-400', next: 7 };
        return { emoji: '🥚', stage: 'Mysterious Egg', color: 'bg-stone-300', next: 3 };
    }, [streak]);

    // Determine Mood / Status
    const status = useMemo(() => {
        const completedCount = dailyProgress?.completedBy?.length || 0;
        const totalMembers = members.length;

        if (completedCount >= totalMembers) {
            return { icon: '✨', text: 'Spirit is Glowing!', sub: 'Both of you passed today!', mood: 'happy' };
        }
        if (completedCount > 0) {
            return { icon: '⏳', text: 'Waiting for Partner...', sub: 'One of you is still working!', mood: 'expectant' };
        }
        return { icon: '💤', text: 'Team is Sleeping', sub: 'No activity detected yet.', mood: 'sleepy' };
    }, [dailyProgress, members]);

    const progress = Math.min(100, (streak / mascot.next) * 100);

    return (
        <div className="glass-panel p-6 bg-gradient-to-br from-white to-stone-50 border-stone-100 relative overflow-hidden group">
            <div className="flex flex-col items-center text-center relative z-10">
                {/* Mascot Visual */}
                <div className="relative mb-4">
                    <div className={`absolute inset-0 ${mascot.color} opacity-20 blur-2xl rounded-full scale-150 animate-pulse`}></div>
                    <div className={`text-7xl transition-transform duration-500 group-hover:scale-110 cursor-pointer relative ${status.mood === 'happy' ? 'animate-bounce' : 'animate-float'}`} style={{ animationDuration: '3s' }}>
                        {mascot.emoji}
                        <span className="absolute -top-2 -right-2 text-2xl drop-shadow-sm">{status.icon}</span>
                    </div>
                </div>

                {/* Info */}
                <h3 className="text-xl font-black text-stone-800 mb-1">{mascot.stage}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-stone-100 rounded-full text-[10px] font-black text-stone-500 uppercase">Squad Spirit</span>
                    <span className="text-xs font-bold text-stone-400">Streak: {streak}d</span>
                </div>

                {/* Progress */}
                <div className="w-full max-w-[200px] mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase mb-1">
                        <span>Lvl. {Math.floor(streak / 5) + 1}</span>
                        <span>{streak} / {mascot.next}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${mascot.color} transition-all duration-1000 ease-out`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`p-4 rounded-2xl w-full border ${status.mood === 'happy' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-stone-50 border-stone-100 text-stone-500'}`}>
                    <p className="font-bold text-sm mb-0.5">{status.text}</p>
                    <p className="text-[10px] font-medium opacity-80">{status.sub}</p>
                </div>
            </div>

            {/* Background Decoration */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${mascot.color} opacity-5 rounded-full pointer-events-none`}></div>
        </div>
    );
}
