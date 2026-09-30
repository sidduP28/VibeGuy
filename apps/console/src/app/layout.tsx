import './globals.css';
import { Navigation } from '@/components/Navigation';
import { headers } from 'next/headers';

export const metadata = {
  title: 'VibeGuy Console',
  description: 'Creator-to-commerce personalization studio',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const path = h.get('x-pathname') || '';
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">
          <Navigation />
          <div className="main">{children}</div>
        </div>
      </body>
    </html>
  );
}
