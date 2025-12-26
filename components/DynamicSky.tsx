'use client';

import { useState, useEffect } from 'react';

export default function DynamicSky() {
    const [timeState, setTimeState] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

    useEffect(() => {
        const updateTime = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) setTimeState('morning');
            else if (hour >= 12 && hour < 17) setTimeState('afternoon');
            else if (hour >= 17 && hour < 20) setTimeState('evening');
            else setTimeState('night');
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const config = {
        morning: {
            bg: 'from-sky-300 via-sky-100 to-amber-50',
            icon: '☀️',
            title: 'Good Morning!',
            sub: 'A fresh start for your garden.',
            decoration: '☁️'
        },
        afternoon: {
            bg: 'from-blue-400 via-sky-200 to-white',
            icon: '🌤️',
            title: 'Good Afternoon!',
            sub: 'The sun is high, keep it up!',
            decoration: '☁️'
        },
        evening: {
            bg: 'from-orange-400 via-pink-300 to-indigo-900',
            icon: '🌅',
            title: 'Good Evening!',
            sub: 'The golden hour is here.',
            decoration: '✨'
        },
        night: {
            bg: 'from-slate-900 via-indigo-950 to-slate-900',
            icon: '🌙',
            title: 'Good Night!',
            sub: 'Rest well, the spirit sleeps.',
            decoration: '⭐'
        }
    }[timeState];

    return (
        <div className={`relative w-full h-48 rounded-[2.5rem] overflow-hidden bg-gradient-to-b ${config.bg} shadow-xl border-4 border-white transition-all duration-1000`}>
            {/* Moving Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-8 left-1/4 text-4xl opacity-20 animate-float" style={{ animationDuration: '10s' }}>{config.decoration}</div>
                <div className="absolute top-12 right-1/4 text-4xl opacity-20 animate-float" style={{ animationDuration: '15s', animationDelay: '2s' }}>{config.decoration}</div>
                <div className="absolute bottom-4 left-1/2 text-2xl opacity-10 animate-pulse">{config.decoration}</div>
            </div>

            {/* Glowing Sun/Moon */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                <div className="text-6xl mb-2 drop-shadow-2xl animate-pulse" style={{ animationDuration: '4s' }}>
                    {config.icon}
                </div>
                <h1 className={`text-2xl font-black uppercase tracking-tighter ${timeState === 'night' ? 'text-white' : 'text-stone-800'} drop-shadow-sm`}>
                    {config.title}
                </h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${timeState === 'night' ? 'text-indigo-200' : 'text-stone-500'}`}>
                    {config.sub}
                </p>
            </div>

            {/* Horizontal Line Decor */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent"></div>
        </div>
    );
}
