'use client';

import { useState, useEffect } from 'react';

const quotes = [
    "Berbohong daily habit sama dengan berbohong pada diri sendiri",
    "Disiplin adalah memilih antara apa yang kamu inginkan sekarang dan apa yang paling kamu inginkan.",
    "Jangan berhenti saat lelah. Berhentilah saat selesai.",
    "Kemenangan kecil setiap hari membangun kesuksesan besar di masa depan.",
    "Kebiasaan buruk adalah tempat tidur yang nyaman; mudah untuk masuk, sulit untuk keluar.",
    "Fokus pada kemajuan, bukan kesempurnaan.",
    "Dirimu yang satu tahun dari sekarang akan berterima kasih atas kerja kerasmu hari ini.",
    "Masa depanmu ditentukan oleh apa yang kamu lakukan hari ini, bukan besok.",
    "The only person you should try to be better than is the person you were yesterday.",
    "Disiplin adalah jembatan antara tujuan dan pencapaian.",
    "Small habits, big results.",
    "Jangan biarkan hari kemarin merusak hari ini.",
    "Waktu terbaik untuk menanam pohon adalah 20 tahun yang lalu. Waktu terbaik kedua adalah sekarang.",
    "Consistency beats intensity every time.",
    "Every action you take is a vote for the person you want to become.",
    "Hargai prosesnya, nikmati hasilnya.",
    "Your habits determine your future."
];

export default function MotivationalQuotes() {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % quotes.length);
                setFade(true);
            }, 500); // Duration of fade out
        }, 10000); // Change every 10 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 bg-indigo-50/50 border-indigo-100 relative overflow-hidden text-center min-h-[100px] flex items-center justify-center">
            <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
            
            <p className={`text-lg font-bold text-indigo-900 italic transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                "{quotes[index]}"
            </p>

            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none rotate-180">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
        </div>
    );
}
