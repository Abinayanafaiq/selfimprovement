'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HabitCard from '@/components/HabitCard';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // New Habit State
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchData = async () => {
    try {
      console.log('Fetching user...');
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' });
      const authData = await authRes.json();
      console.log('User data:', authData);
      
      if (!authData.user) {
        console.log('No user, redirecting to login');
        router.push('/login');
        return;
      }
      setUser(authData.user);

      const habitsRes = await fetch('/api/habits');
      const habitsData = await habitsRes.json();
      setHabits(habitsData.habits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/habits', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, description: newDesc })
    });
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
    fetchData();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;
  }

  // Calculate Monthly Winrate
  // Formula: (Total Completions This Month / (Habits Active * Days Passed in Month)) * 100
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysPassed = Math.max(1, Math.floor((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // Count completions this month across all habits
  let monthlyCompletions = 0;
  habits.forEach((habit: any) => {
      habit.completedDates.forEach((dateStr: string) => { // Assuming filtered by backend, but backend sends all.
          const date = new Date(dateStr);
          if (date >= startOfMonth && date <= now) {
              monthlyCompletions++;
          }
      });
  });

  const totalPossibleWins = habits.length * daysPassed;
  const winRate = totalPossibleWins > 0 ? Math.round((monthlyCompletions / totalPossibleWins) * 100) : 0;

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      <Navbar user={user} />

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
        <div className="glass-panel p-6 bg-blue-50/50 border-blue-100">
            <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Monthly Winrate</h2>
            <p className="text-4xl font-bold text-slate-800">{winRate}%</p>
        </div>
        
        <div className="glass-panel p-6 bg-emerald-50/50 border-emerald-100">
            <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Active Habits</h2>
            <p className="text-4xl font-bold text-slate-800">{habits.length}</p>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-center items-center text-center">
            <h2 className="text-lg font-semibold mb-2">Build Your Legacy</h2>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="btn btn-primary w-full max-w-[200px]"
            >
                {showForm ? 'Cancel' : '+ New Habit'}
            </button>
        </div>
      </div>

      {/* New Habit Form */}
      {showForm && (
        <div className="glass-panel p-6 mb-8 animate-fade-in border-blue-100 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Create New Habit</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <input 
                    placeholder="Habit Title (e.g. Meditate for 10 mins)" 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                />
                <input 
                    placeholder="Description (Optional)" 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                />
                <button className="btn btn-primary self-start">Create Habit</button>
            </form>
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit: any) => (
            <HabitCard key={habit._id} habit={habit} onUpdate={fetchData} />
        ))}
        {habits.length === 0 && !showForm && (
            <div className="col-span-full text-center py-12 text-muted">
                You have no active habits. Start by creating one!
            </div>
        )}
      </div>
    </main>
  );
}
