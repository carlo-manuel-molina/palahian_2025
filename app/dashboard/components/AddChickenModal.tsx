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
}

export default function AddChickenModal({ isOpen, onClose, onSuccess, defaultBreederType }: AddChickenModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sire: '',
    dam: '',
    legbandNo: '',
    wingbandNo: '',
    bloodline: '',
    bloodlineId: '',
    gender: 'rooster' as 'rooster' | 'hen',
    hatchDate: '',
    breederType: defaultBreederType || '' as '' | 'breeder' | 'fighter',
    status: 'alive' as 'alive' | 'dead',
    forSale: false,
    price: '',
    isBreeder: defaultBreederType === 'breeder',
    description: '',
    fightRecord: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [bloodlines, setBloodlines] = useState<Bloodline[]>([]);
  const [loadingBloodlines, setLoadingBloodlines] = useState(false);
  const [showCustomBloodline, setShowCustomBloodline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch bloodlines when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBloodlines();
      // Reset form with correct defaults
      setFormData({
        name: '',
        sire: '',
        dam: '',
        legbandNo: '',
        wingbandNo: '',
        bloodline: '',
        bloodlineId: '',
        gender: 'rooster',
        hatchDate: '',
        breederType: defaultBreederType || '',
        status: 'alive',
        forSale: false,
        price: '',
        isBreeder: defaultBreederType === 'breeder',
        description: '',
        fightRecord: '',
      });
      setImages([]);
      setShowCustomBloodline(false);
    }
  }, [isOpen, defaultBreederType]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Handle bloodline selection
    if (name === 'bloodlineId') {
      if (value === 'custom') {
        setShowCustomBloodline(true);
        setFormData(prev => ({ ...prev, bloodline: '', bloodlineId: '' }));
      } else if (value === 'new') {
        setShowCustomBloodline(true);
        setFormData(prev => ({ ...prev, bloodline: '', bloodlineId: '' }));
      } else {
        setShowCustomBloodline(false);
        const selectedBloodline = bloodlines.find(b => b.bloodlineId.toString() === value);
        setFormData(prev => ({ 
          ...prev, 
          bloodline: selectedBloodline?.name || '',
          bloodlineId: value 
        }));
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed.');
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

      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate that at least one band number is provided
    if (!formData.legbandNo && !formData.wingbandNo) {
      setError('Please provide at least one band number (legband or wingband)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/chickens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pictures: images,
          price: formData.price ? parseFloat(formData.price) : null,
          hatchDate: formData.hatchDate || null,
          breederType: formData.breederType || null,
          name: formData.name || null,
          sire: formData.sire || null,
          dam: formData.dam || null,
          legbandNo: formData.legbandNo || null,
          wingbandNo: formData.wingbandNo || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create chicken');
      }

      // Reset form
      setFormData({
        name: '',
        sire: '',
        dam: '',
        legbandNo: '',
        wingbandNo: '',
        bloodline: '',
        bloodlineId: '',
        gender: 'rooster',
        hatchDate: '',
        breederType: '',
        status: 'alive',
        forSale: false,
        price: '',
        isBreeder: false,
        description: '',
        fightRecord: '',
      });
      setImages([]);
      setShowCustomBloodline(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Enter chicken name (optional)"
                />
              </div>

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
            </div>

            {/* Parent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sire (Father)
                </label>
                <input
                  type="text"
                  name="sire"
                  value={formData.sire}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="Father's name/ID (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dam (Mother)
                </label>
                <input
                  type="text"
                  name="dam"
                  value={formData.dam}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="Mother's name/ID (optional)"
                />
              </div>
            </div>

            {/* Band Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Enter legband number (optional)"
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
                  placeholder="Enter wingband number (optional)"
                />
              </div>
            </div>

            {/* Band Number Help Text */}
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <p><strong>Note:</strong> At least one band number (legband or wingband) is required. If neither is provided, a wingband number will be auto-assigned as "Palahian_[number]".</p>
            </div>

            {/* Bloodline Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bloodline
              </label>
              {loadingBloodlines ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Loading bloodlines...
                </div>
              ) : (
                <select
                  name="bloodlineId"
                  value={formData.bloodlineId}
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
                  <option value="new">Create new bloodline</option>
                </select>
              )}
            </div>

            {/* Custom Bloodline Input */}
            {showCustomBloodline && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bloodline Name
                </label>
                <input
                  type="text"
                  name="bloodline"
                  value={formData.bloodline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter bloodline name"
                />
              </div>
            )}

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="alive">Alive</option>
                  <option value="dead">Dead</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="breederType"
                  value={formData.breederType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="">Select type</option>
                  <option value="breeder">Breeder</option>
                  <option value="fighter">Fighter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hatch Date
                </label>
                <input
                  type="date"
                  name="hatchDate"
                  value={formData.hatchDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
              </div>
            </div>

            {/* For Sale Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="forSale"
                  checked={formData.forSale}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">For Sale</span>
              </div>

              {formData.forSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            {/* Breeder Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isBreeder"
                checked={formData.isBreeder}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Is Breeder</span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                placeholder="Describe the chicken's characteristics, behavior, etc."
              />
            </div>

            {/* Fight Record */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fight Record
              </label>
              <input
                type="text"
                name="fightRecord"
                value={formData.fightRecord}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                placeholder="e.g., 5W-2L"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {uploadingImages ? 'Uploading...' : 'Click to upload images'}
              </button>
              
              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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