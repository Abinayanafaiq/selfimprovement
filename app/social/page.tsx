'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function SocialPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me').then(res => res.json()).then(data => {
        if (data.user) setCurrentUser(data.user);
        else window.location.href = '/login';
    });
    
    // Initial load
    searchUsers('');
  }, []);

  const searchUsers = async (q: string) => {
    const res = await fetch(`/api/users?q=${q}`);
    const data = await res.json();
    setUsers(data.users || []);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(query);
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      <Navbar user={currentUser} />
      
      <div className="max-w-3xl mx-auto animate-fade-in relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 text-9xl opacity-10 pointer-events-none">🌍</div>
             <h1 className="text-4xl font-black text-stone-800 mb-2 relative z-10">Community Garden</h1>
             <p className="text-stone-500 font-bold">Find friends to grow with! 🌱</p>
        </div>

        <form onSubmit={handleSearch} className="mb-10 relative group">
            <div className="absolute inset-0 bg-green-200 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative flex gap-3 p-2 bg-white rounded-2xl border-4 border-green-100 shadow-sm focus-within:border-green-300 transition-colors">
                <span className="flex items-center pl-3 text-2xl">🔍</span>
                <input 
                    placeholder="Search for username..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-lg font-bold text-stone-700 placeholder-stone-300"
                />
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-black px-6 py-2 rounded-xl transition-transform active:scale-95 shadow-md shadow-green-200">
                    FIND
                </button>
            </div>
        </form>

        <div className="grid gap-4">
            {users.map((user: any) => (
                <Link href={`/social/${user._id}`} key={user._id}>
                    <div className="glass-panel p-4 flex justify-between items-center hover:scale-[1.02] transition-transform cursor-pointer group border-stone-100 bg-white/60">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl font-black group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-inner">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div>
                                <span className="font-black text-lg text-stone-800 block">{user.username}</span>
                                <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Explorer</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Total Wins</p>
                            <div className="font-black text-xl text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block">
                                {user.wins} 🏆
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            {users.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4 grayscale opacity-50">🦕</div>
                    <p className="text-stone-400 font-bold">No explorers found. Try another name!</p>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
