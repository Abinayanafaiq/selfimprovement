'use client';

import React, { useMemo } from 'react';

interface ProgressMapProps {
    streak: number;
    maxStreak?: number;
    user: any;
    partner: any;
}

export default function ProgressMap({ streak, maxStreak = 30, user, partner }: ProgressMapProps) {
    // Current progress percentage (0 to 1)
    const progress = Math.min(1, streak / maxStreak);

    // SVG Path definition (Winding Road)
    // Using a simple S-curve path
    const pathD = "M 50 350 C 50 200, 450 200, 450 50";
    
    // Checkpoints (Flags)
    const checkpoints = [
        { label: '7 Days', pos: 7/30, icon: '🌲' },
        { label: '14 Days', pos: 14/30, icon: '🏔️' },
        { label: '21 Days', pos: 21/30, icon: '🏕️' },
        { label: '30 Days', pos: 1, icon: '🏰' }
    ];

    return (
        <div className="glass-panel p-8 bg-[#FDFBF7] border-stone-200 relative overflow-hidden shadow-2xl">
            {/* Background Texture (Grass/Dirt) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tighter">Team Journey 🗺️</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Walking together towards mastery</p>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black text-orange-500 drop-shadow-sm">{streak}</span>
                        <span className="text-xs font-black text-stone-400 ml-1">DAYS</span>
                    </div>
                </div>

                {/* The Map Canvas */}
                <div className="relative w-full aspect-[4/3] bg-stone-100/50 rounded-[2.5rem] border-4 border-white shadow-inner overflow-hidden">
                    {/* SVG Progress Road */}
                    <svg viewBox="0 0 500 400" className="absolute inset-0 w-full h-full p-4">
                        {/* Road Background (Shadow) */}
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#E2E8F0" 
                            strokeWidth="24" 
                            strokeLinecap="round" 
                        />
                        {/* The Actual Road */}
                        <path 
                            id="progress-path"
                            d={pathD} 
                            fill="none" 
                            stroke="#D4D4D8" 
                            strokeWidth="20" 
                            strokeLinecap="round" 
                            strokeDasharray="4,8"
                        />
                        {/* Completed Road Glow */}
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#4ADE80" 
                            strokeWidth="12" 
                            strokeLinecap="round" 
                            style={{ 
                                strokeDasharray: '1000', 
                                strokeDashoffset: `${1000 - (progress * 1000)}`,
                                transition: 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                            className="opacity-40"
                        />

                        {/* Flags/Checkpoints */}
                        {checkpoints.map((cp, idx) => (
                            <g key={idx}>
                                {process.env.NODE_ENV === 'test' ? null : (
                                    /* This is a bit complex for raw SVG, let's use foreignObject or manual points */
                                    /* For simplicity in this demo, I'll use fixed points that roughly match the C-curve */
                                    null 
                                )}
                            </g>
                        ))}
                    </svg>

                    {/* Milestones (Manual Position for simplicity) */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-8 -translate-x-4 flex flex-col items-center">
                        <div className="text-2xl">🌲</div>
                        <span className="text-[8px] font-black text-stone-400 uppercase bg-white/80 px-2 py-0.5 rounded-full">Day 7</span>
                    </div>
                    <div className="absolute top-1/4 right-1/4 -translate-y-4 flex flex-col items-center">
                        <div className="text-2xl">⛰️</div>
                        <span className="text-[8px] font-black text-stone-400 uppercase bg-white/80 px-2 py-0.5 rounded-full">Day 15</span>
                    </div>
                    <div className="absolute top-8 right-8 flex flex-col items-center">
                        <div className="text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🏰</div>
                        <span className="text-[9px] font-black text-amber-600 uppercase bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">The Vault</span>
                    </div>

                    {/* Walking Avatars */}
                    {/* We use CSS offset-path to make them walk on the SVG path! */}
                    <div 
                        className="absolute w-14 h-14 flex items-center justify-center text-4xl p-2 rounded-2xl shadow-xl transition-all duration-[2000ms] cubic-bezier(0.34, 1.56, 0.64, 1) z-50 hover:scale-125 cursor-default group"
                        style={{ 
                            offsetPath: `path("${pathD}")`,
                            offsetDistance: `${progress * 100}%`,
                            backgroundColor: user.avatarColor || '#4ADE80',
                            // Add a slight delay for the partner for visual separation
                            marginTop: '-20px'
                        }}
                    >
                        <span className="animate-float" style={{ animationDuration: '3s' }}>
                            {user.avatarEmoji || '👤'}
                        </span>
                        {/* Name Tag */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase whitespace-nowrap">
                            {user.username}
                        </div>
                    </div>

                    {partner && (
                        <div 
                            className="absolute w-12 h-12 flex items-center justify-center text-3xl p-2 rounded-2xl shadow-xl transition-all duration-[2000ms] cubic-bezier(0.34, 1.56, 0.64, 1) z-40 hover:scale-125 cursor-default group"
                            style={{ 
                                offsetPath: `path("${pathD}")`,
                                offsetDistance: `${progress * 100}%`,
                                backgroundColor: partner.avatarColor || '#6366f1',
                                // Offset slightly behind the user
                                marginLeft: '-24px',
                                marginTop: '20px',
                                transitionDelay: '300ms'
                            }}
                        >
                            <span className="animate-float" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                                {partner.avatarEmoji || '👥'}
                            </span>
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800/80 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase whitespace-nowrap">
                                {partner.username}
                            </div>
                        </div>
                    )}

                    {/* Ground Shadows/Plants */}
                    <div className="absolute bottom-4 left-8 text-2xl opacity-10">🌿</div>
                    <div className="absolute top-1/2 right-12 text-2xl opacity-10 rotate-12">🌿</div>
                </div>

                {/* Legend/Info */}
                <div className="mt-6 flex justify-between items-center bg-stone-50 p-4 rounded-3xl border border-stone-100">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span className="text-[10px] font-black text-stone-500 uppercase">Track On</span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-500">
                            <span className="text-[10px] font-black uppercase">Goal:</span>
                            <span className="text-[10px] font-bold">{30 - streak} Days Left</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold italic text-stone-400">"Every step matters..."</p>
                </div>
            </div>
        </div>
    );
}
