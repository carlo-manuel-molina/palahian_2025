import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

type FarmDetailsCardProps = {
  farm: {
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
  };
};

export default function FarmDetailsCard({ farm }: FarmDetailsCardProps) {
  // Parse coordinates from mapPin if present
  let coords: [number, number] | null = null;
  if (farm.mapPin && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(farm.mapPin.trim())) {
    const [lat, lon] = farm.mapPin.split(',').map(Number);
    coords = [lat, lon];
  }

  // Show/hide map state
  const [showMap, setShowMap] = useState(false);
  const [geoCoords, setGeoCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!showMap) return;
    if (coords) {
      setGeoCoords(null); // prefer explicit mapPin
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    const address = `${farm.street}, ${farm.barangay}, ${farm.city}, ${farm.province}, ${farm.region}, Philippines`;
    fetch(`/api/geocode?q=${encodeURIComponent(address)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setGeoCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setGeoCoords(null);
          setError('No map location found.');
        }
      })
      .catch(() => {
        setGeoCoords(null);
        setError('Failed to fetch map location.');
      })
      .finally(() => setLoading(false));
  }, [farm, coords, showMap]);

  const mapToShow = coords || geoCoords;

  return (
    <div className="w-full max-w-full sm:max-w-xl mx-auto bg-green-50/90 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-md">
      <h2 className="text-lg sm:text-2xl font-bold text-green-900 mb-2">Farm Details</h2>
      <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Farm Name:</span> {farm.name}</div>
      <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Farm Owner:</span> {farm.owner}</div>
      <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Address:</span> {farm.street}, {farm.barangay}, {farm.city}, {farm.province}, {farm.region}, Philippines</div>
      {farm.mapPin && (
        <div className="text-green-900 text-base sm:text-lg mb-1">
          <span className="font-semibold">Google Maps Link:</span> <a href={farm.mapPin} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">{farm.mapPin}</a>
        </div>
      )}
      <div className="text-green-900 text-base sm:text-lg mb-1"><span className="font-semibold">Farm Email:</span> {farm.email}</div>
      {farm.description && <div className="text-green-900 text-base sm:text-lg"><span className="font-semibold">Description:</span> {farm.description}</div>}
      <div className="mt-4">
        <button
          className="text-green-700 underline hover:text-green-900 font-semibold focus:outline-none"
          onClick={() => setShowMap(v => !v)}
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>
      {showMap && (
        <div className="w-full h-48 sm:h-64 rounded overflow-hidden mt-4">
          {loading ? (
            <div className="text-center text-green-900">Loading map...</div>
          ) : error ? (
            <div className="text-center text-red-700">{error}</div>
          ) : mapToShow ? (
            <MapContainer center={mapToShow} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={mapToShow} />
            </MapContainer>
          ) : null}
        </div>
      )}
    </div>
  );
} 