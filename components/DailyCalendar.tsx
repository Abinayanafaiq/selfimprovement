'use client';

import React, { useState } from 'react';

interface DailyCalendarProps {
    completedDays: string[] | Date[];
}

export default function DailyCalendar({ completedDays }: DailyCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const isCompleted = (day: number) => {
        const checkDate = new Date(year, month, day);
        checkDate.setHours(0, 0, 0, 0);
        return completedDays.some(d => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date.getTime() === checkDate.getTime();
        });
    };

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="glass-panel p-6 bg-white/70 border-stone-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-40 -mr-10 -mt-10"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
                    <span className="text-2xl">📅</span> Journey Log
                </h2>
                <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-stone-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm font-black text-stone-700 uppercase tracking-widest min-w-[120px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-stone-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 relative z-10">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-stone-300 mb-2 uppercase">{d}</div>
                ))}
                
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {Array.from({ length: totalDays }).map((_, i) => {
                    const day = i + 1;
                    const completed = isCompleted(day);
                    const isToday = new Date(year, month, day).setHours(0,0,0,0) === today.getTime();
                    
                    return (
                        <div 
                            key={day} 
                            className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold relative transition-all duration-300
                                ${completed ? 'text-emerald-700' : 'text-stone-400'}
                                ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                                hover:scale-110 cursor-default
                            `}
                        >
                            <span className="relative z-10">{day}</span>
                            
                            {completed && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* The "Crossed Out" Effect */}
                                    <div className="w-4/5 h-0.5 bg-emerald-400/60 rounded-full rotate-45 absolute transition-all duration-700 animate-fade-in"></div>
                                    <div className="w-4/5 h-0.5 bg-emerald-400/60 rounded-full -rotate-45 absolute transition-all duration-700 animate-fade-in"></div>
                                    {/* Soft Glow Background */}
                                    <div className="w-full h-full bg-emerald-50 rounded-lg absolute inset-0 opacity-50"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-6 flex justify-between items-center bg-stone-50/50 p-3 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-sm rotate-45"></div>
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-tighter">Daily Win</span>
                </div>
                <div className="text-[10px] font-bold text-stone-400 italic">"Consistency is the key 🗝️"</div>
            </div>
        </div>
    );
}
