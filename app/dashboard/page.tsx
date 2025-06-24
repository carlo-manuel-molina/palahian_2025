"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import FarmDetailsCard from './BreederDetailsCard';
import BloodlinesSection from './BloodlinesSection';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import FarmBanner from './FarmBanner';
// import { FaBars } from 'react-icons/fa'; // Uncomment if react-icons is installed

type FarmFormData = {
  name: string;
  owner: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  mapPin?: string;
  email: string;
  description?: string;
  bannerUrl?: string;
  avatarUrl?: string;
};

type PSGCItem = { code: string; name: string };

function FarmDetailsForm({ onSave, userEmail }: { onSave: (farm: FarmFormData) => void, userEmail: string }) {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [region, setRegion] = useState<{ value: string; label: string } | null>(null);
  const [province, setProvince] = useState<{ value: string; label: string } | null>(null);
  const [city, setCity] = useState<{ value: string; label: string } | null>(null);
  const [barangay, setBarangay] = useState<{ value: string; label: string } | null>(null);
  const [street, setStreet] = useState('');
  const [mapPin, setMapPin] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<PSGCItem[]>([]);
  const [provinces, setProvinces] = useState<PSGCItem[]>([]);
  const [cities, setCities] = useState<PSGCItem[]>([]);
  const [barangays, setBarangays] = useState<PSGCItem[]>([]);

  // Fetch regions on mount
  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/regions/')
      .then(res => res.json())
      .then((data: PSGCItem[]) => setRegions(data));
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    if (!region) return setProvinces([]);
    fetch(`https://psgc.gitlab.io/api/regions/${region.value}/provinces/`)
      .then(res => res.json())
      .then((data: PSGCItem[]) => setProvinces(data));
    setProvince(null);
    setCity(null);
    setBarangay(null);
    setCities([]);
    setBarangays([]);
  }, [region]);

  // Fetch cities when province changes
  useEffect(() => {
    if (!province) return setCities([]);
    fetch(`https://psgc.gitlab.io/api/provinces/${province.value}/cities-municipalities/`)
      .then(res => res.json())
      .then((data: PSGCItem[]) => setCities(data));
    setCity(null);
    setBarangay(null);
    setBarangays([]);
  }, [province]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (!city) return setBarangays([]);
    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${city.value}/barangays/`)
      .then(res => res.json())
      .then((data: PSGCItem[]) => setBarangays(data));
    setBarangay(null);
  }, [city]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'avatar') {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (type === 'banner') setUploadingBanner(true); else setUploadingAvatar(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (type === 'banner') setBannerUrl(data.url);
      else setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (type === 'banner') setUploadingBanner(false); else setUploadingAvatar(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !owner || !region || !province || !city || !barangay || !street || !email) {
      setError('All fields except Google Maps link and description are required.');
      return;
    }
    setError('');
    onSave({
      name,
      owner,
      region: region.label,
      province: province.label,
      city: city.label,
      barangay: barangay.label,
      street,
      mapPin,
      email,
      description,
      bannerUrl,
      avatarUrl
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full sm:max-w-xl mx-auto bg-green-50/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-md flex flex-col gap-4">
      <h2 className="text-lg sm:text-2xl font-bold text-green-900 mb-2">Enter Farm Details</h2>
      {error && <div className="text-red-700 bg-red-100 rounded p-2 text-center">{error}</div>}
      {/* Banner upload */}
      <div>
        <label className="block mb-1 font-semibold text-green-900">Farm Banner <span className="text-green-700 font-normal">(optional)</span></label>
        <div className="flex items-center gap-4">
          <img
            src={bannerUrl || '/gamefowl-farm.jpg'}
            alt="Farm Banner Preview"
            className="h-20 w-40 object-cover rounded border border-green-200 bg-white"
          />
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'banner')} disabled={uploadingBanner} />
          {uploadingBanner && <span className="text-green-700">Uploading...</span>}
        </div>
      </div>
      {/* Avatar upload */}
      <div>
        <label className="block mb-1 font-semibold text-green-900">Farm Icon <span className="text-green-700 font-normal">(optional)</span></label>
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || '/window.svg'}
            alt="Farm Icon Preview"
            className="h-16 w-16 object-cover rounded-full border border-green-200 bg-white"
          />
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'avatar')} disabled={uploadingAvatar} />
          {uploadingAvatar && <span className="text-green-700">Uploading...</span>}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Farm Name</label>
        <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Farm Owner</label>
        <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900" value={owner} onChange={e => setOwner(e.target.value)} required />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Region</label>
        <Select
          options={regions.map((r: PSGCItem) => ({ value: r.code, label: r.name }))}
          value={region}
          onChange={setRegion}
          isClearable
          placeholder="Select Region"
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Province</label>
        <Select
          options={provinces.map((p: PSGCItem) => ({ value: p.code, label: p.name }))}
          value={province}
          onChange={setProvince}
          isClearable
          placeholder="Select Province"
          isDisabled={!region}
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">City/Municipality</label>
        <Select
          options={cities.map((c: PSGCItem) => ({ value: c.code, label: c.name }))}
          value={city}
          onChange={setCity}
          isClearable
          placeholder="Select City/Municipality"
          isDisabled={!province}
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Barangay</label>
        <Select
          options={barangays.map((b: PSGCItem) => ({ value: b.code, label: b.name }))}
          value={barangay}
          onChange={setBarangay}
          isClearable
          placeholder="Select Barangay"
          isDisabled={!city}
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Street/Lot/Details</label>
        <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900" value={street} onChange={e => setStreet(e.target.value)} required />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Google Maps Link <span className="text-green-700 font-normal">(optional)</span></label>
        <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900" value={mapPin} onChange={e => setMapPin(e.target.value)} placeholder="Paste Google Maps link or coordinates (optional)" />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Farm Email</label>
        <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-green-900">Description <span className="text-green-700 font-normal">(optional)</span></label>
        <textarea className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <button type="submit" className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition">Save</button>
    </form>
  );
}

export default function DashboardPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastPage', window.location.pathname);
    }
  }, []);

  // For client-side cookie access, we'll use a different approach
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token in cookies on client side
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Replace mock farm data with state
  const [farm, setFarm] = useState<null | {
    name: string;
    owner: string;
    region: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    mapPin?: string;
    email: string;
    description?: string;
    bannerUrl?: string;
    avatarUrl?: string;
  }>(null);
  const [farmLoading, setFarmLoading] = useState(true);
  const [farmError, setFarmError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState('bloodlines');

  // Fetch farm details from backend
  useEffect(() => {
    if (!user) return;
    setFarmLoading(true);
    setFarmError(null);
    fetch('/api/farm')
      .then(async res => {
        if (res.status === 404) {
          setFarm(null);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load farm details.');
        }
        const data = await res.json();
        if (data.farm) setFarm(data.farm);
        else setFarm(null);
      })
      .catch((err) => setFarmError(err instanceof Error ? err.message : String(err)))
      .finally(() => setFarmLoading(false));
  }, [user]);

  useEffect(() => {
    if (farmError === 'Not authenticated') {
      router.replace('/login');
    }
  }, [farmError, router]);

  // Save or update farm details
  async function handleSaveFarm(farmData: FarmFormData) {
    setFarmLoading(true);
    setFarmError(null);
    try {
      const method = farm ? 'PUT' : 'POST';
      const res = await fetch('/api/farm', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save farm');
      setFarm(data.farm);
    } catch (err) {
      setFarmError(err instanceof Error ? err.message : String(err));
    } finally {
      setFarmLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Not logged in, show login link
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Not logged in</h2>
          <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'breeder') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Not authorized</h2>
          <p>You must be a breeder to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Header />
      <Navbar onSectionSelect={setSelectedSection} />
      <main className="flex flex-col items-center flex-1 w-full px-2 sm:px-4 py-4 sm:py-8 z-0">
        {farmLoading ? (
          <div className="text-center text-green-900">Loading farm details...</div>
        ) : farmError ? (
          farmError === 'Not authenticated' ? (
            <div className="text-center text-green-900">Redirecting to login...</div>
          ) : (
            <div className="text-center text-red-700 bg-red-100 rounded p-2 mb-4">{farmError}</div>
          )
        ) : (
          <>
            {/* Farm Banner before Bloodlines section */}
            <FarmBanner
              userName={user.name}
              farmName={farm?.name || 'Your Farm'}
              bannerUrl={farm?.bannerUrl}
              onBannerChange={(url) => setFarm(farm => farm ? { ...farm, bannerUrl: url } : farm)}
            />
            {selectedSection === 'bloodlines' && <BloodlinesSection />}
            {selectedSection === 'breeding' && <div className="w-full max-w-xl mx-auto bg-white/80 border border-green-200 rounded-xl shadow p-6 text-green-900 text-center z-0">Breeding Materials section coming soon.</div>}
            {selectedSection === 'battle' && <div className="w-full max-w-xl mx-auto bg-white/80 border border-green-200 rounded-xl shadow p-6 text-green-900 text-center z-0">Battle Crosses section coming soon.</div>}
            {selectedSection === 'sale' && <div className="w-full max-w-xl mx-auto bg-white/80 border border-green-200 rounded-xl shadow p-6 text-green-900 text-center z-0">Available For Sale section coming soon.</div>}
            <div className="w-full max-w-xl mx-auto mt-6 z-0">
              {farm ? (
                <FarmDetailsCard farm={farm} />
              ) : (
                <FarmDetailsForm onSave={handleSaveFarm} userEmail={user?.email || ''} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 