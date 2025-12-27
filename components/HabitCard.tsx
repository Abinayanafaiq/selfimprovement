'use client';
import { useState } from 'react';

import Link from 'next/link';

interface HabitCardProps {
  habit: any;
  onUpdate: () => void;
  currentUser: any;
}

export default function HabitCard({ habit, onUpdate, currentUser }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Check if completed today by THIS user
  const currentUserId = currentUser?.id || currentUser?._id;
  const isCompletedToday = habit.dailyProgress?.completedBy?.includes(currentUserId) || false;

  const completeHabit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/habits/${habit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      if (res.ok) {
        if (!isCompletedToday) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 1000);
        }
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async () => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
        await fetch(`/api/habits/${habit._id}`, { method: 'DELETE' });
        onUpdate();
    } catch(err) { console.error(err); }
  }

  const handleShare = async () => {
      const username = prompt("Enter username to share with:");
      if (!username) return;
      
      try {
          const res = await fetch(`/api/habits/${habit._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'share', targetUsername: username })
          });
          if (res.ok) {
              alert(`Shared with ${username}`);
              onUpdate();
          } else {
              alert("Failed to share (User not found?)");
          }
      } catch (e) { console.error(e); }
  }

  const isShared = habit.sharedWith && habit.sharedWith.length > 0;

  return (
    <div className={`glass-panel p-6 flex flex-col justify-between h-full relative group hover:shadow-lg hover:-translate-y-1 transition-all border-2 ${isShared ? 'border-orange-100 bg-orange-50/20' : 'border-stone-100'} ${showParticles ? 'completion-glow' : ''}`}>
      
      {/* Particles */}
      {showParticles && (
        <div className="absolute inset-0 z-50 pointer-events-none">
            {[...Array(12)].map((_, i) => (
                <div 
                    key={i} 
                    className="particle w-2 h-2 rounded-full bg-emerald-400"
                    style={{
                        left: '50%',
                        top: '50%',
                        '--tw-translate-x': `${(Math.random() - 0.5) * 200}px`,
                        '--tw-translate-y': `${(Math.random() - 0.5) * 200}px`,
                    } as any}
                />
            ))}
        </div>
      )}

      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-2">
              {isShared && (
                <span className="inline-block px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-wide mb-2 border border-orange-200">
                    Team Habit
                </span>
              )}
              <Link href={`/habit/${habit._id}`} className="block group-hover:text-primary transition-colors w-fit">
                <h3 className="text-xl font-extrabold leading-tight text-stone-800 break-words">{habit.title} →</h3>
              </Link>
          </div>
          
          <button 
            onClick={deleteHabit} 
            className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-500 p-1"
            title="Delete Habit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
      </div>

      <div className="relative z-10 mb-6 flex-1">
        <p className="text-stone-500 text-sm font-medium leading-relaxed line-clamp-3">
            {habit.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t-2 border-dashed border-stone-100/50">
        <div className="flex justify-between items-center mb-3 text-xs font-bold tracking-wide">
            <span className="text-stone-400">{isShared ? 'TEAM STREAK' : 'STREAK'}</span>
            <span className={`text-xl ${isShared ? 'text-orange-500' : 'text-emerald-500'} flex items-center gap-1`}>
                {habit.streak} <span className="text-lg">🔥</span>
            </span>
        </div>

        <button 
          onClick={completeHabit}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all active:scale-95 shadow-lg ${
            isCompletedToday 
            ? (isShared && !habit.completedDates.includes(new Date().toISOString().split('T')[0]) 
                ? 'bg-yellow-400 text-yellow-900 shadow-yellow-200 animate-pulse hover:bg-yellow-500' // Waiting State
                : 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200 shadow-none hover:bg-red-50 hover:text-red-500 hover:border-red-200') // Completed State (Hover to Undo)
            : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 hover:shadow-emerald-300'
          }`}
        >
          {loading ? '...' : isCompletedToday ? (
              isShared && !habit.completedDates.includes(new Date().toISOString().split('T')[0]) 
              ? '⏳ Waiting for Team (Tap to Undo)' 
              : <span className="group-hover:hidden">Completed! 🎉</span>
          ) : 'Mark Complete'}
          {isCompletedToday && !loading && (
             isShared && !habit.completedDates.includes(new Date().toISOString().split('T')[0]) ? null : <span className="hidden group-hover:inline">Undo Completion?</span>
          )}
        </button>
        
        {!isShared && (
            <button onClick={handleShare} className="w-full mt-3 text-xs text-stone-400 hover:text-stone-600 font-bold transition-colors">
                + Invite Friend
            </button>
        )}
      </div>
    </div>
  );
}
