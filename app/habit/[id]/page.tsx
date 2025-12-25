'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function HabitRoom({ params }: { params: Promise<{ id: string }> }) {
  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Unwrap params
    params.then(unwrappedParams => {
        const fetchHabit = async () => {
            try {
                // Get Auth User
                const authRes = await fetch('/api/auth/me');
                const authData = await authRes.json();
                if (!authData.user) {
                    router.push('/login');
                    return;
                }
                setUser(authData.user);

                // Get Habit Details
                const res = await fetch(`/api/habits/${unwrappedParams.id}`);
                const data = await res.json();
                
                if (res.ok) {
                    setHabit(data.habit);
                } else {
                    router.push('/');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHabit();
    });
  }, [params, router]);

  if (loading || !habit) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Room...</div>;
  }

  const members = [habit.userId, ...habit.sharedWith];

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
      <Navbar user={user} />
      
      <div className="mb-8 animate-fade-in">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-primary mb-4 transition-colors">
            ← Back to Dashboard
        </Link>
        
        <div className="glass-panel p-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-2">
                        Team Room
                    </span>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">{habit.title}</h1>
                    <p className="text-slate-500 text-lg">{habit.description || 'No description provided.'}</p>
                </div>
                
                <div className="text-center md:text-right bg-white/50 p-4 rounded-2xl border border-indigo-100">
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-1">Current Streak</p>
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                        {habit.streak} <span className="text-3xl">🔥</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Members Section */}
        <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                👥 Squad Members
            </h2>
            <div className="space-y-4">
                {members.map((m: any) => (
                    <div key={m._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                {m.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">{m.username}</p>
                                <p className="text-xs text-slate-500">Total Wins: {m.wins}</p>
                            </div>
                        </div>
                        {m._id === habit.userId._id && (
                            <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-1 rounded">Owner</span>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                <p className="text-sm text-indigo-600 font-medium">
                    "Alone we go faster, together we go further."
                </p>
            </div>
        </div>

        {/* Activity / Calendar Placeholder (Simplistic for now) */}
        <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                📅 Activity Log
            </h2>
            
            {habit.completedDates && habit.completedDates.length > 0 ? (
                <div className="space-y-3">
                    {habit.completedDates.slice().reverse().slice(0, 5).map((dateStr: string, idx: number) => {
                        const date = new Date(dateStr);
                        return (
                            <div key={idx} className="flex items-center gap-3 text-sm p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-slate-700">Streak extended on</span>
                                <span className="font-mono text-slate-500 ml-auto">
                                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400">
                    No activity yet. Let's get started!
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
