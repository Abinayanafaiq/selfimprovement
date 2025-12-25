import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SelfImprovement',
  description: 'Track your habits and compete with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    background: '#FDFBF7', // Warm Cream
                    primary: '#4ADE80', // Playful Green
                    secondary: '#FEF08A', // Soft Yellow
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className={`${nunito.className} text-stone-800 antialiased bg-[#FDFBF7]`}>
        <div className="animated-bg"></div>
        {children}
      </body>
    </html>
  );
}
