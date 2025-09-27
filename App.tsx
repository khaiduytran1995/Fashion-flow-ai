import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import ApparelSeparator from './features/ApparelSeparator';
import VirtualModel from './features/VirtualModel';
import DifferentPerspective from './features/DifferentPerspective';
import ProfessionalPosing from './features/ProfessionalPosing';
import MotionVideo from './features/MotionVideo';
import Storyboard from './features/Storyboard';

type ActiveTab = 'separator' | 'model' | 'perspective' | 'posing' | 'video' | 'storyboard';

// Mock user data for demonstration
const mockUser = {
  name: 'Fashionista',
  avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, // Placeholder avatar
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('video');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credits, setCredits] = useState(999999);
  const [user, setUser] = useState<{name: string, avatar: string} | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUser(mockUser);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const deductCredits = (amount: number) => {
    setCredits(prev => Math.max(0, prev - amount));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'separator':
        return <ApparelSeparator />;
      case 'model':
        return <VirtualModel />;
      case 'perspective':
        return <DifferentPerspective />;
      case 'posing':
        return <ProfessionalPosing />;
      case 'storyboard':
        return <Storyboard />;
      case 'video':
        return <MotionVideo 
                  isLoggedIn={isLoggedIn} 
                  credits={credits} 
                  deductCredits={deductCredits} 
                  onLoginRequest={handleLogin} 
               />;
      default:
        return <ApparelSeparator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        credits={credits}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="container mx-auto p-4 md:p-8">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>Được cung cấp bởi Gemini API & React</p>
      </footer>
    </div>
  );
};

export default App;