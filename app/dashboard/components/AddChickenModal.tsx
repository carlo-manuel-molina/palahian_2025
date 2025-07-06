"use client";
import { useState, useRef, useEffect } from 'react';

interface Bloodline {
  bloodlineId: number;
  name: string;
}

interface AddChickenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBreederType?: 'breeder' | 'fighter';
  forSale?: boolean;
}

export default function AddChickenModal({ isOpen, onClose, onSuccess, defaultBreederType, forSale }: AddChickenModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'rooster' as 'rooster' | 'hen',
    legbandNo: '',
    wingbandNo: '',
    bloodline: '',
    color: '',
    legs: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bloodlines, setBloodlines] = useState<Bloodline[]>([]);
  const [loadingBloodlines, setLoadingBloodlines] = useState(false);
  const [showCustomBloodline, setShowCustomBloodline] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch user info and bloodlines when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserInfo();
      if (defaultBreederType === 'breeder' || userRole === 'breeder') {
        fetchBloodlines();
      }
      // Reset form
      setFormData({
        name: '',
        gender: 'rooster',
        legbandNo: '',
        wingbandNo: '',
        bloodline: '',
        color: '',
        legs: '',
        price: '',
      });
      setShowCustomBloodline(false);
      setUploadedImages([]);
    }
  }, [isOpen, defaultBreederType, userRole]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.user.role);
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  const fetchBloodlines = async () => {
    try {
      setLoadingBloodlines(true);
      const response = await fetch('/api/bloodlines/list');
      if (response.ok) {
        const data = await response.json();
        setBloodlines(data.bloodlines || []);
      }
    } catch (err) {
      console.error('Failed to fetch bloodlines:', err);
    } finally {
      setLoadingBloodlines(false);
    }
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
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const compressedImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressedImage = await compressImage(file);
          compressedImages.push(compressedImage);
        }
      }
      
      setUploadedImages(prev => [...prev, ...compressedImages]);
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle bloodline selection
    if (name === 'bloodlineId') {
      if (value === 'custom') {
        setShowCustomBloodline(true);
        setFormData(prev => ({ ...prev, bloodline: '' }));
      } else {
        setShowCustomBloodline(false);
        const selectedBloodline = bloodlines.find(b => b.bloodlineId.toString() === value);
        setFormData(prev => ({ 
          ...prev, 
          bloodline: selectedBloodline?.name || ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chickens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.name || null, // API will auto-assign if null
          legbandNo: formData.legbandNo || null,
          wingbandNo: formData.wingbandNo || null,
          bloodline: formData.bloodline || 'Unknown',
          color: formData.color || null,
          legs: formData.legs || null,
          price: formData.price ? parseFloat(formData.price) : null,
          pictures: uploadedImages,
          // Set defaults for required fields
          status: 'alive',
          forSale: forSale || false,
          isBreeder: defaultBreederType === 'breeder',
          breederType: defaultBreederType || 'breeder',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create chicken');
      }

      // Reset form
      setFormData({
        name: '',
        gender: 'rooster',
        legbandNo: '',
        wingbandNo: '',
        bloodline: '',
        color: '',
        legs: '',
        price: '',
      });
      setShowCustomBloodline(false);
      setUploadedImages([]);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chicken');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-green-900">Add New Chicken</h2>
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

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="rooster">Rooster</option>
                <option value="hen">Hen</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter chicken name (optional - will auto-assign if empty)"
              />
            </div>

            {/* Band Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legband Number
                </label>
                <input
                  type="text"
                  name="legbandNo"
                  value={formData.legbandNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="Legband #"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wingband Number
                </label>
                <input
                  type="text"
                  name="wingbandNo"
                  value={formData.wingbandNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="Wingband #"
                />
              </div>
            </div>

            {/* Bloodline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bloodline
              </label>
              {(defaultBreederType === 'breeder' || userRole === 'breeder') ? (
                // Breeder: Dropdown with existing bloodlines + option to create new
                <>
                  {loadingBloodlines ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      Loading bloodlines...
                    </div>
                  ) : (
                    <select
                      name="bloodlineId"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    >
                      <option value="">Select bloodline</option>
                      {bloodlines.map((bloodline) => (
                        <option key={bloodline.bloodlineId} value={bloodline.bloodlineId}>
                          {bloodline.name}
                        </option>
                      ))}
                      <option value="custom">Other (enter custom)</option>
                    </select>
                  )}
                  
                  {/* Custom Bloodline Input for Breeders */}
                  {showCustomBloodline && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="bloodline"
                        value={formData.bloodline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                        placeholder="Enter new bloodline name"
                      />
                    </div>
                  )}
                </>
              ) : (
                // Fighter: Simple text field
                <input
                  type="text"
                  name="bloodline"
                  value={formData.bloodline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter bloodline (e.g., Hatch, Roundhead, etc.)"
                />
              )}
            </div>

            {/* Color and Legs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Red, Black, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legs
                </label>
                <input
                  type="text"
                  name="legs"
                  value={formData.legs}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Yellow, White, etc."
                />
              </div>
            </div>

            {/* Price Field - Only show if forSale is true */}
            {forSale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₱</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <div className="space-y-3">
                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingImages ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-500">Click to upload images</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                  </label>
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Chicken'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 