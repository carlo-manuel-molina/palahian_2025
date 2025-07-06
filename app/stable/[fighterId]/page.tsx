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

interface Stable {
  stableId: number;
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

export default function PublicStablePage() {
  const params = useParams();
  const fighterId = params.fighterId as string;
  
  const [stable, setStable] = useState<Stable | null>(null);
  const [fighter, setFighter] = useState<User | null>(null);
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    fetchStableData();
    checkCurrentUser();
  }, [fighterId]);

  const fetchStableData = async () => {
    try {
      setLoading(true);
      
      // Fetch stable details
      const stableResponse = await fetch(`/api/stable/public/${fighterId}`);
      if (!stableResponse.ok) {
        throw new Error('Stable not found');
      }
      const stableData = await stableResponse.json();
      setStable(stableData.stable);
      setFighter(stableData.fighter);
      setChickens(stableData.chickens || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stable data');
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
    return currentUser?.userId === parseInt(fighterId);
  };

  const forSaleChickens = chickens.filter(chicken => chicken.forSale);
  const breederChickens = chickens.filter(chicken => chicken.isBreeder);
  const fighterChickens = chickens.filter(chicken => chicken.breederType === 'fighter');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-red-600">Loading stable...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏚️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Stable Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stable || !fighter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏚️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Stable Not Found</h2>
          <p className="text-gray-600">This stable doesn't exist or is not public.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stable.name}</h1>
              <p className="text-gray-600">Owned by {fighter.name}</p>
              <p className="text-sm text-gray-500">
                {stable.city}, {stable.province}, {stable.region}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!currentUser ? (
                <div className="flex space-x-2">
                  <a 
                    href="/signup" 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                  Manage Stable
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

      {/* Stable Banner */}
      {stable.bannerUrl && (
        <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${stable.bannerUrl})` }}>
          <div className="h-full bg-black bg-opacity-30"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stable Description */}
        {stable.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Stable</h2>
            <p className="text-gray-700">{stable.description}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{stable.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-900">
                {stable.street}, {stable.barangay}<br />
                {stable.city}, {stable.province}
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
              <p className="text-gray-600">This stable hasn't added any chickens yet.</p>
            </div>
          )}
        </div>

        {/* Role Information for Guests */}
        {!currentUser && (
          <div className="mt-8 bg-red-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">Want to Interact?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-red-800 mb-2">To Buy Chickens:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Register as a <strong>Buyer</strong></li>
                  <li>• Register as a <strong>Breeder</strong></li>
                  <li>• Register as a <strong>Fighter</strong></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-800 mb-2">To Sell Chickens:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Register as a <strong>Breeder</strong></li>
                  <li>• Register as a <strong>Seller</strong></li>
                  <li>• Register as a <strong>Fighter</strong></li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <a 
                href="/signup" 
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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