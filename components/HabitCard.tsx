'use client';
import { useState } from 'react';

interface HabitProps {
  habit: any;
  onUpdate: () => void;
}

export default function HabitCard({ habit, onUpdate }: HabitProps) {
  const [loading, setLoading] = useState(false);

  // Check if completed today
  const isCompletedToday = habit.completedDates.some((date: string) => {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  });

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

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full relative group hover:shadow-lg transition-shadow">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={deleteHabit} className="text-xs text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded">Delete</button>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2 text-slate-800">{habit.title}</h3>
        <p className="text-muted text-sm mb-4 line-clamp-2">{habit.description || 'No description'}</p>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-4 text-xs text-muted font-mono">
            <span>Streak: <strong className="text-blue-600">{habit.streak}</strong> 🔥</span>
            <div className="flex gap-2">
                {habit.sharedWith.length > 0 && <span className="text-blue-500" title="Shared Habit">👥</span>}
                <button onClick={handleShare} className="hover:text-blue-600 transition-colors">↗ Share</button>
            </div>
        </div>

        <button 
          onClick={completeHabit}
          disabled={isCompletedToday || loading}
          className={`w-full btn ${isCompletedToday 
            ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' 
            : 'btn-primary'}`}
        >
          {loading ? '...' : isCompletedToday ? 'Completed Today' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
}
