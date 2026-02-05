import React, { useEffect, useState } from 'react';
import {
  Users,
  Video,
  MessageCircle,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Channel } from '../types';
import { youtubeApi } from '../lib/youtube';
import { logger } from '../lib/logger';
import { useNotification } from '../contexts/NotificationContext';

interface ManagementDashboardProps {
  onViewChange: (view: any) => void;
}

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ onViewChange }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setChannels(data);
        // Default to first connected channel
        const connected = data.find(c => c.status === 'Connected');
        setSelectedChannel(connected || data[0]);
      }
    } catch (error) {
      logger.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const { showNotification } = useNotification();

  useEffect(() => {
    if (selectedChannel && (!selectedChannel.statistics || Object.keys(selectedChannel.statistics).length === 0)) {
      handleRefreshStats();
    }
  }, [selectedChannel?.id]); // Only trigger when ID changes to avoid loops

  const handleRefreshStats = async () => {
    if (!selectedChannel) return;
    try {
      setIsRefreshing(true);
      const result = await youtubeApi.getChannelStats(selectedChannel.id);

      if (result.success) {
        // Update local state
        const updatedChannel = {
          ...selectedChannel,
          statistics: result.statistics
        };
        setSelectedChannel(updatedChannel);
        setChannels(prev => prev.map(c => c.id === updatedChannel.id ? updatedChannel : c));
        showNotification('success', 'Stats Updated', 'Statistics refreshed successfully');
      } else {
        throw new Error(result.error || 'Failed to refresh statistics');
      }
    } catch (error: any) {
      logger.error('stats_refresh_failed', error);

      // Try to extract the actual message from the Edge Function response if available
      let errorMessage = 'Edge Function returned a non-2xx status code';

      if (error.context?.error?.message) {
        errorMessage = error.context.error.message;
      } else if (error.message && error.message !== 'Edge Function returned a non-2xx status code') {
        errorMessage = error.message;
      }

      showNotification('error', 'Update Failed', errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatNumber = (num: string | undefined) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(parseInt(num));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-background-dark transition-colors duration-300">
      {/* Header */}
      <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Channel performance & analytics</p>
        </div>

        {/* Channel Selector */}
        {channels.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors pointer-events-auto"
            >
              {selectedChannel ? (
                <>
                  <img src={selectedChannel.avatarUrl || ''} alt={selectedChannel.name} className="size-6 rounded-full object-cover" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedChannel.name}</span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-500">Select Channel</span>
              )}
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <img src={channel.avatarUrl || ''} alt={channel.name} className="size-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{channel.name}</p>
                      <p className="text-xs text-slate-500 truncate">{channel.handle}</p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 p-2">
                  <button
                    onClick={() => onViewChange('channels')}
                    className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    Manage Channels
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
        {!selectedChannel ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 dark:bg-slate-800 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Channel Selected</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Please connect a YouTube channel to verify your stats.</p>
            <button onClick={() => onViewChange('channels')} className="mt-6 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm">
              Connect Channel
            </button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subscribers */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Subscribers</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {formatNumber(selectedChannel.statistics?.subscriberCount)}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                    <Users size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Total channel subscribers</span>
                </div>
              </div>

              {/* Total Views */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Views</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {formatNumber(selectedChannel.statistics?.viewCount)}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Lifetime video views</span>
                </div>
              </div>

              {/* Total Videos */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Videos</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {formatNumber(selectedChannel.statistics?.videoCount)}
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                    <Video size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Uploaded Public Videos</span>
                </div>
              </div>
            </div>

            {/* Actions & Refresh */}
            <div className="flex justify-end">
              <button
                onClick={handleRefreshStats}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing data...' : 'Refresh Statistics'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagementDashboard;
