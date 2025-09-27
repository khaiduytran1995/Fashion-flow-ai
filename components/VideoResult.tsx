import React from 'react';

interface VideoResultProps {
  videoUrls: string[];
}

const VideoResult: React.FC<VideoResultProps> = ({ videoUrls }) => {
  if (videoUrls.length === 0) {
    return null;
  }

  const handleDownload = (src: string, index: number) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `video-ket-qua-${index + 1}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-center">Kết quả Video</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoUrls.map((url, index) => (
          <div key={index} className="flex flex-col items-center gap-2 p-2 sm:p-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700/50">
            <video 
                src={url} 
                controls 
                className="rounded-lg w-full aspect-video"
                aria-label={`Generated video result ${index + 1}`}
            >
                Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
            <button onClick={() => handleDownload(url, index)} className="mt-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm">
                <i className="fas fa-download"></i>
                Tải Video
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoResult;