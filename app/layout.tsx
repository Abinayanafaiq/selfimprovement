import './globals.css';
import type { Metadata } from 'next';
import { Nunito, Indie_Flower } from 'next/font/google';

const nunito = Nunito({ subsets: ['latin'] });
const indieFlower = Indie_Flower({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-handwriting',
});

export const metadata: Metadata = {
  title: "SelfImprovement",
  description: "Track habits and grow with friends.",
  manifest: '/manifest.json', // Next.js auto-generates this from manifest.ts
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  themeColor: '#FDFBF7',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SelfImprovement',
  },
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
      <body className={`${nunito.className} ${indieFlower.variable} text-stone-800 antialiased bg-[#FDFBF7]`}>
        <div className="animated-bg"></div>
        {children}
      </body>
    </html>
  );
}
