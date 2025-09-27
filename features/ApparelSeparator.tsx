import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageResult from '../components/ImageResult';
import type { ImageFile } from '../types';
import { separateApparel } from '../services/geminiService';

const ApparelSeparator: React.FC = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Vui lòng tải lên một hình ảnh.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const generatedImages = await separateApparel(image.file);
      setResults(generatedImages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-center">Bóc tách Trang phục</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Tải ảnh lên, AI sẽ tự động tách toàn bộ trang phục và phụ kiện ra khỏi nền.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUploader image={image} onFileSelect={setImage} label="Tải ảnh trang phục" />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="text-center pt-4">
            <button
                type="submit"
                disabled={isLoading || !image}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <LoadingSpinner /> : 'Tự động tách'}
            </button>
        </div>
      </form>
      
      <ImageResult images={results} />
    </div>
  );
};

export default ApparelSeparator;