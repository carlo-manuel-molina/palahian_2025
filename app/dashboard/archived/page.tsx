"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChickenCarousel from '../components/ChickenCarousel';
import { hasModuleAccess, type UserRole } from '@/lib/permissions';

interface Chicken {
  chickenId: number;
  name?: string;
  sire?: string;
  dam?: string;
  legbandNo?: string;
  wingbandNo?: string;
  bloodline?: string;
  status: string;
  gender: 'rooster' | 'hen';
  hatchDate?: string;
  breederType?: 'breeder' | 'fighter';
  forSale: boolean;
  isBreeder: boolean;
  pictures?: string[];
  description?: string;
  fightRecord?: string;
  price?: number;
  father?: Chicken;
  mother?: Chicken;
}

export default function ArchivedChickensPage() {
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch user info and check permissions
    fetch('/api/auth/me').then(async res => {
      if (!res.ok) {
        setUser(null);
        setUserLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data.user);
      
      // Check if user has access to archived module
      if (!hasModuleAccess(data.user.role as UserRole, 'archived')) {
        router.replace('/search');
        return;
      }
      
      setUserLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (userLoading) return;
    fetchChickens();
  }, [userLoading]);

  const fetchChickens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chickens');
      if (!response.ok) {
        throw new Error('Failed to fetch chickens');
      }
      const data = await response.json();
      
      // Filter for archived chickens only (bought or dead)
      const archivedChickens = (data.chickens || []).filter((chicken: Chicken) => 
        chicken.status === 'bought' || chicken.status === 'dead'
      );
      
      setChickens(archivedChickens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chickens');
    } finally {
      setLoading(false);
    }
  };

  const boughtChickens = chickens.filter(chicken => chicken.status === 'bought');
  const deadChickens = chickens.filter(chicken => chicken.status === 'dead');

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            <span className="ml-2 text-gray-600">Loading archived chickens...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Archived Chickens</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchChickens}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Archived Chickens</h1>
          <p className="text-gray-600">
            {user?.role === 'breeder' 
              ? 'View your archived chickens that were bought or have passed away'
              : user?.role === 'fighter'
              ? 'View your archived fighters that were bought or have passed away'
              : 'View archived chickens that were bought or have passed away'
            }
          </p>
        </div>

        {/* Summary Stats */}
        {chickens.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-600">{chickens.length}</div>
                <div className="text-sm text-gray-700">Total Archived</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{boughtChickens.length}</div>
                <div className="text-sm text-blue-700">Bought</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">{deadChickens.length}</div>
                <div className="text-sm text-red-700">Dead</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">
                  {chickens.filter(c => c.breederType === 'fighter').length}
                </div>
                <div className="text-sm text-purple-700">
                  {user?.role === 'fighter' ? 'Fighters' : 'Fighters'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bought Chickens Section */}
        <ChickenCarousel 
          title="💰 Bought Chickens" 
          chickens={boughtChickens} 
          onUpdate={fetchChickens} 
        />

        {/* Dead Chickens Section */}
        <ChickenCarousel 
          title="💀 Dead Chickens" 
          chickens={deadChickens} 
          onUpdate={fetchChickens} 
        />

        {/* No Archived Chickens Message */}
        {chickens.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Archived Chickens</h3>
            <p className="text-gray-600">
              {user?.role === 'breeder'
                ? "You haven't archived any chickens yet. Archived chickens will appear here when you mark them as bought or dead."
                : user?.role === 'fighter'
                ? "You haven't archived any fighters yet. Archived fighters will appear here when you mark them as bought or dead."
                : "No archived chickens found. Archived chickens will appear here when they are marked as bought or dead."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 