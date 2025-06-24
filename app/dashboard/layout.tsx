"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Navbar from './Navbar';
import FarmDetailsCard from './BreederDetailsCard';
import FarmBanner from './FarmBanner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState<any>(null);
  const [farmLoading, setFarmLoading] = useState(true);
  const [farmError, setFarmError] = useState<string | null>(null);
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
      <Navbar />
      <FarmBanner
        userName={user.name}
        farmName={farm?.name || 'Your Farm'}
        bannerUrl={farm?.bannerUrl}
        onBannerChange={(url) => setFarm((farm: any) => farm ? { ...farm, bannerUrl: url } : farm)}
      />
      <main className="flex flex-col items-center flex-1 w-full px-2 sm:px-4 py-4 sm:py-8">
        <div className="w-full mt-0 mb-6">{children}</div>
        <div className="w-full max-w-xl mx-auto mt-6">
          {farm ? (
            <FarmDetailsCard farm={farm} />
          ) : (
            <div className="text-center text-green-900">No farm details found.</div>
          )}
        </div>
      </main>
    </div>
  );
} 