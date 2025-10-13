import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2">Top Cities</div>
          <Link className="text-sm underline" href="/admin/dashboard">Open details</Link>
        </div>
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2">Installation</div>
          <Link className="text-sm underline" href="/admin/install">View snippet</Link>
        </div>
      </div>
    </div>
  );
}


