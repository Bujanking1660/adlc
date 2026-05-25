import type { Metadata } from 'next';
import './globals.css';export const metadata: Metadata = {
  title: 'Pluto Engine - AI Development Life Cycle Planner',
  description: 'Rencanakan arsitektur aplikasi Anda secara instan menggunakan multi-agent AI sekuensial. Cepat, efisien, hemat token, dan siap disalin ke AI code generator!',
  keywords: ['ADLC Planner', 'AI Development Planner', 'System Analyst AI', 'Supabase schema creator', 'Lovable planner', 'Bolt planner', 'Antigravity helper', 'Pluto Engine'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#060911] text-slate-100 selection:bg-blue-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
