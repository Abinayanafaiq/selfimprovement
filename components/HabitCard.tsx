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
    <div className={`glass-panel p-6 flex flex-col justify-between h-full relative group hover:shadow-lg transition-shadow ${isShared ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
      <div className="absolute top-4 right-4 flex gap-2">
        {isShared && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wide">
                Team Habit
            </span>
        )}
        <button onClick={deleteHabit} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-500 hover:text-red-600 bg-red-50 px-2 py-0.5 rounded">Delete</button>
      </div>

      <div>
        <Link href={`/habit/${habit._id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="text-xl font-bold mb-2 text-slate-800">{habit.title} →</h3>
        </Link>
        <p className="text-muted text-sm mb-4 line-clamp-2">{habit.description || 'No description'}</p>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-4 text-xs text-muted font-mono">
            <span>{isShared ? 'Team Streak' : 'Streak'}: <strong className={`text-lg ${isShared ? 'text-indigo-600' : 'text-blue-600'}`}>{habit.streak}</strong> 🔥</span>
            <div className="flex gap-2">
                {!isShared && <button onClick={handleShare} className="hover:text-blue-600 transition-colors">↗ Share</button>}
            </div>
        </div>

        <button 
          onClick={completeHabit}
          disabled={isCompletedToday || loading}
          className={`w-full btn ${isCompletedToday 
            ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' 
            : isShared ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'btn-primary'}`}
        >
          {loading ? '...' : isCompletedToday ? (isShared && !habit.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'Done! Waiting for Team...' : 'Completed Today') : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
}
