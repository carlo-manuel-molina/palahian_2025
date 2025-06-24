"use client";
import { useState, useEffect } from 'react';
import ChickenCarousel from './components/ChickenCarousel';
import AddChickenModal from './components/AddChickenModal';

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

export default function BreedingMaterialsSection() {
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchChickens();
  }, []);

  const fetchChickens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chickens');
      if (!response.ok) {
        throw new Error('Failed to fetch chickens');
      }
      const data = await response.json();
      
      // Filter for breeders only
      const breeders = (data.chickens || []).filter((chicken: Chicken) => chicken.isBreeder);
      
      setChickens(breeders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chickens');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchChickens(); // Refresh the list
  };

  const roosters = chickens.filter(chicken => chicken.gender === 'rooster');
  const hens = chickens.filter(chicken => chicken.gender === 'hen');

  if (loading) {
    return (
      <section className="w-full max-w-full sm:max-w-2xl mx-auto bg-white/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mt-2 sm:mt-4 backdrop-blur-md">
        <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-4">Breeding Materials</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-green-600">Loading chickens...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-full sm:max-w-2xl mx-auto bg-white/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mt-2 sm:mt-4 backdrop-blur-md">
        <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-4">Breeding Materials</h2>
        <div className="text-red-600 text-center py-4">
          <p>Error: {error}</p>
          <button 
            onClick={fetchChickens}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full max-w-full sm:max-w-6xl mx-auto bg-white/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mt-2 sm:mt-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-green-900">Breeding Materials</h2>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            Add Chicken
          </button>
        </div>

        {chickens.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐓</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">No Chickens Yet</h3>
            <p className="text-gray-600 mb-4">Start building your breeding program by adding your first chickens.</p>
            <button 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Chicken
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <ChickenCarousel 
              title="Roosters" 
              chickens={roosters} 
              onUpdate={fetchChickens} 
            />
            <ChickenCarousel 
              title="Hens" 
              chickens={hens} 
              onUpdate={fetchChickens} 
            />
          </div>
        )}

        {/* Summary Stats */}
        {chickens.length > 0 && (
          <div className="mt-8 pt-6 border-t border-green-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{chickens.length}</div>
                <div className="text-sm text-green-700">Total Chickens</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{roosters.length}</div>
                <div className="text-sm text-blue-700">Roosters</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">{hens.length}</div>
                <div className="text-sm text-purple-700">Hens</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">
                  {chickens.filter(c => c.isBreeder).length}
                </div>
                <div className="text-sm text-yellow-700">Breeders</div>
              </div>
            </div>
          </div>
        )}
      </section>

      <AddChickenModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        defaultBreederType="breeder"
      />
    </>
  );
} 