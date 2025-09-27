import React from 'react';

interface UserMenuProps {
  user: { name: string; avatar: string };
  credits: number;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, credits, onLogout }) => {
  return (
    <div className="flex items-center gap-3">
        <div className="text-right">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 hidden sm:block">{user.name}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                <i className="fas fa-coins mr-1"></i>
                {credits} Flow Credits
            </p>
        </div>
        <div className="relative group">
            <img src={user.avatar} alt="User Avatar" className="w-11 h-11 rounded-full cursor-pointer border-2 border-purple-500" />
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-10">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Số dư: {credits} credits</p>
                </div>
                <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <i className="fas fa-sign-out-alt mr-2 w-4 text-center"></i>
                    Đăng xuất
                </button>
            </div>
        </div>
    </div>
  );
};

export default UserMenu;
