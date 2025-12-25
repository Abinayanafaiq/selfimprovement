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
      
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 title-gradient text-center">Community</h1>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
            <input 
                placeholder="Search users..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
            />
            <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="grid gap-4">
            {users.map((user: any) => (
                <Link href={`/social/${user._id}`} key={user._id}>
                    <div className="glass-panel p-4 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                {user.username[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-lg">{user.username}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted uppercase">Total Wins</p>
                            <p className="font-mono text-emerald-400">{user.wins}</p>
                        </div>
                    </div>
                </Link>
            ))}
            {users.length === 0 && <p className="text-center text-muted">No users found.</p>}
        </div>
      </div>
    </main>
  );
}
