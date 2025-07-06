"use client";
import { useEffect, useState, ReactNode, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Navbar from './Navbar';

interface SharedDashboardLayoutProps {
  userType: 'breeder' | 'fighter';
  menuConfig: Array<{ label: string; href: string }>;
  bannerComponent: ComponentType<any>;
  detailsCardComponent: ComponentType<any>;
  children: ReactNode;
  detailsCardDataKey: string; // e.g. 'farm' or 'stable'
  fetchDetailsUrl: string; // e.g. '/api/farm' or '/api/stable'
}

export default function SharedDashboardLayout({
  userType,
  menuConfig,
  bannerComponent: BannerComponent,
  detailsCardComponent: DetailsCardComponent,
  children,
  detailsCardDataKey,
  fetchDetailsUrl,
}: SharedDashboardLayoutProps) {
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState<any>(null);
  const [entityLoading, setEntityLoading] = useState(true);
  const [entityError, setEntityError] = useState<string | null>(null);
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
    setEntityLoading(true);
    setEntityError(null);
    fetch(fetchDetailsUrl)
      .then(async res => {
        if (res.status === 404) {
          setEntity(null);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load details.');
        }
        const data = await res.json();
        if (data[detailsCardDataKey]) setEntity(data[detailsCardDataKey]);
        else setEntity(null);
      })
      .catch((err) => setEntityError(err instanceof Error ? err.message : String(err)))
      .finally(() => setEntityLoading(false));
  }, [user, fetchDetailsUrl, detailsCardDataKey]);

  useEffect(() => {
    if (entityError === 'Not authenticated') {
      router.replace('/login');
    }
  }, [entityError, router]);

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

  if (user.role !== userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Not authorized</h2>
          <p>You must be a {userType} to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Header />
      <Navbar menuConfig={menuConfig} userType={userType} />
      <BannerComponent
        userName={user.name}
        entityName={entity?.name || (userType === 'breeder' ? 'Your Farm' : 'Your Stable')}
        userType={userType}
        bannerUrl={entity?.bannerUrl}
        onBannerChange={(url: string) => setEntity((e: any) => e ? { ...e, bannerUrl: url } : e)}
      />
      <main className="flex flex-col items-center flex-1 w-full px-2 sm:px-4 py-4 sm:py-8">
        <div className="w-full mt-0 mb-6">{children}</div>
        <div className="w-full max-w-xl mx-auto mt-6">
          {entity ? (
            <DetailsCardComponent {...{ [detailsCardDataKey]: entity }} />
          ) : (
            <div className="text-center text-green-900">No details found.</div>
          )}
        </div>
      </main>
    </div>
  );
} 