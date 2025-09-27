import React, { useState, useEffect, useRef } from 'react';
import VideoResult from '../components/VideoResult';
import type { ImageFile } from '../types';
import { generateMotionVideo } from '../services/geminiService';

const loadingMessages = [
    "AI đang phân tích các hình ảnh của bạn...",
    "Đang khởi tạo đồng thời các mô hình video Veo...",
    "Quá trình này có thể mất vài phút, vui lòng chờ...",
    "Render song song từng khung hình với độ chính xác cao...",
    "Đang tổng hợp các kết quả, sắp hoàn thành rồi...",
];

interface MotionVideoProps {
    isLoggedIn: boolean;
    credits: number;
    deductCredits: (amount: number) => void;
    onLoginRequest: () => void;
}

const COST_PER_VIDEO = 10; // Each video generation costs 10 credits

const MotionVideo: React.FC<MotionVideoProps> = ({ isLoggedIn, credits, deductCredits, onLoginRequest }) => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrls, setResultUrls] = useState<string[]>([]);
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
    const [selectedModel, setSelectedModel] = useState<'veo2' | 'veo3'>('veo3');
    const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
    
    const intervalRef = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Memory Leak Fix: Robust Object URL Cleanup ---
    const cleanupRef = useRef({ images, resultUrls });
    useEffect(() => {
        cleanupRef.current = { images, resultUrls };
    });

    useEffect(() => {
        return () => {
            cleanupRef.current.images.forEach(image => URL.revokeObjectURL(image.preview));
            cleanupRef.current.resultUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);
    // --- End of Memory Leak Fix ---

    useEffect(() => {
        if (isLoading) {
            intervalRef.current = window.setInterval(() => {
                setCurrentLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 5000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setCurrentLoadingMessage(loadingMessages[0]);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLoading]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles: ImageFile[] = Array.from(event.target.files).map((file: File) => ({
                file: file,
                preview: URL.createObjectURL(file),
            }));

            setImages(prev => {
                prev.forEach(img => URL.revokeObjectURL(img.preview));
                return newFiles;
            });

            if (event.target) {
                event.target.value = "";
            }
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => {
            const imageToRemove = prev[indexToRemove];
            if (imageToRemove) {
                 URL.revokeObjectURL(imageToRemove.preview);
            }
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            setError('Vui lòng tải lên ít nhất một hình ảnh.');
            return;
        }

        const totalCost = images.length * COST_PER_VIDEO;
        if (credits < totalCost) {
            setError(`Bạn cần ${totalCost} credits, nhưng chỉ có ${credits}.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        setResultUrls(prevUrls => {
            prevUrls.forEach(url => URL.revokeObjectURL(url));
            return [];
        });
        
        const modelToUse = 'veo-2.0-generate-001';

        const videoPromises = images.map(image => 
            generateMotionVideo(image.file, modelToUse, aspectRatio)
        );

        const results = await Promise.allSettled(videoPromises);

        const successfulUrls: string[] = [];
        const failedErrors: string[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successfulUrls.push(result.value);
            } else {
                failedErrors.push(`Ảnh ${index + 1}: ${(result.reason as Error).message}`);
            }
        });

        setResultUrls(successfulUrls);

        if (successfulUrls.length > 0) {
            deductCredits(successfulUrls.length * COST_PER_VIDEO);
        }

        if (failedErrors.length > 0) {
            const combinedError = `Đã xử lý xong. ${successfulUrls.length} thành công. ${failedErrors.length} thất bại:\n- ${failedErrors.join('\n- ')}`;
            setError(combinedError);
        }
        
        setIsLoading(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="text-center p-8 flex flex-col items-center justify-center min-h-[400px]">
                <i className="fas fa-lock text-4xl text-purple-500 mb-4"></i>
                <h2 className="text-2xl font-bold mb-2">Yêu cầu đăng nhập Flow</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Vui lòng đăng nhập vào tài khoản Flow của bạn để sử dụng tính năng này.</p>
                <button
                    onClick={onLoginRequest}
                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <i className="fab fa-google"></i>
                    <span>Đăng nhập với Flow</span>
                </button>
            </div>
        )
    }
    
    const totalCost = images.length * COST_PER_VIDEO;
    const hasEnoughCredits = credits >= totalCost;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-1 text-center">Flow: Video Chuyển động (công nghệ Veo)</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Giải phóng sức sáng tạo! Biến ảnh tĩnh thành video nghệ thuật với các chuyển động độc đáo như co giãn chất liệu, xoay vòng 360 độ...</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className="relative w-full min-h-[12rem] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    role="button" tabIndex={0} aria-label="Tải lên nhiều ảnh"
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                    {images.length === 0 ? (
                        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 p-4">
                            <i className="fas fa-images text-3xl mb-2"></i>
                            <span>Tải lên nhiều ảnh</span>
                            <span className="text-xs mt-1">Nhấn để chọn ảnh</span>
                        </div>
                    ) : (
                        <div className="p-2 w-full h-full">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                {images.map((image, index) => (
                                <div key={index} className="relative aspect-square group">
                                    <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                    <button
                                    onClick={(ev) => { ev.stopPropagation(); handleRemoveImage(index); }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100 text-xs"
                                    aria-label={`Gỡ ảnh ${index + 1}`}
                                    >&times;</button>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Chọn Model</label>
                        <div className="flex justify-center bg-gray-200 dark:bg-gray-900 rounded-lg p-1">
                            <button type="button" onClick={() => setSelectedModel('veo2')} className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${selectedModel === 'veo2' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Veo 2</button>
                            <button type="button" onClick={() => setSelectedModel('veo3')} className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${selectedModel === 'veo3' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Veo 3 <span className="text-xs opacity-70">(Mới nhất)</span></button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Tỷ lệ khung hình</label>
                        <div className="flex justify-center bg-gray-200 dark:bg-gray-900 rounded-lg p-1">
                           <button type="button" onClick={() => setAspectRatio('9:16')} className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${aspectRatio === '9:16' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}><i className="fas fa-mobile-screen"></i> 9:16 Dọc</button>
                           <button type="button" onClick={() => setAspectRatio('16:9')} className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${aspectRatio === '16:9' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}><i className="fas fa-rectangle-wide"></i> 16:9 Ngang</button>
                        </div>
                    </div>
                </div>


                {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md whitespace-pre-line">{error}</p>}
                
                <div className="text-center pt-4">
                    {images.length > 0 && (
                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg inline-block">
                            <p>Số lượng: <span className="font-semibold">{images.length} ảnh</span></p>
                            <p>Chi phí: {images.length} × {COST_PER_VIDEO} = <span className="font-bold text-purple-500">{totalCost} credits</span></p>
                            {!hasEnoughCredits && (
                                <p className="text-red-500 font-semibold mt-1">Bạn không đủ credits để thực hiện.</p>
                            )}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading || images.length === 0 || !hasEnoughCredits}
                        className="w-full sm:w-auto min-h-[52px] px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mx-auto"
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 rounded-full animate-pulse bg-white"></div>
                                    <div className="w-4 h-4 rounded-full animate-pulse bg-white" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-4 h-4 rounded-full animate-pulse bg-white" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <span className="text-sm mt-2">{currentLoadingMessage}</span>
                            </div>
                        ) : `Tạo ${images.length > 0 ? images.length : ''} Video (${totalCost} credits)`}
                    </button>
                </div>
            </form>
            
            <VideoResult videoUrls={resultUrls} />
        </div>
    );
};

export default MotionVideo;