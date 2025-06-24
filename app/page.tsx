"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Farm {
  farmId: number;
  name: string;
  owner: string;
  region: string;
  province: string;
  city: string;
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

function Header() {
  return (
    <header className="w-full bg-green-100/80 backdrop-blur-md border-b border-green-200 shadow-sm py-2 px-3 sm:py-4 sm:px-6 flex flex-col sm:flex-row items-center sm:justify-between">
      <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
        <img src="/gamefowl-farm.jpg" alt="Palahian Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow mr-2 sm:mr-3 border-2 border-green-300" />
        <span
          className="text-2xl sm:text-3xl font-bold text-green-900 drop-shadow"
          style={{ fontFamily: 'Dancing Script, cursive', letterSpacing: '1px', textShadow: '1px 1px 4px #222' }}
        >
          palahian.com
        </span>
      </div>
      <div className="flex w-full sm:w-auto justify-center sm:justify-end space-x-2 mt-2 sm:mt-0">
        <Link 
          href="/search" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </Link>
        <Link 
          href="/login" 
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Register
        </Link>
      </div>
    </header>
  );
}

export default function HomePage() {
  const [farms, setFarms] = useState<Array<{ farm: Farm; breeder: User }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicFarms();
  }, []);

  const fetchPublicFarms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/farms/public');
      if (response.ok) {
        const data = await response.json();
        setFarms(data.farms || []);
      } else {
        throw new Error('Failed to fetch farms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-green-600">Loading farms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Quality Gamefowl
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse farms, find breeders, and connect with the gamefowl community
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Start Trading
            </Link>
            <Link 
              href="#farms" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Browse Farms
            </Link>
          </div>
        </div>

        {/* Role Information */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Choose Your Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-semibold text-gray-900 mb-2">Breeder</h4>
              <p className="text-sm text-gray-600">Breed, sell, and buy chickens</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">⚔️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Fighter</h4>
              <p className="text-sm text-gray-600">Fight, sell, and buy chickens</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-900 mb-2">Buyer</h4>
              <p className="text-sm text-gray-600">Purchase quality chickens</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🛒</div>
              <h4 className="font-semibold text-gray-900 mb-2">Seller</h4>
              <p className="text-sm text-gray-600">Sell your chickens</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🚚</div>
              <h4 className="font-semibold text-gray-900 mb-2">Shipper</h4>
              <p className="text-sm text-gray-600">Transport chickens safely</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">Gaffer</h4>
              <p className="text-sm text-gray-600">Manage fights and events</p>
            </div>
          </div>
        </div>

        {/* Farms Section */}
        <div id="farms">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Featured Farms</h3>
          
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
              <button 
                onClick={fetchPublicFarms}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : farms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏚️</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Farms Yet</h4>
              <p className="text-gray-600">Be the first to register and create a farm!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map(({ farm, breeder }) => (
                <Link 
                  key={farm.farmId} 
                  href={`/farm/${breeder.userId}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
                >
                  {farm.bannerUrl && (
                    <div 
                      className="h-32 bg-cover bg-center rounded-lg mb-4"
                      style={{ backgroundImage: `url(${farm.bannerUrl})` }}
                    />
                  )}
                  <h4 className="font-semibold text-gray-900 mb-2">{farm.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">Owned by {breeder.name}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {farm.city}, {farm.province}
                  </p>
                  {farm.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">{farm.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
