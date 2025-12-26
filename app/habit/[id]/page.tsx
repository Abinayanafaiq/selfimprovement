'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import GardenPlot from '@/components/GardenPlot';
import DuoMascot from '@/components/DuoMascot';
import TimeCapsule from '@/components/TimeCapsule';
import DailyBillboard from '@/components/DailyBillboard';

import ProgressMap from '@/components/ProgressMap';

export default function HabitRoom({ params }: { params: Promise<{ id: string }> }) {
  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
        await fetch(`/api/habits/${habit._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'chat', message: newMessage })
        });
        setNewMessage('');
        // Refresh data
        const res = await fetch(`/api/habits/${habit._id}`);
        const data = await res.json();
        setHabit(data.habit);
    } catch (err) {
        console.error(err);
    }
  };

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
                    console.log('Failed to fetch habit:', data);
                }
            } catch (err) {
                console.error('Error fetching habit:', err);
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

  const members = habit ? [habit.userId, ...habit.sharedWith] : [];
  const partner = members.find((m: any) => m._id.toString() !== user?.id?.toString());

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
      <Navbar user={user} />
      
      <div className="mb-8 animate-fade-in space-y-8">
        <Link href="/" className="group inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-100 rounded-2xl text-stone-500 font-bold hover:border-green-400 hover:text-green-600 transition-all shadow-sm hover:shadow-md active:scale-95">
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Dashboard
        </Link>
        
        {/* Progress Map Section (NEW) */}
        <ProgressMap 
            streak={habit.streak} 
            user={user} 
            partner={partner} 
        />

        <div className="glass-panel p-8 relative overflow-hidden bg-white/40">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-2">
                        Squad HQ
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{habit.title}</h1>
                    <p className="text-slate-500 text-lg mb-4 font-medium">{habit.description || 'No description provided.'}</p>
                    
                    {/* Habit Growth Visualization */}
                    <div className="inline-flex items-center gap-4 p-4 bg-stone-100/30 rounded-3xl border border-stone-100/50 backdrop-blur-sm">
                        <div className="w-16 h-16 flex items-center justify-center bg-white/50 rounded-2xl shadow-sm border border-stone-100">
                            <GardenPlot habit={habit} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Team Growth</p>
                            <p className="text-sm font-bold text-stone-600">The forest is thriving!</p>
                        </div>
                    </div>
                </div>
                
                <div className="text-center md:text-right bg-white p-6 rounded-[2.5rem] border-4 border-indigo-50 shadow-xl min-w-[160px]">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Current Streak</p>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center md:justify-end gap-2">
                        {habit.streak} <span className="text-4xl">🔥</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Members & Mascot Section */}
        <div className="space-y-6">
            <div className="glass-panel p-8 animate-fade-in border-stone-100" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-2">
                    👥 Squad Members
                </h2>
                <div className="space-y-4">
                    {members.map((m: any, idx: number) => (
                        <div key={m._id} className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border-2 border-stone-100 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-3">
                                <div 
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-4 border-white`}
                                    style={{ backgroundColor: m.avatarColor || '#E2E8F0' }}
                                >
                                    {m.avatarEmoji || m.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-stone-800 text-lg tracking-tight">{m.username}</p>
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Lvl. {Math.floor((m.wins || 0) / 10) + 1} Spirit</p>
                                </div>
                            </div>
                            {m._id === habit.userId._id && (
                                <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 uppercase tracking-widest">Leader</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Duo Mascot Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <DuoMascot habit={habit} members={members} />
            </div>

            {/* Time Capsule Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <TimeCapsule habit={habit} currentUser={user} onUpdate={() => {
                     fetch(`/api/habits/${habit._id}`).then(r => r.json()).then(data => setHabit(data.habit));
                }} />
            </div>

            {/* Daily Billboard Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <DailyBillboard habit={habit} currentUser={user} onUpdate={() => {
                     fetch(`/api/habits/${habit._id}`).then(r => r.json()).then(data => setHabit(data.habit));
                }} />
            </div>
            
            <div className="p-6 bg-yellow-50/50 rounded-3xl border-2 border-yellow-100 text-center relative overflow-hidden">
                 <div className="absolute -left-4 -top-4 text-6xl opacity-10 rotate-12">❝</div>
                <p className="text-sm text-yellow-800 font-bold italic relative z-10">
                    "Alone we go faster, together we go further."
                </p>
            </div>
        </div>

        {/* Activty Log & Chat */}
        <div className="space-y-6">
            {/* Chat Section */}
            <div className="glass-panel p-6 animate-fade-in flex flex-col h-[600px] border-stone-100 relative" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
                    💬 Team Chat
                </h2>
                
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                    {habit.chat && habit.chat.length > 0 ? (
                        habit.chat.map((msg: any, idx: number) => {
                           // Fallback if sender is null (deleted user)
                           const senderId = msg.sender?._id || msg.sender; 
                           const senderName = msg.sender?.username || 'Unknown';
                           const isMe = senderId === user?.id;
                           
                           return (
                               <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm ${isMe ? 'bg-green-500 text-white rounded-br-none' : 'bg-stone-100 text-stone-700 rounded-bl-none border border-stone-200'}`}>
                                       {!isMe && <p className="text-[10px] opacity-60 mb-1 font-bold uppercase tracking-wide text-stone-500">{senderName}</p>}
                                       <p className="leading-relaxed">{msg.message}</p>
                                   </div>
                               </div>
                           );
                        })
                    ) : (
                        <div className="text-center text-stone-300 py-20 font-bold text-sm">
                            No messages yet.<br/>Say hi to your squad! 👋
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 bg-stone-50 border-2 border-stone-100 rounded-xl focus:border-green-400 focus:bg-white outline-none font-bold text-stone-700 placeholder-stone-400"
                    />
                    <button type="submit" className="btn btn-primary p-3 rounded-xl aspect-square flex items-center justify-center shadow-green-200">
                        ➤
                    </button>
                </form>
            </div>

            {/* Activity Log (Moved down) */}
            <div className="glass-panel p-6 animate-fade-in border-stone-100" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-lg font-black text-stone-800 mb-4 flex items-center gap-2">
                    📅 Activity Log
                </h2>
                
                {habit.completedDates && habit.completedDates.length > 0 ? (
                    <div className="relative border-l-2 border-stone-100 ml-3 space-y-6 py-2">
                        {habit.completedDates.slice().reverse().slice(0, 5).map((dateStr: string, idx: number) => {
                            const date = new Date(dateStr);
                            return (
                                <div key={idx} className="flex items-center gap-4 pl-4 relative">
                                    <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-green-400 border-4 border-white shadow-sm"></div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{date.toLocaleDateString()}</p>
                                        <p className="text-sm font-bold text-stone-700">Streak Extended! 🔥</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 text-stone-300 font-bold text-sm bg-stone-50 rounded-2xl border-2 border-stone-100 border-dashed">
                        No activity yet.
                    </div>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}
