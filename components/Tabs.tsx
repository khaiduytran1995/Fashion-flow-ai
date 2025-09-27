import React from 'react';

type ActiveTab = 'separator' | 'model' | 'perspective' | 'posing' | 'video' | 'storyboard';

interface TabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const tabsConfig = [
  { id: 'separator' as ActiveTab, label: 'Bóc tách Trang phục', icon: 'fas fa-cut' },
  { id: 'model' as ActiveTab, label: 'Người mẫu AI', icon: 'fas fa-user-tie' },
  { id: 'perspective' as ActiveTab, label: 'Góc nhìn khác', icon: 'fas fa-camera-rotate' },
  { id: 'posing' as ActiveTab, label: 'Tạo dáng Chuyên nghiệp', icon: 'fas fa-street-view' },
  { id: 'storyboard' as ActiveTab, label: 'Storyboard', icon: 'fas fa-clipboard-list' },
  { id: 'video' as ActiveTab, label: 'Video Chuyển động', icon: 'fas fa-film' },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
      <nav className="flex flex-wrap justify-center space-x-2 sm:space-x-4" aria-label="Tabs">
        {tabsConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center px-3 py-3 sm:px-4 text-sm sm:text-base font-medium rounded-t-lg
              transition-colors duration-200 ease-in-out focus:outline-none
              ${
                activeTab === tab.id
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }
            `}
          >
            <i className={`${tab.icon} mr-2`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;