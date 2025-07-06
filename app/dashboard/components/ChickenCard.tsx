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
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiving, setArchiving] = useState(false);

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
    : chicken.gender === 'rooster' 
      ? '/rooster-cartoon.svg' 
      : '/hen-cartoon.svg';

  const handleArchive = async (archiveReason: 'bought' | 'dead') => {
    setArchiving(true);
    try {
      const response = await fetch(`/api/chickens/${chicken.chickenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: archiveReason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive chicken');
      }

      onUpdate(); // Refresh the list
    } catch (err) {
      console.error('Failed to archive chicken:', err);
      alert('Failed to archive chicken. Please try again.');
    } finally {
      setArchiving(false);
      setShowArchiveModal(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 flex-shrink-0">
          <img
            src={mainImage}
            alt={chicken.name || chicken.bloodline}
            className="w-full h-full object-cover"
          />
          
          {/* Status Badge - Only show if not alive */}
          {chicken.status !== 'alive' && (
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chicken.status)}`}>
                {chicken.status}
              </span>
            </div>
          )}

          {/* For Sale Badge */}
          {chicken.forSale && (
            <div className="absolute top-2 right-10">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                For Sale
              </span>
            </div>
          )}

          {/* Archive Button - Only show for alive chickens */}
          {chicken.status === 'alive' && (
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setShowArchiveModal(true)}
                disabled={archiving}
                className={`p-1 rounded-full transition-colors ${
                  archiving 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title="Archive chicken"
              >
                {archiving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
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
        <div className="p-4 flex-1 flex flex-col">
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
          <div className="space-y-1 mb-4 flex-1">
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
          <div className="flex space-x-2 mt-auto">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Archive Chicken</h3>
            <p className="text-gray-600 mb-6">
              Please select the reason for archiving "{chicken.name || chicken.bloodline}":
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleArchive('bought')}
                disabled={archiving}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  archiving 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💰</span>
                  <div className="text-left">
                    <div className="font-medium text-blue-900">Bought</div>
                    <div className="text-sm text-blue-700">Chicken was purchased by someone else</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleArchive('dead')}
                disabled={archiving}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  archiving 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'bg-red-50 border-red-300 hover:bg-red-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💀</span>
                  <div className="text-left">
                    <div className="font-medium text-red-900">Dead</div>
                    <div className="text-sm text-red-700">Chicken has passed away</div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                disabled={archiving}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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