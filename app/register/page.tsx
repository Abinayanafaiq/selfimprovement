'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/');
      router.refresh(); // Refresh to update auth state
    } else {
      setError(data.message || 'Something went wrong');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-center title-gradient">Join the Journey</h1>
        
        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full mt-4">
            Start Improvement
          </button>
        </form>

        <p className="mt-6 text-center text-muted text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
