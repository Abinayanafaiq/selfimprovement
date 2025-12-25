'use client';
import { useState } from 'react';

import Link from 'next/link';

interface HabitCardProps {
  habit: any;
  onUpdate: () => void;
  currentUser: any;
}

export default function HabitCard({ habit, onUpdate, currentUser }: { habit: any, onUpdate: () => void, currentUser: any }) {
  const [loading, setLoading] = useState(false);

  // Check if completed today by THIS user
  const isCompletedToday = habit.dailyProgress?.completedBy?.includes(currentUser?._id) || false;

  const completeHabit = async () => {
    if (loading || isCompletedToday) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/habits/${habit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      if (res.ok) {
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
    <div className={`glass-panel p-6 flex flex-col justify-between h-full relative group hover:shadow-lg transition-all border-2 ${isShared ? 'border-orange-100 bg-orange-50/20' : 'border-stone-100'}`}>
      <div className="absolute top-4 right-4 flex gap-2">
        {isShared && (
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wide">
                Team Habit
            </span>
        )}
        <button onClick={deleteHabit} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-500 hover:text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">Delete</button>
      </div>

      <div className="relative z-10">
        <Link href={`/habit/${habit._id}`} className="block group-hover:text-primary transition-colors w-fit">
            <h3 className="text-xl font-extrabold mb-2 text-stone-800">{habit.title} →</h3>
        </Link>
        <p className="text-muted text-sm mb-4 line-clamp-2">{habit.description || 'No description'}</p>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-4 text-xs text-muted font-bold tracking-wide">
            <span>{isShared ? 'TEAM STREAK' : 'STREAK'}</span>
            <span className={`text-xl ${isShared ? 'text-orange-500' : 'text-green-500'}`}>{habit.streak} 🔥</span>
        </div>

        <button 
          onClick={completeHabit}
          disabled={isCompletedToday || loading}
          className={`w-full btn ${isCompletedToday 
            ? 'bg-emerald-100 text-emerald-700 cursor-default border-2 border-emerald-200 shadow-none' 
            : 'btn-primary'}`}
        >
          {loading ? '...' : isCompletedToday ? (isShared && !habit.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'Done! Waiting for Friend...' : 'Completed! 🎉') : 'Mark Complete'}
        </button>
        
        {!isShared && (
            <button onClick={handleShare} className="w-full mt-2 text-xs text-stone-400 hover:text-stone-600 font-bold">
                + Invite Friend
            </button>
        )}
      </div>
    </div>
  );
}
