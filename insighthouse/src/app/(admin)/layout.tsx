import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-white p-4 space-y-3">
        <div className="font-semibold">Admin</div>
        <nav className="space-y-2 text-sm">
          <Link className="block hover:underline" href="/admin">Dashboard</Link>
          <Link className="block hover:underline" href="/admin/sites">Sites</Link>
          <Link className="block hover:underline" href="/admin/install">Installation</Link>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}


