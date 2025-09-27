import React, { useState } from 'react';

interface ApiKeyManagerProps {
    currentApiKey: string | null;
    onSave: (newKey: string | null) => void;
    onClose: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ currentApiKey, onSave, onClose }) => {
    const [apiKeyInput, setApiKeyInput] = useState(currentApiKey || '');

    const handleSave = () => {
        onSave(apiKeyInput);
    };
    
    const handleClear = () => {
        setApiKeyInput('');
        onSave(null);
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg m-4 transform transition-all">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <i className="fas fa-key text-amber-500"></i>
                        Quản lý API Key
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Để tránh lỗi hết hạn ngạch, vui lòng sử dụng API Key của riêng bạn từ Google AI Studio.
                    </p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <i className="fas fa-external-link-alt mr-2"></i>
                            Nhận API Key của bạn tại đây
                        </a>
                    </div>
                    <div>
                        <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Your Google AI Studio API Key
                        </label>
                        <input
                            id="api-key-input"
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-gray-50 dark:bg-gray-700"
                            placeholder="Dán API Key của bạn vào đây"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                     <button
                        onClick={handleClear}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        Xóa Key
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50"
                        disabled={!apiKeyInput.trim()}
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyManager;
