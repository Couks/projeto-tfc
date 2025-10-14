'use client';
import { useState } from 'react';

export default function NewSitePage() {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [loaderUrl, setLoaderUrl] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoaderUrl(null);
    setSiteKey(null);
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, domain })
    });
    if (!res.ok) {
      const j = await res.json().catch(()=>({ error: 'Request failed' }));
      setError(j.error || 'Request failed');
      return;
    }
    const data = await res.json();
    setLoaderUrl(data.loaderUrl);
    setSiteKey(data.siteKey);
  };

  const htmlSnippet = loaderUrl ? `<script async src="${loaderUrl}"></script>` : '';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Novo Site</h1>
      <form onSubmit={onSubmit} className="space-y-3 max-w-lg">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Minha Imobiliária"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Domínio principal (FQDN)
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="www.exemplo.com"
          />
        </div>
        <button className="bg-black text-white rounded px-4 py-2">Criar</button>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </form>

      {loaderUrl && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Use este snippet HTML:</div>
          <pre className="p-3 bg-gray-50 border rounded text-sm overflow-auto">
            {htmlSnippet}
          </pre>
          <div className="text-sm text-gray-600">
            Ou adicione via GTM (Custom HTML tag): o mesmo snippet acima.
          </div>
          <div className="text-xs text-gray-500">SITE_KEY: {siteKey}</div>
        </div>
      )}
    </div>
  );
}


