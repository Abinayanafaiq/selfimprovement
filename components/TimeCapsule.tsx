'use client';

import { useState, useMemo } from 'react';

interface TimeCapsuleProps {
    habit: any;
    currentUser: any;
    onUpdate: () => void;
}

export default function TimeCapsule({ habit, currentUser, onUpdate }: TimeCapsuleProps) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);

    const { streak, timeCapsule } = habit;
    const unlockStreak = timeCapsule?.unlockStreak || 30;
    const isUnlocked = streak >= unlockStreak;
    const messages = timeCapsule?.messages || [];

    const myMessage = useMemo(() => {
        return messages.find((m: any) => m.userId?._id === currentUser?._id || m.userId === currentUser?._id);
    }, [messages, currentUser]);

    const partnerMessage = useMemo(() => {
        return messages.find((m: any) => m.userId?._id !== currentUser?._id && m.userId !== currentUser?._id);
    }, [messages, currentUser]);

    const depositMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/habits/${habit._id}`, {
                method: 'PUT',
                body: JSON.stringify({ action: 'capsule', text: message })
            });
            if (res.ok) {
                setMessage('');
                setShowInput(false);
                onUpdate();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-8 bg-gradient-to-br from-orange-50 to-amber-50 border-amber-200 relative overflow-hidden shadow-xl group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">📦</div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-stone-800 flex items-center gap-3">
                            Time Capsule {isUnlocked ? '🔓' : '🔒'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-12 bg-orange-200 rounded-full overflow-hidden">
                                <div className={`h-full bg-orange-500 transition-all duration-1000`} style={{ width: `${(streak / unlockStreak) * 100}%` }}></div>
                            </div>
                            <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Goal: {unlockStreak} Days</p>
                        </div>
                    </div>
                    {!isUnlocked && (
                        <div className="bg-white px-6 py-3 rounded-3xl border-2 border-orange-100 shadow-lg shadow-orange-100/50 flex flex-col items-center">
                            <span className="text-xs font-black text-stone-400 uppercase">Streak</span>
                            <span className="text-2xl font-black text-orange-500">{streak}</span>
                        </div>
                    )}
                </div>

                {!isUnlocked ? (
                    <div className="space-y-8">
                        {/* Deposit Logic */}
                        <div className="p-8 bg-white/80 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-orange-100 text-center relative hover:border-orange-200 transition-colors">
                            {myMessage ? (
                                <div className="space-y-4">
                                    <div className="text-6xl animate-float">✉️</div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-black text-stone-800">Sealed with a Promise! ✨</p>
                                        <p className="text-sm text-stone-500 font-medium max-w-xs mx-auto">Your letter is safely tucked away in the vault. You can still revise your words before the 30-day mark.</p>
                                    </div>
                                    <button 
                                        onClick={() => { setMessage(myMessage.text); setShowInput(true); }}
                                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-black uppercase tracking-widest hover:bg-stone-200 transition-colors"
                                    >
                                        ✏️ Edit Letter
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-6xl opacity-30">🖋️</div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-black text-stone-700">Write to the Future Self</p>
                                        <p className="text-xs text-stone-400 font-medium">Capture a memory, a promise, or a secret for your partner.</p>
                                    </div>
                                    {!showInput && (
                                        <button 
                                            onClick={() => setShowInput(true)}
                                            className="btn bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-200 px-8 py-4 rounded-2xl"
                                        >
                                            Write Letter
                                        </button>
                                    )}
                                </div>
                            )}

                            {showInput && (
                                <form onSubmit={depositMessage} className="mt-6 space-y-4 animate-in zoom-in duration-300">
                                    <div className="relative">
                                        <textarea 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Dear partner, when we reach 30 days..."
                                            className="w-full p-6 bg-[#fffdfa] rounded-[2rem] border-2 border-orange-100 focus:border-orange-400 outline-none text-lg font-handwriting min-h-[150px] shadow-inner"
                                        />
                                        <div className="absolute top-4 right-4 text-[10px] font-black text-orange-200 uppercase">Private Letter</div>
                                    </div>
                                    <div className="flex gap-4 justify-center">
                                        <button type="button" onClick={() => setShowInput(false)} className="px-6 py-3 text-xs font-black text-stone-400 uppercase tracking-widest">Burn it 🕯️</button>
                                        <button type="submit" disabled={loading} className="btn bg-stone-900 text-white hover:bg-black px-10 py-3 rounded-xl shadow-lg shadow-black/10">
                                            {loading ? 'Sealing...' : 'Seal & Lock 🔒'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Partner Status */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white/40 rounded-[2rem] border border-orange-100/50">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all duration-500 ${partnerMessage ? 'bg-emerald-500 text-white rotate-6' : 'bg-stone-200 text-stone-400'}`}>
                                    {partnerMessage 
                                        ? (habit.sharedWith?.find((u: any) => u._id !== currentUser?._id)?.avatarEmoji || habit.userId?.avatarEmoji || '✉️') 
                                        : '?'}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-stone-800 uppercase tracking-wide">Partner's Progress</p>
                                    <p className="text-[10px] font-bold text-stone-500 italic">
                                        {partnerMessage ? "Letter received! Waiting for unlock..." : "Still thinking about what to write..."}
                                    </p>
                                </div>
                            </div>
                            {partnerMessage && <div className="text-emerald-500 font-black text-xs animate-pulse">LOCKED ✓</div>}
                        </div>
                    </div>
                ) : (
                    <div className="animate-confetti space-y-8">
                        <div className="p-10 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 rounded-[3rem] text-center text-white shadow-2xl shadow-orange-200 relative overflow-hidden group/open">
                            <div className="absolute inset-0 bg-white/10 mix-blend-overlay animate-pulse"></div>
                            <div className="text-7xl mb-4 relative z-10 animate-bounce">🎊</div>
                            <h3 className="text-4xl font-black mb-3 relative z-10 drop-shadow-md">THE VAULT IS OPEN!</h3>
                            <p className="text-sm font-bold opacity-90 relative z-10 max-w-xs mx-auto">Consistency pays off. Read your 30-day promises below.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            {messages.map((m: any, idx: number) => (
                                <div key={idx} className="p-8 bg-white rounded-[2.5rem] border-2 border-orange-100 shadow-xl relative overflow-hidden hover:scale-[1.02] transition-transform">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl rotate-12">💌</div>
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                        {m.userId?._id === currentUser?._id || m.userId === currentUser?._id ? 'Your Secret Promise' : 'Partner\'s Heartfelt Note'}
                                    </p>
                                    <p className="text-xl font-handwriting text-stone-700 leading-relaxed italic border-l-4 border-orange-50/50 pl-4">
                                        "{m.text}"
                                    </p>
                                    <div className="mt-6 pt-4 border-t border-stone-50 text-[9px] font-bold text-stone-300 uppercase">
                                        Written on {new Date(m.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
