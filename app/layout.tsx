import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
                    background: '#F2F2F7', // iOS System Background
                    primary: '#007AFF', // iOS Blue
                    secondary: '#34C759', // iOS Green
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className={`${inter.className} text-slate-900 antialiased`}>
        <div className="animated-bg"></div>
        {children}
      </body>
    </html>
  );
}
