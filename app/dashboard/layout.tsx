"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Navbar from './Navbar';
import FarmDetailsCard from './BreederDetailsCard';
import StableDetailsCard from './StableDetailsCard';
import FarmBanner from './FarmBanner';
import { hasModuleAccess, getMenuConfig, type UserRole } from '@/lib/permissions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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

  // Check if user has access to the sales module (which is the main dashboard module)
  if (!hasModuleAccess(user.role as UserRole, 'sales')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Not authorized</h2>
          <p>You don't have permission to access the sales module.</p>
        </div>
      </div>
    );
  }

  const menuConfig = getMenuConfig(user.role as UserRole);
  const userType: 'breeder' | 'fighter' = user.role === 'breeder' ? 'breeder' : 'fighter';

  // Determine background color based on user type
  const bgColor = userType === 'breeder' ? 'bg-orange-50' : 'bg-stone-50';

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col`}>
      <Header />
      <Navbar menuConfig={menuConfig} userType={userType} />
      <FarmBanner
        userName={user.name}
        farmName={farm?.name}
        stableName={stable?.name}
        userType={userType}
        bannerUrl={userType === 'breeder' ? farm?.bannerUrl : stable?.bannerUrl}
        onBannerChange={(url) => {
          if (userType === 'breeder') {
            setFarm((farm: any) => farm ? { ...farm, bannerUrl: url } : farm);
          } else {
            setStable((stable: any) => stable ? { ...stable, bannerUrl: url } : stable);
          }
        }}
      />
      <main className="flex flex-col items-center flex-1 w-full px-2 sm:px-4 py-4 sm:py-8">
        <div className="w-full mt-0 mb-6">{children}</div>
        <div className="w-full max-w-xl mx-auto mt-6">
          {userType === 'breeder' ? (
            farm ? (
              <FarmDetailsCard farm={farm} />
            ) : (
              <div className="text-center text-orange-900">No farm details found.</div>
            )
          ) : (
            stable ? (
              <StableDetailsCard stable={stable} />
            ) : (
              <div className="text-center text-stone-900">No stable details found.</div>
            )
          )}
        </div>
      </main>
    </div>
  );
} 