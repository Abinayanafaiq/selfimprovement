'use client';
import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GardenPlot from '@/components/GardenPlot';

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [habits, setHabits] = useState<any>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editEmoji, setEditEmoji] = useState('🍃');
  const [editColor, setEditColor] = useState('#4ADE80');

  // Unwrap params using React.use() or just await in useEffect if it was async component, but this is client component.
  // Next.js 15 requires params to be Promise.
  // Safe way for client component in Next 15: use(params)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    Promise.all([
        fetch('/api/auth/me').then(r => r.json()),
        fetch(`/api/users/${id}`).then(r => r.json())
    ]).then(([authData, userData]) => {
        if (!authData.user) {
            router.push('/login');
            return;
        }
        setCurrentUser(authData.user);
        
        if (userData.user) {
            setProfile(userData.user);
            setHabits(userData.habits || []);
            setEditEmoji(userData.user.avatarEmoji || '🍃');
            setEditColor(userData.user.avatarColor || '#4ADE80');
        }
    }).finally(() => setLoading(false));
  }, [id, router]);

  const updateProfile = async () => {
      try {
          const res = await fetch('/api/users/profile', {
              method: 'PATCH',
              body: JSON.stringify({ avatarEmoji: editEmoji, avatarColor: editColor })
          });
          if (res.ok) {
              setProfile({ ...profile, avatarEmoji: editEmoji, avatarColor: editColor });
              setShowEdit(false);
          }
      } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen p-8 text-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen p-8 text-center">User not found</div>;

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      <Navbar user={currentUser} />
      
      <div className="mb-6 animate-fade-in flex justify-between items-center">
        <Link href="/social" className="group inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-100 rounded-2xl text-stone-500 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md active:scale-95">
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Community
        </Link>
        {isOwnProfile && (
            <button 
                onClick={() => setShowEdit(true)}
                className="btn bg-stone-900 text-white text-xs py-2 px-6 shadow-xl shadow-stone-200"
            >
                Customize Spirit ✨
            </button>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-300">
              <div className="glass-panel p-8 max-w-sm w-full bg-white relative overflow-hidden">
                  <h3 className="text-xl font-black text-stone-800 mb-6">Customize Your Spirit</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Avatar Emoji</label>
                          <div className="grid grid-cols-5 gap-2">
                              {['🍃', '🔥', '💧', '⚡', '🌙', '🦁', '🦉', '🦊', '🐲', '🦄'].map(e => (
                                  <button 
                                    key={e}
                                    onClick={() => setEditEmoji(e)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${editEmoji === e ? 'bg-stone-900 text-white scale-110' : 'bg-stone-50 hover:bg-stone-100'}`}
                                  >
                                      {e}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Spirit Color</label>
                          <div className="flex gap-3">
                              {['#4ADE80', '#6366f1', '#f43f5e', '#fbbf24', '#a855f7'].map(c => (
                                  <button 
                                    key={c}
                                    onClick={() => setEditColor(c)}
                                    className={`w-8 h-8 rounded-full border-4 transition-all ${editColor === c ? 'border-stone-900 scale-125' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                  />
                              ))}
                          </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button onClick={() => setShowEdit(false)} className="flex-1 text-xs font-bold text-stone-400 uppercase">Cancel</button>
                          <button onClick={updateProfile} className="flex-1 btn bg-stone-900 text-white py-3 rounded-2xl shadow-lg">Save Identity</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
        
        <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row items-center gap-6 border-indigo-500/20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 blur-[100px] opacity-20" style={{ backgroundColor: profile.avatarColor || '#6366f1' }}></div>
            
            <div className="flex items-center gap-6 w-full md:w-auto z-10">
                <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl transition-transform hover:rotate-12 cursor-default" style={{ backgroundColor: profile.avatarColor || '#6366f1' }}>
                    {profile.avatarEmoji || profile.username[0].toUpperCase()}
                </div>
                <div>
                    <h1 className="text-4xl font-black mb-1 text-stone-800 tracking-tight">{profile.username}</h1>
                    <div className="flex gap-2 items-center">
                        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Level {Math.floor(profile.wins / 10) + 1} Spirit</p>
                        {profile.wins >= 50 && (
                            <span className="px-2 py-0.5 bg-amber-400 text-white text-[8px] font-black rounded-full shadow-lg shadow-amber-200">GRANDMASTER</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Public Garden Visual */}
            <div className="flex-1 flex justify-center md:justify-end gap-3 px-4 py-2 bg-stone-100/30 rounded-3xl garden-grid flex-wrap min-h-[100px] border border-stone-100">
                {habits.length > 0 ? (
                    habits.slice(0, 8).map((habit: any) => (
                        <GardenPlot key={habit._id} habit={habit} />
                    ))
                ) : (
                    <p className="text-stone-300 text-xs font-bold uppercase tracking-widest self-center">No Garden Yet</p>
                )}
            </div>

            <div className="text-center md:ml-6">
                <p className="text-sm text-muted uppercase tracking-wider">Total Wins</p>
                <p className="text-4xl font-bold text-emerald-400 drop-shadow-sm">{profile.wins}</p>
            </div>
        </div>


        {/* Mastery Roadmap (Skill Tree) */}
        <div className="glass-panel p-10 mb-8 border-stone-100 bg-white/50 relative overflow-hidden">
             <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tighter">Growth Roadmap 🗺️</h2>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Consistency creates paths to greatness</p>
                </div>
                <div className="px-4 py-2 bg-stone-100 rounded-2xl text-xs font-black text-stone-500">
                    {habits.length} NODES DISCOVERED
                </div>
            </div>

            <div className="relative min-h-[400px] flex items-center justify-center py-12">
                {/* SVG Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.2))' }}>
                    {habits.length > 1 && habits.map((_: any, i: number) => {
                        if (i === 0) return null;
                        // Simple zig-zag connection logic
                        const total = habits.length;
                        const x1 = ( (i-1) / (total-1) ) * 80 + 10;
                        const y1 = (i-1) % 2 === 0 ? 30 : 70;
                        const x2 = ( i / (total-1) ) * 80 + 10;
                        const y2 = i % 2 === 0 ? 30 : 70;
                        
                        return (
                            <line 
                                key={i} 
                                x1={`${x1}%`} y1={`${y1}%`} 
                                x2={`${x2}%`} y2={`${y2}%`} 
                                stroke="#E2E8F0" 
                                strokeWidth="4" 
                                strokeDasharray="10,10"
                                className="animate-pulse"
                            />
                        );
                    })}
                </svg>

                {/* Nodes (Habits) */}
                <div className="relative w-full h-full flex justify-between items-center px-[10%] min-h-[300px] z-10">
                    {habits.length === 0 ? (
                        <div className="text-center w-full opacity-30 italic font-bold text-stone-400">Roadmap is empty... 💤</div>
                    ) : (
                        habits.map((h: any, i: number) => {
                            const isHighStreak = h.streak >= 7;
                            const yOffset = i % 2 === 0 ? '-translate-y-24' : 'translate-y-24';
                            
                            return (
                                <div 
                                    key={h._id} 
                                    className={`relative flex flex-col items-center group transition-all duration-500 hover:scale-125 ${yOffset}`}
                                >
                                    {/* The Node */}
                                    <div 
                                        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl border-4 transition-all duration-700
                                            ${isHighStreak ? 'border-emerald-400 bg-emerald-50 scale-110 rotate-12 glow-team' : 'border-stone-200 bg-white'}
                                        `}
                                    >
                                        {h.streak >= 30 ? '👑' : h.streak >= 7 ? '🌳' : '🌱'}
                                    </div>

                                    {/* Floating Stats */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap z-50">
                                        {h.streak} DAY STREAK
                                    </div>

                                    {/* Label */}
                                    <div className="mt-4 text-center">
                                        <p className="text-sm font-black text-stone-800 tracking-tighter truncate max-w-[100px]">{h.title}</p>
                                        <div className="flex justify-center gap-0.5 mt-1">
                                            {[...Array(Math.min(5, Math.floor(h.streak / 7)))].map((_, star) => (
                                                <span key={star} className="text-[10px]">⭐</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Legend */}
            <div className="mt-12 flex justify-center gap-8 border-t border-stone-100 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md bg-stone-200"></div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Seed Stage</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md bg-emerald-400 shadow-lg shadow-emerald-200"></div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Growth Path (7+ Days)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md bg-amber-400 shadow-xl shadow-amber-200"></div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mastery (30+ Days)</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Daily Plan Column */}
            <div className="glass-panel p-6 border-stone-100 bg-stone-50/50 md:col-span-1">
                <h2 className="text-lg font-black text-stone-800 mb-4">📝 Daily Plan</h2>
                <div className="space-y-3">
                    {profile.dailyPlan && profile.dailyPlan.length > 0 ? (
                        profile.dailyPlan.map((task: any) => (
                            <div key={task._id} className="flex items-center gap-3 opacity-90">
                                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-stone-300'}`}>
                                    {task.completed && <span className="text-white text-[8px]">✓</span>}
                                </div>
                                <span className={`font-bold text-sm ${task.completed ? 'text-stone-300 line-through' : 'text-stone-600'}`}>
                                    {task.text}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-stone-400 text-sm italic">Sleeping... 💤</p>
                    )}
                </div>
            </div>

            {/* Habits Grid */}
            <div className="md:col-span-2">
                 <h2 className="text-xl font-bold mb-4 px-2">Their Habits</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {habits.map((habit: any) => (
                        <div key={habit._id} className="glass-panel p-6 opacity-80 hover:opacity-100 transition-opacity">
                            <h3 className="font-bold text-lg mb-2 text-stone-800">{habit.title}</h3>
                            <p className="text-sm text-stone-500 mb-4 line-clamp-2">{habit.description || 'No description'}</p>
                            <div className="flex justify-between items-center text-xs font-bold font-mono">
                                <span>Streak: <span className="text-orange-500">{habit.streak} 🔥</span></span>
                            </div>
                        </div>
                    ))}
                    {habits.length === 0 && <p className="text-stone-400 p-4">No public habits.</p>}
                </div>
            </div>
        </div>
    </main>
  );
}
