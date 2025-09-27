
import React, { useRef } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onFileSelect: (file: ImageFile | null) => void;
  image: ImageFile | null;
  label: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, image, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      onFileSelect({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {image ? (
        <>
          <img src={image.preview} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-opacity opacity-75 hover:opacity-100"
          >
            &times;
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
          <span>{label}</span>
          <span className="text-xs mt-1">Nhấn để chọn ảnh</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
