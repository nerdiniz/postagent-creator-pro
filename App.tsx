import React, { useState, useEffect } from 'react';
import { View, Channel } from './types';
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
import { logger } from './lib/logger';

import { Menu, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      if (!session) {
        setChannels([]);
        setActiveChannel(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Global Channel Fetching
  useEffect(() => {
    if (user) {
      fetchChannels();
    }
  }, [user?.id]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        const mappedChannels: Channel[] = data.map(c => ({
          ...c,
          avatarUrl: c.avatar_url,
          isActive: c.is_active
        }));
        setChannels(mappedChannels);

        // Only set active if not already set or if previous active is gone
        // Always prioritize the one marked as isActive from DB
        const dbActive = mappedChannels.find(c => c.isActive);

        if (dbActive) {
          setActiveChannel(dbActive);
        } else {
          // Fallback: connected first, then any
          const connected = mappedChannels.find(c => c.status === 'Connected');
          setActiveChannel(connected || mappedChannels[0]);
        }
      }
    } catch (err) {
      logger.error('Error fetching global channels:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ManagementDashboard
            onViewChange={setActiveView}
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
            channels={channels}
          />
        );
      case 'shorts':
        return (
          <ShortsDashboard
            onViewChange={setActiveView}
            activeChannel={activeChannel}
          />
        );
      case 'videos':
        return (
          <VideosDashboard
            onViewChange={setActiveView}
            activeChannel={activeChannel}
          />
        );
      case 'channels':
        return <ChannelsView onChannelUpdate={fetchChannels} />;
      case 'history':
        return (
          <HistoryView
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
            channels={channels}
          />
        );
      default:
        return (
          <ManagementDashboard
            onViewChange={setActiveView}
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
            channels={channels}
          />
        );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <NotificationProvider>
      {!user ? (
        <AuthView onSuccess={() => { }} />
      ) : (
        <div className="flex min-h-screen bg-white dark:bg-background-dark transition-colors duration-300">
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            onLogout={handleLogout}
            user={user}
            theme={theme}
            onToggleTheme={toggleTheme}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
          />

          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-4 z-20">
            <div className="flex items-center gap-3">
              <div className="bg-primary size-8 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                <Zap size={18} fill="white" />
              </div>
              <h1 className="text-base font-bold leading-none tracking-tight text-slate-900 dark:text-white">PostAgent</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          <main className={`${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} ml-0 flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out pt-16 lg:pt-0`}>
            {renderView()}
          </main>

          {/* Floating Action Button for Mobile / Quick Upload */}
          <button className="fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-95 transition-all z-50">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
      )}
    </NotificationProvider>
  );
};

export default App;

