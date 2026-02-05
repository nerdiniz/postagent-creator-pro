
import React, { useState } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import UploadDashboard from './views/UploadDashboard';
import ShortsDashboard from './views/ShortsDashboard';
import ChannelsView from './views/ChannelsView';
import HistoryView from './views/HistoryView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('upload');

  const renderView = () => {
    switch (activeView) {
      case 'upload':
        return <UploadDashboard />;
      case 'shorts':
        return <ShortsDashboard />;
      case 'channels':
        return <ChannelsView />;
      case 'history':
        return <HistoryView />;
      default:
        return <UploadDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="ml-64 flex-1 flex flex-col min-w-0 min-h-screen">
        {renderView()}
      </main>

      {/* Floating Action Button for Mobile / Quick Upload */}
      <button className="fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default App;
