import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Realty Analytics',
  description: 'SaaS analytics for real estate websites'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-auto">{children}</div>
      </body>
    </html>
  );
}


