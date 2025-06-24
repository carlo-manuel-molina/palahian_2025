"use client";
import { useState, useEffect, useRef } from 'react';

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

interface ChickenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chickenId: number | null;
  onUpdate: () => void;
}

export default function ChickenDetailsModal({ isOpen, onClose, chickenId, onUpdate }: ChickenDetailsModalProps) {
  const [chicken, setChicken] = useState<Chicken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'breeder' | 'fighter'>('breeder');
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [videos, setVideos] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && chickenId) {
      fetchChickenDetails();
    }
  }, [isOpen, chickenId]);

  useEffect(() => {
    if (chicken) {
      // Set initial view mode based on chicken's current classification
      setViewMode(chicken.breederType === 'fighter' ? 'fighter' : 'breeder');
    }
  }, [chicken]);

  const fetchChickenDetails = async () => {
    if (!chickenId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/chickens/${chickenId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chicken details');
      }
      const data = await response.json();
      setChicken(data.chicken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chicken details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClassification = async () => {
    if (!chicken) return;

    const newType = viewMode === 'breeder' ? 'fighter' : 'breeder';
    
    try {
      setLoading(true);
      const response = await fetch(`/api/chickens/${chicken.chickenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breederType: newType,
          isBreeder: newType === 'breeder'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chicken classification');
      }

      // Update local state
      setChicken(prev => prev ? { ...prev, breederType: newType, isBreeder: newType === 'breeder' } : null);
      setViewMode(newType);
      onUpdate(); // Refresh the main list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update classification');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVideos(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('video/')) {
          throw new Error('Only video files are allowed.');
        }

        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Upload failed');
        }
        
        const data = await res.json();
        uploadedUrls.push(data.url);
      }

      setVideos(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingVideos(false);
    }
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive': return 'bg-green-100 text-green-800';
      case 'dead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'rooster' ? '🐓' : '🐔';
  };

  if (!isOpen) return null;

  if (loading && !chicken) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-green-600">Loading chicken details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-red-600 text-center py-8">
              <p>Error: {error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chicken) return null;

  const mainImage = chicken.pictures && chicken.pictures.length > 0 
    ? chicken.pictures[currentImageIndex] 
    : '/gamefowl-farm.jpg';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-900">
                {chicken.name || chicken.bloodline}
              </h2>
              <p className="text-gray-600">
                {getGenderIcon(chicken.gender)} {chicken.gender} • {chicken.bloodline}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode('breeder')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'breeder' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                🏆 Breeder Module
              </button>
              <button
                onClick={() => setViewMode('fighter')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'fighter' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                ⚔️ Fighter Module
              </button>
            </div>

            <button
              onClick={handleToggleClassification}
              disabled={loading}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'breeder'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              } disabled:opacity-50`}
            >
              {loading ? 'Updating...' : viewMode === 'breeder' ? 'Make Broodcock' : 'Make Fighter'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Images and Basic Info */}
            <div>
              {/* Main Image */}
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={mainImage}
                  alt={`${chicken.name || chicken.bloodline}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chicken.status)}`}>
                    {chicken.status}
                  </span>
                </div>

                {/* For Sale Badge */}
                {chicken.forSale && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      For Sale
                    </span>
                  </div>
                )}

                {/* Image Navigation */}
                {chicken.pictures && chicken.pictures.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {chicken.pictures.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {chicken.pictures && chicken.pictures.length > 1 && (
                <div className="flex space-x-2 mb-4">
                  {chicken.pictures.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden ${
                        index === currentImageIndex ? 'border-green-500' : 'border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{chicken.name || 'Unnamed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Legband:</span>
                    <span className="font-medium">{chicken.legbandNo || 'n/a'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wingband:</span>
                    <span className="font-medium">{chicken.wingbandNo || 'n/a'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bloodline:</span>
                    <span className="font-medium">{chicken.bloodline}</span>
                  </div>
                  {chicken.hatchDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hatched:</span>
                      <span className="font-medium">{formatDate(chicken.hatchDate)}</span>
                    </div>
                  )}
                  {chicken.forSale && chicken.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-green-600">₱{chicken.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Module Specific Content */}
            <div>
              {viewMode === 'breeder' ? (
                /* Breeder Module */
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">🏆 Breeder Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Breeder Status:</span>
                        <span className="font-medium text-green-600">Active Breeder</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Offspring Count:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">👨‍👩‍👧‍👦 Parent Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sire (Father):</span>
                        <span className="font-medium">{chicken.sire || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dam (Mother):</span>
                        <span className="font-medium">{chicken.dam || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lineage Analytics */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3">📊 Lineage Analytics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Offspring:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fight Record (Offspring):</span>
                        <span className="font-medium">0W-0L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Win Rate:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fighter Module */
                <div className="space-y-6">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-3">⚔️ Fighter Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fighter Status:</span>
                        <span className="font-medium text-red-600">Active Fighter</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fight Record:</span>
                        <span className="font-medium">{chicken.fightRecord || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight Class:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>
                  </div>

                  {/* Fight Videos */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-3">🎥 Fight Videos</h3>
                    
                    {/* Video Upload */}
                    <div className="mb-4">
                      <input
                        ref={videoInputRef}
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingVideos}
                        className="w-full px-4 py-2 border-2 border-dashed border-orange-300 rounded-md hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 text-orange-700"
                      >
                        {uploadingVideos ? 'Uploading...' : 'Click to upload fight videos'}
                      </button>
                    </div>

                    {/* Video List */}
                    {videos.length > 0 && (
                      <div className="space-y-2">
                        {videos.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm text-gray-700">Video {index + 1}</span>
                            <button
                              onClick={() => removeVideo(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Battle Cross Information */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-3">⚔️ Battle Cross Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cross Type:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opponent Bloodline:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Performance Rating:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {chicken.description && (
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700">{chicken.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 