'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="glass-panel mb-8 p-4 flex justify-between items-center sticky top-4 z-50">
      <Link href="/" className="text-xl font-bold title-gradient">
        SelfImprovement
      </Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm font-medium hidden sm:block">
              Welcome, <span className="text-primary">{user.username}</span>
            </span>
            <Link href="/social" className="btn btn-secondary py-2 px-4 text-sm">
              Community
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary py-2 px-4 text-sm hover:!bg-red-500/10 hover:!text-red-400 hover:!border-red-500/30">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary py-2 px-4 text-sm">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
