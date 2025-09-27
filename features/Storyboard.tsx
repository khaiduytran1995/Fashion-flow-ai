import React, { useState, useRef, useEffect } from 'react';
import type { ImageFile } from '../types';
import { generateMotionPromptsForImages } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface StoryboardItem {
    image: ImageFile;
    prompt: string;
}

const Storyboard: React.FC = () => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [results, setResults] = useState<StoryboardItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            images.forEach(image => URL.revokeObjectURL(image.preview));
        };
    }, [images]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            // Clear old images
            images.forEach(image => URL.revokeObjectURL(image.preview));
            setResults([]);
            setError(null);
            
            // Fix: Explicitly type 'file' as 'File' to resolve type inference issues.
            const newFiles: ImageFile[] = Array.from(event.target.files).map((file: File) => ({
                file: file,
                preview: URL.createObjectURL(file),
            }));
            setImages(newFiles);

            if (event.target) {
                event.target.value = "";
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            setError('Vui lòng tải lên ít nhất một hình ảnh.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const imageFiles = images.map(img => img.file);
            const prompts = await generateMotionPromptsForImages(imageFiles);
            
            const newResults: StoryboardItem[] = images.map((image, index) => ({
                image: image,
                prompt: prompts[index] || "Không thể tạo prompt cho ảnh này.",
            }));
            setResults(newResults);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-1 text-center">Storyboard AI</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Tải lên một loạt ảnh, AI sẽ tự động viết kịch bản chuyển động cho từng ảnh.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className="relative w-full min-h-[12rem] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    role="button" tabIndex={0} aria-label="Tải lên nhiều ảnh cho storyboard"
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                    {images.length === 0 ? (
                        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 p-4">
                            <i className="fas fa-images text-3xl mb-2"></i>
                            <span>Tải lên các ảnh của bạn</span>
                            <span className="text-xs mt-1">Nhấn để chọn ảnh theo thứ tự</span>
                        </div>
                    ) : (
                        <div className="p-2 w-full h-full">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                                {images.map((image, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                 
                {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md whitespace-pre-line">{error}</p>}

                <div className="text-center pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || images.length === 0}
                        className="w-full sm:w-auto min-h-[52px] px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Tạo Storyboard'}
                    </button>
                </div>
            </form>

            {results.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-6 text-center">Kết quả Storyboard</h3>
                    <div className="space-y-6">
                        {results.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow">
                                <div className="md:col-span-1">
                                    <img src={item.image.preview} alt={`Storyboard image ${index + 1}`} className="w-full rounded-md object-contain max-h-48 mx-auto" />
                                </div>
                                <div className="md:col-span-2">
                                     <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Cảnh {index + 1}</p>
                                    <blockquote className="border-l-4 border-purple-500 pl-4">
                                        <p className="text-gray-700 dark:text-gray-300 italic">"{item.prompt}"</p>
                                    </blockquote>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Storyboard;