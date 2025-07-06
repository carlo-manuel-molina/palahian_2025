"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Navbar from './Navbar';
import FarmDetailsCard from './BreederDetailsCard';
import FarmBanner from './FarmBanner';
import { getMenuConfig, type UserRole } from '@/lib/permissions';

type Farm = {
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
  [key: string]: any; // for any extra fields
};

type Stable = {
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
  [key: string]: any; // for any extra fields
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState<any>(null);
  const [stable, setStable] = useState<any>(null);
  const [farmLoading, setFarmLoading] = useState(true);
  const [stableLoading, setStableLoading] = useState(true);
  const [farmError, setFarmError] = useState<string | null>(null);
  const [stableError, setStableError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'fighter') {
      // Fetch stable data for fighters
      setStableLoading(true);
      setStableError(null);
      fetch('/api/stable')
        .then(async res => {
          if (res.status === 404) {
            setStable(null);
            return;
          }
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to load stable details.');
          }
          const data = await res.json();
          if (data.stable) setStable(data.stable);
          else setStable(null);
        })
        .catch((err) => setStableError(err instanceof Error ? err.message : String(err)))
        .finally(() => setStableLoading(false));
    } else {
      // Fetch farm data for breeders
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
    }
  }, [user]);

  useEffect(() => {
    if (farmError === 'Not authenticated' || stableError === 'Not authenticated') {
      router.replace('/login');
    }
  }, [farmError, stableError, router]);

  useEffect(() => {
    // Redirect to /dashboard/sale by default
    if (window.location.pathname === '/dashboard') {
      router.replace('/dashboard/sale');
    }
  }, [router]);

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
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  const menuConfig = getMenuConfig(user.role as UserRole);
  const userType: 'breeder' | 'fighter' = user.role === 'breeder' ? 'breeder' : 'fighter';

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Header />
      <Navbar menuConfig={menuConfig} userType={userType} />
      <main className="flex flex-col items-center flex-1 w-full px-2 sm:px-4 py-4 sm:py-8 z-0">
        <FarmBanner
          userName={user.name}
          farmName={farm?.name}
          stableName={stable?.name}
          userType={userType}
          bannerUrl={userType === 'breeder' ? farm?.bannerUrl : stable?.bannerUrl}
          onBannerChange={(url) => {
            if (userType === 'breeder') {
              setFarm((farm: Farm) => farm ? { ...farm, bannerUrl: url } : farm);
            } else {
              setStable((stable: Stable) => stable ? { ...stable, bannerUrl: url } : stable);
            }
          }}
        />
        <div className="w-full max-w-xl mx-auto mt-6 z-0">
          {userType === 'breeder' ? (
            farm ? (
              <FarmDetailsCard farm={farm} />
            ) : (
              <div className="text-center text-green-900">No farm details found.</div>
            )
          ) : (
            stable ? (
              <div className="w-full max-w-full sm:max-w-xl mx-auto bg-green-50/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-md">
                <h2 className="text-lg sm:text-2xl font-bold text-green-900 mb-2">Stable Details</h2>
                <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Stable Name:</span> {stable.name}</div>
                <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Stable Owner:</span> {stable.owner}</div>
                <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Address:</span> {stable.street}, {stable.barangay}, {stable.city}, {stable.province}, {stable.region}, Philippines</div>
                {stable.mapPin && (
                  <div className="text-green-900 text-base sm:text-lg mb-1">
                    <span className="font-semibold">Google Maps Link:</span> <a href={stable.mapPin} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">{stable.mapPin}</a>
                  </div>
                )}
                <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Stable Email:</span> {stable.email}</div>
                {stable.description && <div className="text-green-900 text-base sm:text-lg"><span className="font-semibold">Description:</span> {stable.description}</div>}
              </div>
            ) : (
              <div className="text-center text-green-900">No stable details found.</div>
            )
          )}
        </div>
      </main>
    </div>
  );
} 