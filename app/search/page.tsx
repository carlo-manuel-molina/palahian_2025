"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Chicken {
  chickenId: number;
  name?: string;
  bloodline?: string;
  gender: 'rooster' | 'hen';
  breederType?: 'breeder' | 'fighter';
  forSale: boolean;
  price?: number;
  pictures?: string[];
  breederId: number;
  breederName?: string;
  farmName?: string;
}

interface Seller {
  userId: number;
  name: string;
  email: string;
  role: string;
  farmName?: string;
  stableName?: string;
  storeName?: string;
  location?: string;
  description?: string;
  bannerUrl?: string;
}

function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [gender, setGender] = useState(searchParams.get('gender') || 'all');
  const [breederType, setBreederType] = useState(searchParams.get('breederType') || 'all');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || 'all');
  const [forSale, setForSale] = useState(searchParams.get('forSale') === 'true');
  
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query, category, gender, breederType, priceRange, forSale]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        category,
        ...(gender !== 'all' && { gender }),
        ...(breederType !== 'all' && { breederType }),
        ...(priceRange !== 'all' && { priceRange }),
        ...(forSale && { forSale: 'true' })
      });

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setChickens(data.chickens || []);
      setSellers(data.sellers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      q: query,
      category,
      ...(gender !== 'all' && { gender }),
      ...(breederType !== 'all' && { breederType }),
      ...(priceRange !== 'all' && { priceRange }),
      ...(forSale && { forSale: 'true' })
    });
    router.push(`/search?${params.toString()}`);
  };

  const getSellerPageUrl = (seller: Seller) => {
    switch (seller.role) {
      case 'breeder':
        return `/farm/${seller.userId}`;
      case 'fighter':
        return `/stable/${seller.userId}`;
      case 'seller':
        return `/store/${seller.userId}`;
      default:
        return '#';
    }
  };

  const getSellerTypeLabel = (role: string) => {
    switch (role) {
      case 'breeder':
        return 'Farm';
      case 'fighter':
        return 'Stable';
      case 'seller':
        return 'Store';
      default:
        return 'Account';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `₱${price.toLocaleString()}`;
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'rooster' ? '🐓' : '🐔';
  };

  const getBreederTypeIcon = (type?: string) => {
    return type === 'fighter' ? '⚔️' : '🏆';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔍 Search</h1>
              <p className="text-gray-600">Find chickens, farms, stables, and stores</p>
            </div>
            <Link 
              href="/" 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Query */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chickens, bloodlines, farms, stables, stores..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="chickens">Chickens</option>
                <option value="farms">Farms</option>
                <option value="stables">Stables</option>
                <option value="stores">Stores</option>
              </select>
            </div>

            {/* For Sale Filter */}
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={forSale}
                  onChange={(e) => setForSale(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">For Sale Only</span>
              </label>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="rooster">Rooster</option>
                <option value="hen">Hen</option>
              </select>
            </div>

            {/* Breeder Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={breederType}
                onChange={(e) => setBreederType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="breeder">Breeder</option>
                <option value="fighter">Fighter</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Prices</option>
                <option value="0-5000">Under ₱5,000</option>
                <option value="5000-15000">₱5,000 - ₱15,000</option>
                <option value="15000-50000">₱15,000 - ₱50,000</option>
                <option value="50000+">Over ₱50,000</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <span className="ml-2 text-green-600">Searching...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={performSearch}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && query && (
          <div className="space-y-8">
            {/* Sellers Results */}
            {sellers.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {getSellerTypeLabel(sellers[0]?.role)}s ({sellers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellers.map((seller) => (
                    <Link 
                      key={seller.userId} 
                      href={getSellerPageUrl(seller)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
                    >
                      {seller.bannerUrl && (
                        <div 
                          className="h-32 bg-cover bg-center rounded-lg mb-4"
                          style={{ backgroundImage: `url(${seller.bannerUrl})` }}
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {seller.farmName || seller.stableName || seller.storeName || seller.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">Owner: {seller.name}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {getSellerTypeLabel(seller.role)} • {seller.location || 'Location not specified'}
                      </p>
                      {seller.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">{seller.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Chickens Results */}
            {chickens.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Chickens ({chickens.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chickens.map((chicken) => (
                    <div key={chicken.chickenId} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="relative h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        {chicken.pictures && chicken.pictures.length > 0 ? (
                          <img
                            src={chicken.pictures[0]}
                            alt={chicken.name || chicken.bloodline}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">🐓</span>
                          </div>
                        )}
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex space-x-1">
                          <span className="text-2xl">{getGenderIcon(chicken.gender)}</span>
                          <span className="text-2xl">{getBreederTypeIcon(chicken.breederType)}</span>
                        </div>
                        
                        {chicken.forSale && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              For Sale
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {chicken.name || chicken.bloodline}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{chicken.bloodline}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        From: {chicken.farmName || chicken.breederName}
                      </p>
                      {chicken.forSale && chicken.price && (
                        <p className="text-lg font-semibold text-green-600">
                          {formatPrice(chicken.price)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {sellers.length === 0 && chickens.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        {!query && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Search Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-medium mb-2">Search for Chickens:</h4>
                <ul className="space-y-1">
                  <li>• Bloodline names (e.g., "Boston Roundhead")</li>
                  <li>• Chicken names or band numbers</li>
                  <li>• Gender (rooster/hen)</li>
                  <li>• Price ranges</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Search for Sellers:</h4>
                <ul className="space-y-1">
                  <li>• Farm, stable, or store names</li>
                  <li>• Owner names</li>
                  <li>• Locations (cities, provinces)</li>
                  <li>• Categories (farms, stables, stores)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
} 