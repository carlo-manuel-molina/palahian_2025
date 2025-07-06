"use client";
import { useState, useEffect } from 'react';
import ChickenCarousel from '../components/ChickenCarousel';
import AddChickenModal from '../components/AddChickenModal';
import { useRouter } from 'next/navigation';
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

export default function SalePage() {
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
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
      
      // Check if user has access to sales module
      if (!hasModuleAccess(data.user.role as UserRole, 'sales')) {
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
      
      // Filter for chickens that are for sale and not archived
      const forSaleChickens = (data.chickens || []).filter((chicken: Chicken) => 
        chicken.forSale && chicken.status === 'alive'
      );
      
      setChickens(forSaleChickens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chickens');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchChickens(); // Refresh the list
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            <span className="ml-2 text-yellow-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            <span className="ml-2 text-yellow-600">Loading for sale chickens...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-600 text-center py-8">
            <p>Error: {error}</p>
            <button 
              onClick={fetchChickens}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-yellow-900">💰 For Sale</h1>
            {user?.role === 'breeder' ? (
              <p className="text-yellow-700">Manage your chickens available for purchase</p>
            ) : user?.role === 'fighter' ? (
              <p className="text-yellow-700">Manage your fighters available for purchase</p>
            ) : (
              <p className="text-yellow-700">Chickens for sale</p>
            )}
          </div>
          {(user?.role === 'breeder' || user?.role === 'fighter') && (
            <button 
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              onClick={() => setShowAddModal(true)}
            >
              Add Chicken
            </button>
          )}
        </div>

        {chickens.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Chickens For Sale</h3>
            <p className="text-yellow-700 mb-4">
              {user?.role === 'breeder'
                ? 'Start selling your chickens by marking them as for sale.'
                : user?.role === 'fighter'
                ? 'Start selling your fighters by marking them as for sale.'
                : 'No chickens are currently available for sale.'}
            </p>
            {(user?.role === 'breeder' || user?.role === 'fighter') && (
              <button 
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                onClick={() => setShowAddModal(true)}
              >
                Add Chicken For Sale
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <ChickenCarousel 
              title="Available For Sale" 
              chickens={chickens} 
              onUpdate={fetchChickens} 
            />
          </div>
        )}

        {/* Summary Stats */}
        {chickens.length > 0 && (
          <div className="mt-8 pt-6 border-t border-yellow-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">{chickens.length}</div>
                <div className="text-sm text-yellow-700">Total For Sale</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {chickens.filter(c => c.isBreeder).length}
                </div>
                <div className="text-sm text-green-700">Breeders</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">
                  {chickens.filter(c => c.breederType === 'fighter').length}
                </div>
                <div className="text-sm text-red-700">Fighters</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  ₱{chickens.reduce((sum, c) => sum + (c.price || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Total Value</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddChickenModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        defaultBreederType={user?.role === 'fighter' ? 'fighter' : 'breeder'}
        forSale={true}
      />
      {/* Only breeders and fighters can add chickens */}
      {user?.role !== 'breeder' && user?.role !== 'fighter' && (
        <div className="text-center text-yellow-700 mt-8">
          Only breeders and fighters can add chickens for sale.
        </div>
      )}
    </div>
  );
} 