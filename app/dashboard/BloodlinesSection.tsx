"use client";
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Bloodline {
  bloodlineId: number;
  name: string;
  origin?: string;
  modelImagesMale?: string[];
  modelImagesFemale?: string[];
  yearAcquired?: number;
  createdAt: string;
  updatedAt: string;
}

interface BloodlineFormData {
  name: string;
  origin: string;
  yearAcquired: string;
  modelImagesMale: string[];
  modelImagesFemale: string[];
}

export default function BloodlinesSection() {
  const [bloodlines, setBloodlines] = useState<Bloodline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBloodline, setEditingBloodline] = useState<Bloodline | null>(null);
  const [formData, setFormData] = useState<BloodlineFormData>({
    name: '',
    origin: '',
    yearAcquired: '',
    modelImagesMale: [],
    modelImagesFemale: []
  });
  const [uploadingImages, setUploadingImages] = useState<{ male: boolean; female: boolean }>({ male: false, female: false });

  // Fetch bloodlines on mount
  useEffect(() => {
    fetchBloodlines();
  }, []);

  async function fetchBloodlines() {
    try {
      setLoading(true);
      const response = await fetch('/api/bloodlines');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch bloodlines');
      }
      const data = await response.json();
      setBloodlines(data.bloodlines || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'male' | 'female') {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
    }

    setUploadingImages(prev => ({ ...prev, [type]: true }));
    setError('');

    try {
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        uploadedUrls.push(data.url);
      }

      setFormData(prev => ({
        ...prev,
        [`modelImages${type === 'male' ? 'Male' : 'Female'}`]: [
          ...prev[`modelImages${type === 'male' ? 'Male' : 'Female'}` as keyof BloodlineFormData] as string[],
          ...uploadedUrls
        ]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadingImages(prev => ({ ...prev, [type]: false }));
    }
  }

  function removeImage(type: 'male' | 'female', index: number) {
    setFormData(prev => ({
      ...prev,
      [`modelImages${type === 'male' ? 'Male' : 'Female'}`]: 
        (prev[`modelImages${type === 'male' ? 'Male' : 'Female'}` as keyof BloodlineFormData] as string[]).filter((_, i) => i !== index)
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Bloodline name is required.');
      return;
    }

    const submitData = {
      ...formData,
      yearAcquired: formData.yearAcquired ? parseInt(formData.yearAcquired) : undefined
    };

    if (editingBloodline) {
      updateBloodline(editingBloodline.bloodlineId, submitData);
    } else {
      createBloodline(submitData);
    }
  }

  async function createBloodline(data: any) {
    try {
      const response = await fetch('/api/bloodlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bloodline');
      }

      await fetchBloodlines();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function updateBloodline(id: number, data: any) {
    try {
      const response = await fetch('/api/bloodlines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bloodline');
      }

      await fetchBloodlines();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function deleteBloodline(id: number) {
    if (!confirm('Are you sure you want to delete this bloodline?')) return;

    try {
      const response = await fetch(`/api/bloodlines?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bloodline');
      }

      await fetchBloodlines();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function editBloodline(bloodline: Bloodline) {
    setEditingBloodline(bloodline);
    setFormData({
      name: bloodline.name,
      origin: bloodline.origin || '',
      yearAcquired: bloodline.yearAcquired?.toString() || '',
      modelImagesMale: bloodline.modelImagesMale || [],
      modelImagesFemale: bloodline.modelImagesFemale || []
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      origin: '',
      yearAcquired: '',
      modelImagesMale: [],
      modelImagesFemale: []
    });
    setEditingBloodline(null);
    setShowForm(false);
    setError(null);
  }

  if (loading) {
    return (
      <section className="w-full max-w-full sm:max-w-2xl mx-auto bg-white/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mt-2 sm:mt-4 backdrop-blur-md">
        <div className="text-center text-green-900">Loading bloodlines...</div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-full sm:max-w-2xl mx-auto bg-white/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mt-2 sm:mt-4 backdrop-blur-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-green-900">Bloodlines</h2>
        <button
          onClick={() => setShowForm(true)}
          className="p-2 rounded-full hover:bg-green-100 transition"
          title="Add Bloodline"
        >
          <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="text-red-700 bg-red-100 rounded p-2 mb-4 text-center">{error}</div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            {editingBloodline ? 'Edit Bloodline' : 'Add New Bloodline'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-green-900">Bloodline Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-green-900">Origin</label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                placeholder="e.g., Philippines, Thailand, etc."
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-green-900">Year Acquired</label>
              <input
                type="number"
                value={formData.yearAcquired}
                onChange={(e) => setFormData(prev => ({ ...prev, yearAcquired: e.target.value }))}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rooster Images */}
              <div>
                <label className="block mb-1 font-semibold text-green-900">Rooster Images</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {/* Upload frame */}
                  <div className="flex-shrink-0">
                    <label className="block w-24 h-20 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'male')}
                        disabled={uploadingImages.male}
                        className="hidden"
                      />
                      {uploadingImages.male ? (
                        <div className="text-green-600 text-xs">Uploading...</div>
                      ) : (
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </label>
                  </div>
                  
                  {/* Image thumbnails */}
                  {formData.modelImagesMale.map((url, index) => (
                    <div key={index} className="flex-shrink-0 relative group">
                      <img
                        src={url}
                        alt={`Rooster ${index + 1}`}
                        className="w-24 h-20 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('male', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hen Images */}
              <div>
                <label className="block mb-1 font-semibold text-green-900">Hen Images</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {/* Upload frame */}
                  <div className="flex-shrink-0">
                    <label className="block w-24 h-20 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'female')}
                        disabled={uploadingImages.female}
                        className="hidden"
                      />
                      {uploadingImages.female ? (
                        <div className="text-green-600 text-xs">Uploading...</div>
                      ) : (
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </label>
                  </div>
                  
                  {/* Image thumbnails */}
                  {formData.modelImagesFemale.map((url, index) => (
                    <div key={index} className="flex-shrink-0 relative group">
                      <img
                        src={url}
                        alt={`Hen ${index + 1}`}
                        className="w-24 h-20 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('female', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
              >
                {editingBloodline ? 'Update' : 'Create'} Bloodline
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {bloodlines.length === 0 ? (
        <div className="text-center text-green-800 py-8">
          <p className="text-lg">No bloodlines yet.</p>
          <p className="text-sm">Click "Add Bloodline" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bloodlines.map((bloodline) => (
            <div key={bloodline.bloodlineId} className="border border-green-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">{bloodline.name}</h3>
                  {bloodline.origin && (
                    <p className="text-sm text-green-700">Origin: {bloodline.origin}</p>
                  )}
                  {bloodline.yearAcquired && (
                    <p className="text-sm text-green-700">Acquired: {bloodline.yearAcquired}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editBloodline(bloodline)}
                    className="p-2 rounded-full hover:bg-blue-100 transition"
                    title="Edit"
                  >
                    <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteBloodline(bloodline.bloodlineId)}
                    className="p-2 rounded-full hover:bg-red-100 transition"
                    title="Delete"
                  >
                    <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Model Images */}
              {(bloodline.modelImagesMale?.length || bloodline.modelImagesFemale?.length) && (
                <div className="space-y-3">
                  {bloodline.modelImagesMale?.length && (
                    <div>
                      <p className="text-sm font-semibold text-green-800 mb-2">Roosters:</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {bloodline.modelImagesMale.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Rooster ${index + 1}`}
                            className="w-20 h-16 object-cover rounded-lg border border-green-200 shadow-sm flex-shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {bloodline.modelImagesFemale?.length && (
                    <div>
                      <p className="text-sm font-semibold text-green-800 mb-2">Hens:</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {bloodline.modelImagesFemale.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Hen ${index + 1}`}
                            className="w-20 h-16 object-cover rounded-lg border border-green-200 shadow-sm flex-shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 