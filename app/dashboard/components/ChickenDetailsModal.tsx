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
  color?: string;
  legs?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    legbandNo: '',
    wingbandNo: '',
    bloodline: '',
    color: '',
    legs: '',
    price: '',
    description: '',
    forSale: false,
  });
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !chicken) return;
    
    setUploadingImages(true);
    try {
      const compressedImage = await compressImage(files[0]);
      
      // Update chicken with new image
      const response = await fetch(`/api/chickens/${chicken.chickenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pictures: [compressedImage, ...(chicken.pictures || [])]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chicken image');
      }

      // Update local state
      setChicken(prev => prev ? {
        ...prev,
        pictures: [compressedImage, ...(prev.pictures || [])]
      } : null);
      
      onUpdate(); // Refresh the main list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing && chicken) {
      // Initialize edit form with current values
      setEditForm({
        name: chicken.name || '',
        legbandNo: chicken.legbandNo || '',
        wingbandNo: chicken.wingbandNo || '',
        bloodline: chicken.bloodline || '',
        color: chicken.color || '',
        legs: chicken.legs || '',
        price: chicken.price?.toString() || '',
        description: chicken.description || '',
        forSale: chicken.forSale || false,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSaveChanges = async () => {
    if (!chicken) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/chickens/${chicken.chickenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name || null,
          legbandNo: editForm.legbandNo || null,
          wingbandNo: editForm.wingbandNo || null,
          bloodline: editForm.bloodline || 'Unknown',
          color: editForm.color || null,
          legs: editForm.legs || null,
          price: editForm.price ? parseFloat(editForm.price) : null,
          description: editForm.description || null,
          forSale: editForm.forSale,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chicken');
      }

      // Update local state
      setChicken(prev => prev ? {
        ...prev,
        name: editForm.name || prev.name,
        legbandNo: editForm.legbandNo || prev.legbandNo,
        wingbandNo: editForm.wingbandNo || prev.wingbandNo,
        bloodline: editForm.bloodline || prev.bloodline,
        color: editForm.color || prev.color,
        legs: editForm.legs || prev.legs,
        price: editForm.price ? parseFloat(editForm.price) : prev.price,
        description: editForm.description || prev.description,
        forSale: editForm.forSale,
      } : null);
      
      setIsEditing(false);
      onUpdate(); // Refresh the main list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chicken');
    } finally {
      setLoading(false);
    }
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
      case 'bought': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'rooster' ? '🐓' : '🐔';
  };

  if (!isOpen) return null;

  if (loading && !chicken) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
    : chicken.gender === 'rooster' 
      ? '/rooster-cartoon.svg' 
      : '/hen-cartoon.svg';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEditToggle}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isEditing 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              )}
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

                {/* Camera Icon for Image Replacement */}
                <div className="absolute bottom-2 right-2">
                  <button
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                    title="Replace image"
                    disabled={uploadingImages}
                  >
                    {uploadingImages ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                </div>

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
              {isEditing ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Edit Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Legband</label>
                        <input
                          type="text"
                          name="legbandNo"
                          value={editForm.legbandNo}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wingband</label>
                        <input
                          type="text"
                          name="wingbandNo"
                          value={editForm.wingbandNo}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bloodline</label>
                      <input
                        type="text"
                        name="bloodline"
                        value={editForm.bloodline}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="text"
                          name="color"
                          value={editForm.color}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Legs</label>
                        <input
                          type="text"
                          name="legs"
                          value={editForm.legs}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₱</span>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditInputChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="forSale"
                        checked={editForm.forSale}
                        onChange={handleEditInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">For Sale</label>
                    </div>
                  </div>
                </div>
              ) : (
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
                    {chicken.color && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium">{chicken.color}</span>
                      </div>
                    )}
                    {chicken.legs && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Legs:</span>
                        <span className="font-medium">{chicken.legs}</span>
                      </div>
                    )}
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
                    {chicken.description && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium">{chicken.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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