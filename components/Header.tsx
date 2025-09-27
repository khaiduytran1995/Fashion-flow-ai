import React from 'react';
import UserMenu from './UserMenu';

interface HeaderProps {
  isLoggedIn: boolean;
  user: { name: string; avatar: string } | null;
  credits: number;
  onLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, user, credits, onLogin, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-center items-center relative">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            Fashion Flow AI
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Nền tảng sáng tạo hình ảnh & video của bạn
          </p>
        </div>
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
          {isLoggedIn && user ? (
            <UserMenu user={user} credits={credits} onLogout={onLogout} />
          ) : (
            <button
              onClick={onLogin}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <i className="fab fa-google"></i>
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;