import { useLocationStore } from '@/src/stores/location-store';
import React from 'react';

interface DeliveryPickupToggleProps {
  mode?: 'delivery' | 'pickup';
  onChange: (mode: 'delivery' | 'pickup') => void;
}

export const DeliveryPickupToggle: React.FC<DeliveryPickupToggleProps> = ({ mode, onChange }) => {
  const { isPickupMenuAvailable, isDeliveryMenuAvailable } = useLocationStore();

  return (
    <div className="flex items-center gap-4 my-4 justify-center">
      {/* Buttons */}
      {isDeliveryMenuAvailable && (
        <button
          className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200
            ${
              mode === 'delivery'
                ? 'bg-[#FF4201] text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-[#232323] dark:text-gray-200'
            }
          `}
          onClick={() => onChange('delivery')}
          type="button"
          style={{ boxShadow: 'none', border: 'none' }}
        >
          Delivery
        </button>
      )}
      {isPickupMenuAvailable && (
        <button
          className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200
            ${
              mode === 'pickup'
                ? 'bg-[#FF4201] text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-[#232323] dark:text-gray-200'
            }
          `}
          onClick={() => onChange('pickup')}
          type="button"
          style={{ boxShadow: 'none', border: 'none' }}
        >
          Pickup
        </button>
      )}
    </div>
  );
};
