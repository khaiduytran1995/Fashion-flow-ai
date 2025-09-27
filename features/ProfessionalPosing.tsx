import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageResult from '../components/ImageResult';
import type { ImageFile } from '../types';
import { generateProfessionalPoses } from '../services/geminiService';

const ProfessionalPosing: React.FC = () => {
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceImage) {
      setError('Vui lòng tải lên ảnh tham chiếu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const generatedImages = await generateProfessionalPoses(referenceImage.file);
      setResults(generatedImages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-center">Tạo dáng Chuyên nghiệp</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Tải ảnh người mẫu và trang phục, AI sẽ tạo ra bộ ảnh lookbook với nhiều kiểu tạo dáng đa dạng.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUploader image={referenceImage} onFileSelect={setReferenceImage} label="Tải ảnh mẫu tham chiếu" />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isLoading || !referenceImage}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : 'Tạo bộ ảnh lookbook'}
          </button>
        </div>
      </form>
      
      <ImageResult images={results} />
    </div>
  );
};

export default ProfessionalPosing;