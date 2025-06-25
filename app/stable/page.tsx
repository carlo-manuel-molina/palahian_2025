"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STABLE_TABS = [
  { key: 'fighters', label: 'Fighters', href: '/stable/fighters' },
  { key: 'sale', label: 'Available for Sale', href: '/stable/sale' },
  { key: 'analytics', label: 'Fight Record & Analytics', href: '/stable/analytics' },
  { key: 'search', label: 'Search', href: '/search' },
];

function StableNavbar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  return (
    <nav className="w-full bg-green-50/80 backdrop-blur-md border-b border-green-200 px-2 sm:px-6 py-1 sm:py-2 flex items-center justify-between relative z-50">
      <div className="flex-1 text-left"></div>
      <div className="relative mr-2">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => setOpen((v) => !v)}
          aria-label="Stable menu"
        >
          <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-green-200 rounded-lg shadow-lg focus:outline-none z-50">
            <div className="py-1">
              {STABLE_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`block w-full text-left px-4 py-2 text-sm ${selected === tab.key ? 'bg-green-100 text-green-900' : 'text-green-900'} ${tab.key !== 'fighters' ? 'border-t border-green-100' : ''}`}
                  onClick={() => { setOpen(false); onSelect(tab.key); }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* User icon and dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => setOpen((v) => !v)}
          aria-label="User menu"
        >
          <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-green-200 rounded-lg shadow-lg z-50">
            <button
              className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100"
              onClick={() => { setOpen(false); router.push('/stable/edit'); }}
            >
              Edit Stable Details
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100 border-t border-green-100"
              onClick={() => { setOpen(false); router.push('/login?logout=true'); }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function StableBanner({ userName, stableName, bannerUrl, onBannerChange }: { userName: string; stableName: string; bannerUrl?: string; onBannerChange?: (url: string) => void }) {
  return (
    <div className="relative w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-lg mb-6">
      <img
        src={bannerUrl || '/gamefowl-farm.jpg'}
        alt="Stable Banner"
        className="w-full h-40 sm:h-56 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
        <div className="text-white text-xl sm:text-2xl font-bold drop-shadow mb-1">{stableName}</div>
        <div className="text-white text-base sm:text-lg drop-shadow mb-2">Welcome, {userName}!</div>
      </div>
    </div>
  );
}

function StableCreateForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    street: '',
    mapPin: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create stable');
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-green-50/90 border border-green-200 rounded-xl shadow-lg p-6 sm:p-8 mb-6 backdrop-blur-md mt-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-green-900 mb-2">Create Your Stable</h2>
      <p className="text-green-800 mb-6 text-base sm:text-lg">Enter your stable details to get started. You can edit these later.</p>
      {error && <div className="mb-4 text-red-900 bg-red-200 rounded p-2 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-green-900 mb-1">Stable Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">Region</label>
            <input name="region" value={form.region} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">Province</label>
            <input name="province" value={form.province} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">Barangay</label>
            <input name="barangay" value={form.barangay} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">Street</label>
            <input name="street" value={form.street} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
          </div>
        </div>
        <div>
          <label className="block font-medium text-green-900 mb-1">Map Pin <span className="text-green-700 text-xs">(lat,lon or Google Maps link)</span></label>
          <input name="mapPin" value={form.mapPin} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
        </div>
        <div>
          <label className="block font-medium text-green-900 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" />
        </div>
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition text-lg" disabled={loading}>
          {loading ? 'Creating...' : 'Create Stable'}
        </button>
      </form>
    </div>
  );
}

export default function StableDashboard() {
  const [stable, setStable] = useState<any>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('sale'); // Default to Available for Sale

  useEffect(() => {
    fetchStable();
  }, []);

  const fetchStable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stable');
      if (!res.ok) throw new Error('Failed to fetch stable');
      const data = await res.json();
      if (data.needsSetup) {
        setNeedsSetup(true);
        setStable(null);
        setLoading(false);
        return;
      }
      setNeedsSetup(false);
      setStable(data.stable);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchStable} className="px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return <StableCreateForm onCreated={fetchStable} />;
  }

  if (!stable) return null;

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header (reuse dashboard header) */}
      <header className="w-full bg-green-100/80 backdrop-blur-md border-b border-green-200 shadow-sm py-2 px-3 sm:py-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/gamefowl-farm.jpg" alt="Palahian Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow mr-2 sm:mr-3 border-2 border-green-300" />
          <span
            className="text-2xl sm:text-3xl font-bold text-green-900 drop-shadow"
            style={{ fontFamily: 'Dancing Script, cursive', letterSpacing: '1px', textShadow: '1px 1px 4px #222' }}
          >
            palahian.com
          </span>
        </div>
      </header>
      <StableNavbar selected={tab} onSelect={setTab} />
      <StableBanner userName={stable.owner} stableName={stable.name} bannerUrl={stable.bannerUrl} />
      <main className="flex flex-col items-center flex-1 w-full px-2 sm:px-4 py-4 sm:py-8">
        <div className="w-full mt-0 mb-6">
          {tab === 'fighters' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Fighters</h2>
              <div className="text-green-800">(List of fighter roosters owned by you will appear here.)</div>
            </div>
          )}
          {tab === 'sale' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Available for Sale</h2>
              <div className="text-green-800">(List of your chickens for sale will appear here.)</div>
            </div>
          )}
          {tab === 'analytics' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Fight Record & Analytics</h2>
              <div className="text-green-800">(Fight stats and analytics will appear here.)</div>
            </div>
          )}
          {tab === 'search' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Search</h2>
              <div className="text-green-800">(Search functionality will appear here.)</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 