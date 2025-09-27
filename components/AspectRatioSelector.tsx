
import React from 'react';
import type { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
}

const ratios: { value: AspectRatio; label: string, icon: string }[] = [
  { value: '1:1', label: 'Vuông', icon: 'far fa-square' },
  { value: '16:9', label: 'Ngang', icon: 'fas fa-rectangle-wide' },
  { value: '9:16', label: 'Dọc', icon: 'fas fa-mobile-screen' },
  { value: '4:3', label: '4:3', icon: 'far fa-desktop' },
  { value: '3:4', label: '3:4', icon: 'far fa-tablet-screen-button' },
];

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tỉ lệ ảnh
      </label>
      <div className="grid grid-cols-5 gap-2">
        {ratios.map((ratio) => (
          <button
            key={ratio.value}
            type="button"
            onClick={() => onRatioChange(ratio.value)}
            className={`
              p-2 border rounded-lg flex flex-col items-center justify-center transition-colors
              ${
                selectedRatio === ratio.value
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
            title={ratio.label}
          >
            <i className={`${ratio.icon} text-xl`}></i>
            <span className="text-xs mt-1">{ratio.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;
