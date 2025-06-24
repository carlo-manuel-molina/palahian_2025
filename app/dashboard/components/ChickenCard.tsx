"use client";
import { useState } from 'react';
import ChickenDetailsModal from './ChickenDetailsModal';

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

interface ChickenCardProps {
  chicken: Chicken;
  onUpdate: () => void;
}

export default function ChickenCard({ chicken, onUpdate }: ChickenCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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

  const getBreederTypeIcon = (type?: string) => {
    return type === 'fighter' ? '⚔️' : '🏆';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const mainImage = chicken.pictures && chicken.pictures.length > 0 
    ? chicken.pictures[0] 
    : '/gamefowl-farm.jpg';

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          <img
            src={mainImage}
            alt={chicken.name || chicken.bloodline}
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

          {/* Breeder Type Icon */}
          <div className="absolute bottom-2 right-2">
            <span className="text-2xl">
              {getBreederTypeIcon(chicken.breederType)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name and Gender */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {chicken.name || chicken.bloodline}
            </h3>
            <span className="text-lg">{getGenderIcon(chicken.gender)}</span>
          </div>

          {/* Bloodline */}
          <p className="text-sm text-gray-600 mb-2">{chicken.bloodline}</p>

          {/* Band Numbers */}
          <div className="space-y-1 mb-3">
            {chicken.legbandNo && (
              <p className="text-xs text-gray-500">Legband: {chicken.legbandNo}</p>
            )}
            {chicken.wingbandNo && (
              <p className="text-xs text-gray-500">Wingband: {chicken.wingbandNo}</p>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-1 mb-4">
            {chicken.hatchDate && (
              <p className="text-xs text-gray-500">
                Hatched: {formatDate(chicken.hatchDate)}
              </p>
            )}
            {chicken.forSale && chicken.price && (
              <p className="text-sm font-medium text-green-600">
                ₱{chicken.price.toLocaleString()}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <ChickenDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        chickenId={chicken.chickenId}
        onUpdate={onUpdate}
      />
    </>
  );
} 