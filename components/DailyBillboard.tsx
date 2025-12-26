'use client';

import { useState } from 'react';

interface DailyBillboardProps {
    habit: any;
    currentUser: any;
    onUpdate: () => void;
}

const COLORS = [
    { id: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-800' },
    { id: 'pink', bg: 'bg-pink-200', border: 'border-pink-300', text: 'text-pink-800' },
    { id: 'blue', bg: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-800' },
    { id: 'green', bg: 'bg-emerald-200', border: 'border-emerald-300', text: 'text-emerald-800' },
];

export default function DailyBillboard({ habit, currentUser, onUpdate }: DailyBillboardProps) {
    const [note, setNote] = useState('');
    const [selectedColor, setSelectedColor] = useState('yellow');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const notes = habit?.billboard || [];

    const postNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || loading) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/habits/${habit._id}`, {
                method: 'PUT',
                body: JSON.stringify({ action: 'billboard', text: note, color: selectedColor })
            });

            if (res.ok) {
                setNote('');
                setShowForm(false);
                onUpdate();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-8 bg-wood border-stone-400 relative overflow-hidden shadow-2xl">
            {/* Board Background Texture Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(rgba(0,0,0,0) 0, rgba(0,0,0,.1) 1px, transparent 1px, transparent 20px)' }}></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2 drop-shadow-sm">
                             Daily Billboard 📝
                        </h2>
                        <p className="text-xs text-stone-700 font-bold uppercase tracking-widest bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full inline-block">Shared Energy Board</p>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="btn bg-stone-900 text-white hover:bg-black shadow-lg shadow-black/20 text-xs py-2 px-6"
                    >
                        {showForm ? 'Cancel' : 'Pin Note +'}
                    </button>
                </div>

                {showForm && (
                    <div className="animate-in slide-in-from-top duration-300 mb-8 p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl relative z-20">
                        <form onSubmit={postNote} className="space-y-4">
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value.slice(0, 100))}
                                placeholder="Write something motivational..."
                                className="w-full p-4 rounded-2xl border-2 border-stone-100 focus:border-stone-400 outline-none text-sm font-medium min-h-[80px]"
                            />
                            
                            <div className="flex justify-between items-center">
                                <div className="flex gap-3">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setSelectedColor(c.id)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${c.bg} ${selectedColor === c.id ? 'ring-2 ring-stone-800 border-white' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-stone-400 uppercase">{note.length}/100</span>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !note.trim()} 
                                className="w-full btn btn-primary bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200 py-3 rounded-2xl"
                            >
                                {loading ? 'Posting...' : 'Pin to Board 📌'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Corkboard Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-4">
                    {notes.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
                            <div className="text-5xl opacity-30 mb-4">📌</div>
                            <p className="text-stone-800 font-bold italic drop-shadow-sm">No notes yet. Start the conversation!</p>
                        </div>
                    ) : (
                        [...notes].reverse().map((n: any, idx: number) => {
                            const config = COLORS.find(c => c.id === n.color) || COLORS[0];
                            // More varied organic rotation
                            const rotationValues = ['-3deg', '2deg', '-1deg', '3deg', '-2deg'];
                            const rotation = rotationValues[idx % rotationValues.length];
                            
                            const sender = n.userId;
                            const isMe = sender._id === currentUser?._id || sender === currentUser?._id;
                            
                            return (
                                <div 
                                    key={idx}
                                    className={`${config.bg} sticky-cut sticky-shadow w-full aspect-square p-5 transition-all hover:scale-110 hover:-translate-y-2 relative group cursor-default`}
                                    style={{ transform: `rotate(${rotation})` }}
                                >
                                    {/* Pin Visual */}
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 z-20 group-hover:scale-125 transition-transform">
                                        <div className="w-full h-full bg-red-600 rounded-full shadow-inner border-t border-red-400"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full"></div>
                                    </div>
                                    
                                    <div className="h-full flex flex-col justify-between">
                                        <p className={`text-lg font-handwriting leading-tight ${config.text} break-words line-clamp-4 drop-shadow-sm`}>
                                            {n.text}
                                        </p>
                                        <div className="flex justify-between items-end mt-2 opacity-60">
                                            <p className={`text-[9px] font-black uppercase ${config.text}`}>
                                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs" title={sender.username}>
                                                    {sender.avatarEmoji || (isMe ? '👤' : '👥')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Author Badge */}
                                    <div className={`absolute -bottom-2 -right-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-stone-900 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all z-20 shadow-md`}>
                                        {isMe ? 'YOU' : sender.username?.toUpperCase() || 'PARTNER'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
