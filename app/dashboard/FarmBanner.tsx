import React, { useRef, useState } from 'react';

export default function FarmBanner({
  userName,
  farmName,
  bannerUrl,
  onBannerChange,
}: {
  userName: string;
  farmName: string;
  bannerUrl?: string;
  onBannerChange?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(bannerUrl || '/gamefowl-farm.jpg');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid server response');
      }
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setCurrentBanner(data.url);
      if (onBannerChange) onBannerChange(data.url);
      // Persist bannerUrl to farm
      try {
        const updateRes = await fetch('/api/farm', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bannerUrl: data.url }),
        });
        if (!updateRes.ok) {
          const updateData = await updateRes.json().catch(() => ({}));
          throw new Error(updateData.error || 'Failed to save banner URL');
        }
      } catch (err) {
        setError('Banner uploaded but failed to save: ' + (err instanceof Error ? err.message : String(err)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-lg mb-6">
      <img
        src={currentBanner}
        alt="Farm Banner"
        className="w-full h-40 sm:h-56 object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
        <div className="text-white text-xl sm:text-2xl font-bold drop-shadow mb-1">{farmName}</div>
        <div className="text-white text-base sm:text-lg drop-shadow mb-2">Welcome, {userName}!</div>
      </div>
      {/* Camera icon button */}
      <button
        className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Change banner image"
        disabled={uploading}
        type="button"
      >
        {/* Camera SVG */}
        <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M2 18V8a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
        </svg>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
          disabled={uploading}
        />
      </button>
      {uploading && <div className="absolute top-3 left-3 bg-white/80 text-green-900 px-3 py-1 rounded shadow">Uploading...</div>}
      {error && <div className="absolute bottom-3 left-3 bg-red-100 text-red-700 px-3 py-1 rounded shadow">{error}</div>}
    </div>
  );
} 