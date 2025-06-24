"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChickenCarousel from '../../dashboard/components/ChickenCarousel';

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

interface Farm {
  farmId: number;
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
}

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
}

export default function PublicFarmPage() {
  const params = useParams();
  const breederId = params.breederId as string;
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [breeder, setBreeder] = useState<User | null>(null);
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    fetchFarmData();
    checkCurrentUser();
  }, [breederId]);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      
      // Fetch farm details
      const farmResponse = await fetch(`/api/farm/public/${breederId}`);
      if (!farmResponse.ok) {
        throw new Error('Farm not found');
      }
      const farmData = await farmResponse.json();
      setFarm(farmData.farm);
      setBreeder(farmData.breeder);

      // Fetch chickens
      const chickensResponse = await fetch(`/api/chickens/public/${breederId}`);
      if (chickensResponse.ok) {
        const chickensData = await chickensResponse.json();
        setChickens(chickensData.chickens || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load farm data');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    try {
      setUserLoading(true);
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData.user);
      }
    } catch (err) {
      // User not logged in, that's fine for public view
    } finally {
      setUserLoading(false);
    }
  };

  const canSell = () => {
    if (!currentUser) return false;
    return ['breeder', 'seller', 'fighter'].includes(currentUser.role);
  };

  const canBuy = () => {
    if (!currentUser) return false;
    return ['buyer', 'breeder', 'fighter'].includes(currentUser.role);
  };

  const isOwner = () => {
    return currentUser?.userId === parseInt(breederId);
  };

  const forSaleChickens = chickens.filter(chicken => chicken.forSale);
  const breederChickens = chickens.filter(chicken => chicken.isBreeder);
  const fighterChickens = chickens.filter(chicken => chicken.breederType === 'fighter');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-green-600">Loading farm...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏚️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Farm Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!farm || !breeder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏚️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Farm Not Found</h2>
          <p className="text-gray-600">This farm doesn't exist or is not public.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
              <p className="text-gray-600">Owned by {breeder.name}</p>
              <p className="text-sm text-gray-500">
                {farm.city}, {farm.province}, {farm.region}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!currentUser ? (
                <div className="flex space-x-2">
                  <a 
                    href="/signup" 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Register to Interact
                  </a>
                  <a 
                    href="/login" 
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Login
                  </a>
                </div>
              ) : isOwner() ? (
                <a 
                  href="/dashboard" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage Farm
                </a>
              ) : (
                <div className="flex space-x-2">
                  {canBuy() && (
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Contact to Buy
                    </button>
                  )}
                  {canSell() && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Contact to Sell
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Farm Banner */}
      {farm.bannerUrl && (
        <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${farm.bannerUrl})` }}>
          <div className="h-full bg-black bg-opacity-30"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Farm Description */}
        {farm.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Farm</h2>
            <p className="text-gray-700">{farm.description}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{farm.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-900">
                {farm.street}, {farm.barangay}<br />
                {farm.city}, {farm.province}
              </p>
            </div>
          </div>
        </div>

        {/* Chickens Sections */}
        <div className="space-y-8">
          {/* For Sale Section */}
          {forSaleChickens.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">💰 For Sale</h2>
                <span className="text-sm text-gray-500">{forSaleChickens.length} chickens</span>
              </div>
              <ChickenCarousel 
                title="" 
                chickens={forSaleChickens} 
                onUpdate={() => {}} 
              />
            </div>
          )}

          {/* Breeding Materials Section */}
          {breederChickens.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">🏆 Breeding Materials</h2>
                <span className="text-sm text-gray-500">{breederChickens.length} breeders</span>
              </div>
              <ChickenCarousel 
                title="" 
                chickens={breederChickens} 
                onUpdate={() => {}} 
              />
            </div>
          )}

          {/* Fighters Section */}
          {fighterChickens.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">⚔️ Battle Crosses</h2>
                <span className="text-sm text-gray-500">{fighterChickens.length} fighters</span>
              </div>
              <ChickenCarousel 
                title="" 
                chickens={fighterChickens} 
                onUpdate={() => {}} 
              />
            </div>
          )}

          {/* No Chickens Message */}
          {chickens.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🐓</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chickens Yet</h3>
              <p className="text-gray-600">This farm hasn't added any chickens yet.</p>
            </div>
          )}
        </div>

        {/* Role Information for Guests */}
        {!currentUser && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Want to Interact?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">To Buy Chickens:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Register as a <strong>Buyer</strong></li>
                  <li>• Register as a <strong>Breeder</strong></li>
                  <li>• Register as a <strong>Fighter</strong></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">To Sell Chickens:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Register as a <strong>Breeder</strong></li>
                  <li>• Register as a <strong>Seller</strong></li>
                  <li>• Register as a <strong>Fighter</strong></li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <a 
                href="/signup" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register Now
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 