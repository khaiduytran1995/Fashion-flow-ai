import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageResult from '../components/ImageResult';
import type { ImageFile } from '../types';
import { createModelImage } from '../services/geminiService';

const VirtualModel: React.FC = () => {
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelImage || !outfitImage) {
      setError('Vui lòng tải lên ảnh người mẫu và trang phục.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const generatedImages = await createModelImage(modelImage.file, outfitImage.file);
      setResults(generatedImages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-center">Người mẫu AI</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Chỉ cần tải ảnh người mẫu và trang phục, AI sẽ tự động tạo nên một bức ảnh hoàn chỉnh.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUploader image={modelImage} onFileSelect={setModelImage} label="1. Tải ảnh người mẫu" />
          <ImageUploader image={outfitImage} onFileSelect={setOutfitImage} label="2. Tải ảnh trang phục" />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isLoading || !modelImage || !outfitImage}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : 'Tự động tạo ảnh'}
          </button>
        </div>
      </form>
      
      <ImageResult images={results} />
    </div>
  );
};

export default VirtualModel;