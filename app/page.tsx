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
  const [newPartner, setNewPartner] = useState('');

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
        body: JSON.stringify({ title: newTitle, description: newDesc, partnerUsername: newPartner })
    });
    setNewTitle('');
    setNewDesc('');
    setNewPartner('');
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

        {/* Mascot Evolution Card */}
        <div className="glass-panel p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
            {/* Dynamic Mascot Logic */}
            {(() => {
                const wins = user?.wins || 0;
                let mascot = { stage: 'Seed', emoji: '🌱', scale: 1, next: 5, color: 'bg-green-400' };
                
                if (wins >= 50) mascot = { stage: 'Spirit of the Forest', emoji: '🧚', scale: 1.5, next: 100, color: 'bg-indigo-400' };
                else if (wins >= 20) mascot = { stage: 'Mighty Tree', emoji: '🌳', scale: 1.3, next: 50, color: 'bg-emerald-500' };
                else if (wins >= 5) mascot = { stage: 'Happy Sprout', emoji: '🌿', scale: 1.1, next: 20, color: 'bg-green-500' };

                const progress = Math.min(100, (wins / mascot.next) * 100);

                return (
                    <>
                         {/* Background Blob */}
                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${mascot.color} rounded-full opacity-20 animate-pulse transition-all duration-1000`}></div>
                        
                        {/* Mascot Emoji */}
                        <div className="relative z-10 mb-2 transform transition-transform duration-500 hover:scale-125 cursor-pointer" style={{ fontSize: '4rem' }}>
                            {mascot.emoji}
                        </div>
                        
                        {/* Title & Level */}
                        <h2 className="text-lg font-black text-stone-700 leading-tight">{mascot.stage}</h2>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-3">Lvl. {Math.floor(wins / 5) + 1}</p>

                        {/* Evolution Progress Bar */}
                        <div className="w-full bg-stone-100 rounded-full h-2 mb-1 overflow-hidden">
                            <div className={`h-full ${mascot.color} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-[10px] text-stone-400 font-bold">{wins} / {mascot.next} Wins to Evolve</p>

                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="btn btn-primary w-full mt-4 z-10 text-sm py-2"
                        >
                            {showForm ? 'Cancel' : '+ New Habit'}
                        </button>
                    </>
                );
            })()}
        </div>
      </div>

      {/* New Habit Form */}
      {showForm && (
        <div className="glass-panel p-8 mb-8 animate-fade-in border-stone-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 font-[900] text-9xl text-stone-300 pointer-events-none rotate-12">
                +
            </div>
            
            <h3 className="text-2xl font-black mb-6 text-stone-800 flex items-center gap-2">
                Create New Habit <span className="px-2 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-500">Solo or Team</span>
            </h3>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-4 relative z-10">
                <input 
                    placeholder="Habit Title (e.g. Drink Water)" 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    className="p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-green-400 focus:bg-white text-lg font-bold placeholder-stone-400"
                />
                <input 
                    placeholder="Why do you want to build this habit?" 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-green-400 focus:bg-white font-medium placeholder-stone-400"
                />
                <div className="p-4 bg-orange-50/50 rounded-2xl border-2 border-orange-100">
                    <label className="block text-xs font-bold text-orange-800 uppercase mb-2">Grow Together (Optional)</label>
                    <input 
                        placeholder="Partner Username" 
                        value={newPartner}
                        onChange={e => setNewPartner(e.target.value)}
                        className="w-full p-3 bg-white border-2 border-orange-200 rounded-xl focus:border-orange-400 outline-none font-bold text-orange-900 placeholder-orange-300/70"
                    />
                </div>
                <button className="btn btn-primary self-start text-lg px-8 py-4 shadow-xl shadow-green-200 mt-2">✨ Create Habit</button>
            </form>
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit: any) => (
            <HabitCard key={habit._id} habit={habit} onUpdate={fetchData} currentUser={user} />
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
