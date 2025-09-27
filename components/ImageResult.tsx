
import React from 'react';

interface ImageResultProps {
  images: string[];
}

const ImageResult: React.FC<ImageResultProps> = ({ images }) => {
  if (images.length === 0) {
    return null;
  }

  const handleDownload = (src: string, index: number) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `ket-qua-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-center">Kết quả</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((src, index) => (
          <div key={index} className="group relative rounded-lg overflow-hidden shadow-lg">
            <img src={src} alt={`Generated result ${index + 1}`} className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
              <button onClick={() => handleDownload(src, index)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center">
                <i className="fas fa-download"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageResult;
