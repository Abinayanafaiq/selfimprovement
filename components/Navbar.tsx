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
    <nav className="mb-8 p-4 flex justify-between items-center sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md">
      <Link href="/" className="text-xl font-black text-stone-800 tracking-tight hover:scale-105 transition-transform">
        Self<span className="text-green-500">Improvement</span>
      </Link>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <>
            <span className="text-sm font-bold text-stone-500 hidden md:block">
              Hi, <span className="text-stone-800">{user.username}</span>
            </span>
            <Link href="/social" className="btn bg-orange-100 text-orange-600 hover:bg-orange-200 border-none font-bold py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-xl">
              Friends
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
