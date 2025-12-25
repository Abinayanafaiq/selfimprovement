'use client';
import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [habits, setHabits] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use() or just await in useEffect if it was async component, but this is client component.
  // Next.js 15 requires params to be Promise.
  // Safe way for client component in Next 15: use(params)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

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
        }
    }).finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="min-h-screen p-8 text-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen p-8 text-center">User not found</div>;

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      <Navbar user={currentUser} />
      
      <div className="animate-fade-in">
        <Link href="/social" className="text-sm text-muted mb-4 inline-block hover:text-white">&larr; Back to Community</Link>
        
        <div className="glass-panel p-8 mb-8 flex items-center gap-6 border-indigo-500/20 bg-indigo-500/5">
            <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/30">
                {profile.username[0].toUpperCase()}
            </div>
            <div>
                <h1 className="text-3xl font-bold mb-1">{profile.username}</h1>
                <p className="text-muted text-sm">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="ml-auto text-center">
                <p className="text-sm text-muted uppercase tracking-wider">Total Wins</p>
                <p className="text-4xl font-bold text-emerald-400 drop-shadow-sm">{profile.wins}</p>
            </div>
        </div>

        <h2 className="text-xl font-bold mb-4 px-2">Their Habits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit: any) => (
                <div key={habit._id} className="glass-panel p-6 opacity-80 hover:opacity-100 transition-opacity">
                    <h3 className="font-bold text-lg mb-2">{habit.title}</h3>
                    <p className="text-sm text-muted mb-4">{habit.description}</p>
                    <div className="flex justify-between items-center text-xs font-mono">
                         <span>Streak: <span className="text-orange-400">{habit.streak}</span></span>
                    </div>
                </div>
            ))}
            {habits.length === 0 && <p className="text-muted p-4">This user hasn't shared any habits publicly yet.</p>}
        </div>
      </div>
    </main>
  );
}
