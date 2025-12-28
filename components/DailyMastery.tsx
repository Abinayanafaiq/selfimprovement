'use client';

import { useState, useEffect } from 'react';

interface DailyMasteryProps {
    habits: any[];
    user: any;
    onUpdate: () => void;
}

export default function DailyMastery({ habits, user, onUpdate }: DailyMasteryProps) {
    const [isDone, setIsDone] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const currentUserId = user?.id || user?._id;
    // Filter habits completed today by the current user
    const completedHabits = habits.filter(h => h.dailyProgress?.completedBy?.includes(currentUserId));
    const totalHabits = habits.length;
    const habitProgress = totalHabits > 0 ? Math.round((completedHabits.length / totalHabits) * 100) : 0;

    // Daily Tasks progress
    const today = new Date().toISOString().split('T')[0];
    const dailyTasks = user?.dailyPlan || [];
    const completedTasks = dailyTasks.filter((t: any) => t.completed);
    const taskProgress = dailyTasks.length > 0 ? Math.round((completedTasks.length / dailyTasks.length) * 100) : 0;

    const overallProgress = totalHabits > 0 || dailyTasks.length > 0
        ? Math.round(((completedHabits.length + completedTasks.length) / (totalHabits + dailyTasks.length)) * 100)
        : 0;

    const isFullyComplete = overallProgress === 100 && (totalHabits > 0 || dailyTasks.length > 0);

    const handleMarkDayDone = async () => {
        try {
            const res = await fetch('/api/user/win', { method: 'POST' });
            if (res.ok) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2000);
                onUpdate(); // Refetch user data to update wins and completedDays
            }
        } catch (error) {
            console.error('Error securing win:', error);
        }
    };

    return (
        <div className={`glass-panel p-6 mb-12 relative overflow-hidden transition-all duration-700 ${isFullyComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -mr-20 -mt-20 transition-colors ${isFullyComplete ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Left Side: Stats */}
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{isFullyComplete ? '🏆' : '🎯'}</span>
                        <h2 className="text-2xl font-black text-stone-800 tracking-tight">
                            {isFullyComplete ? 'Day Mastered!' : "Today's Mission"}
                        </h2>
                    </div>
                    <p className="text-stone-500 font-bold text-sm uppercase tracking-widest mb-6">
                        {isFullyComplete ? 'You’ve reached 100% completion' : `${completedHabits.length}/${totalHabits} Habits • ${completedTasks.length}/${dailyTasks.length} Tasks`}
                    </p>

                    {/* Progress Bar Layer */}
                    <div className="relative h-4 w-full bg-stone-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${isFullyComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Right Side: Action/Inspiration */}
                <div className="flex flex-col items-center gap-4 text-center">
                    {isFullyComplete ? (
                        <div className="animate-fade-in text-center">
                            <p className="text-emerald-700 font-black text-lg mb-2 italic">"Victory belongs to the most persevering."</p>
                            <button 
                                onClick={handleMarkDayDone}
                                className="btn bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-200 py-3 px-8 transform hover:scale-105 active:scale-95 transition-all"
                            >
                                Secure Your Daily Win ✨
                            </button>
                        </div>
                    ) : (
                        <div className="text-stone-400 font-bold text-sm py-4">
                            Complete all items to secure the day!
                        </div>
                    )}
                </div>
            </div>

            {/* Preparation for Tomorrow Section (Only if complete) */}
            {isFullyComplete && (
                <div className="mt-8 pt-6 border-t border-emerald-100 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-emerald-800 font-bold">
                            <span className="bg-emerald-200 px-2 py-1 rounded-md text-[10px] uppercase tracking-tighter mr-2">PRO TIP</span>
                            Planning for tomorrow now increases success rate by 40%.
                        </div>
                        <button 
                            onClick={() => {
                                const el = document.getElementById('daily-plan-input');
                                el?.focus();
                                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-2 group"
                        >
                            Mark up for tomorrow <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Confetti Overlay Effect */}
            {showConfetti && (
                <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div 
                            key={i} 
                            className="particle w-3 h-3 rounded-sm bg-emerald-400 animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: ['#4ADE80', '#FACC15', '#60A5FA', '#F87171'][i % 4],
                                '--tw-translate-y': `-${Math.random() * 500}px`,
                                '--tw-translate-x': `${(Math.random() - 0.5) * 200}px`,
                            } as any}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
