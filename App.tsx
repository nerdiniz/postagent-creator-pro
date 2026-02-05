
import React, { useState, useEffect } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import ManagementDashboard from './views/ManagementDashboard';
import ShortsDashboard from './views/ShortsDashboard';
import VideosDashboard from './views/VideosDashboard';
import ChannelsView from './views/ChannelsView';
import HistoryView from './views/HistoryView';
import AuthView from './views/AuthView';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { NotificationProvider } from './contexts/NotificationContext';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    // Update HTML class for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthView onSuccess={() => { }} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ManagementDashboard onViewChange={setActiveView} />;
      case 'shorts':
        return <ShortsDashboard onViewChange={setActiveView} />;
      case 'videos':
        return <VideosDashboard onViewChange={setActiveView} />;
      case 'channels':
        return <ChannelsView />;
      case 'history':
        return <HistoryView />;
      default:
        return <ManagementDashboard onViewChange={setActiveView} />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-white dark:bg-background-dark transition-colors duration-300">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onLogout={handleLogout}
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="ml-64 flex-1 flex flex-col min-w-0 min-h-screen">
          {renderView()}
        </main>

        {/* Floating Action Button for Mobile / Quick Upload */}
        <button className="fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-95 transition-all z-50">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </NotificationProvider>
  );
};

export default App;

