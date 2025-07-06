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
    regionCode: '',
    province: '',
    provinceCode: '',
    city: '',
    cityCode: '',
    barangay: '',
    barangayCode: '',
    street: '',
    mapPin: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Address data states
  const [regions, setRegions] = useState<Array<{ code: string; name: string; regionName: string }>>([]);
  const [provinces, setProvinces] = useState<Array<{ code: string; name: string; regionCode: string; regionName: string }>>([]);
  const [cities, setCities] = useState<Array<{ code: string; name: string; provinceCode: string; provinceName: string; regionCode: string; regionName: string }>>([]);
  const [barangays, setBarangays] = useState<Array<{ code: string; name: string; cityCode: string; cityName: string; provinceCode: string; provinceName: string; regionCode: string; regionName: string }>>([]);
  
  // Loading states for dropdowns
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Load regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoadingRegions(true);
      const response = await fetch('/api/addresses/regions');
      if (!response.ok) throw new Error('Failed to fetch regions');
      const data = await response.json();
      setRegions(data.regions || []);
    } catch (err) {
      setError('Failed to load regions');
      console.error('Error fetching regions:', err);
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchProvinces = async (regionCode: string) => {
    try {
      setLoadingProvinces(true);
      const response = await fetch(`/api/addresses/provinces?regionCode=${regionCode}`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      setProvinces(data.provinces || []);
    } catch (err) {
      setError('Failed to load provinces');
      console.error('Error fetching provinces:', err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    try {
      setLoadingCities(true);
      console.log('Frontend: Fetching cities for province:', provinceCode);
      const response = await fetch(`/api/addresses/cities?provinceCode=${provinceCode}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      console.log('Frontend: Cities API response:', data);
      setCities(data.cities || []);
    } catch (err) {
      setError('Failed to load cities');
      console.error('Frontend: Error fetching cities:', err);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchBarangays = async (cityCode: string) => {
    try {
      setLoadingBarangays(true);
      const response = await fetch(`/api/addresses/barangays?cityCode=${cityCode}`);
      if (!response.ok) throw new Error('Failed to fetch barangays');
      const data = await response.json();
      setBarangays(data.barangays || []);
    } catch (err) {
      setError('Failed to load barangays');
      console.error('Error fetching barangays:', err);
    } finally {
      setLoadingBarangays(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    
    // Handle cascading dropdowns
    if (name === 'regionCode') {
      const selectedRegion = regions.find(r => r.code === value);
      setForm(f => ({ 
        ...f, 
        regionCode: value,
        region: selectedRegion?.name || '',
        provinceCode: '',
        province: '',
        cityCode: '',
        city: '',
        barangayCode: '',
        barangay: ''
      }));
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      if (value) fetchProvinces(value);
    }
    
    if (name === 'provinceCode') {
      const selectedProvince = provinces.find(p => p.code === value);
      setForm(f => ({ 
        ...f, 
        provinceCode: value,
        province: selectedProvince?.name || '',
        cityCode: '',
        city: '',
        barangayCode: '',
        barangay: ''
      }));
      setCities([]);
      setBarangays([]);
      if (value) fetchCities(value);
    }
    
    if (name === 'cityCode') {
      const selectedCity = cities.find(c => c.code === value);
      setForm(f => ({ 
        ...f, 
        cityCode: value,
        city: selectedCity?.name || '',
        barangayCode: '',
        barangay: ''
      }));
      setBarangays([]);
      if (value) fetchBarangays(value);
    }
    
    if (name === 'barangayCode') {
      const selectedBarangay = barangays.find(b => b.code === value);
      setForm(f => ({ 
        ...f, 
        barangayCode: value,
        barangay: selectedBarangay?.name || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Prepare the data for submission (keep both codes and names for compatibility)
      const submitData = {
        name: form.name,
        region: form.region,
        regionCode: form.regionCode,
        province: form.province,
        provinceCode: form.provinceCode,
        city: form.city,
        cityCode: form.cityCode,
        barangay: form.barangay,
        barangayCode: form.barangayCode,
        street: form.street,
        mapPin: form.mapPin,
        description: form.description,
      };
      
      const res = await fetch('/api/stable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
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
            <select 
              name="regionCode" 
              value={form.regionCode} 
              onChange={handleChange} 
              required 
              disabled={loadingRegions}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900"
            >
              <option value="">{loadingRegions ? 'Loading regions...' : 'Select Region'}</option>
              {regions.map(region => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">Province</label>
            <select 
              name="provinceCode" 
              value={form.provinceCode} 
              onChange={handleChange} 
              required 
              disabled={!form.regionCode || loadingProvinces}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900"
            >
              <option value="">
                {!form.regionCode ? 'Select Region first' : 
                 loadingProvinces ? 'Loading provinces...' : 'Select Province'}
              </option>
              {provinces.map(province => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">City/Municipality</label>
            <select 
              name="cityCode" 
              value={form.cityCode} 
              onChange={handleChange} 
              required 
              disabled={!form.provinceCode || loadingCities}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900"
            >
              <option value="">
                {!form.provinceCode ? 'Select Province first' : 
                 loadingCities ? 'Loading cities...' : 'Select City/Municipality'}
              </option>
              {cities.map(city => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">Barangay</label>
            <select 
              name="barangayCode" 
              value={form.barangayCode} 
              onChange={handleChange} 
              required 
              disabled={!form.cityCode || loadingBarangays}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900"
            >
              <option value="">
                {!form.cityCode ? 'Select City first' : 
                 loadingBarangays ? 'Loading barangays...' : 'Select Barangay'}
              </option>
              {barangays.map(barangay => (
                <option key={barangay.code} value={barangay.code}>
                  {barangay.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-green-900 mb-1">Street Address</label>
            <input name="street" value={form.street} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 text-green-900" placeholder="Street, Building, House No." />
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