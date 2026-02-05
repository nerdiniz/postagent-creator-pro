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
  activeChannel: Channel | null;
  setActiveChannel: (channel: Channel) => void;
  channels: Channel[];
}

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ onViewChange, activeChannel, setActiveChannel, channels }) => {
  // const [channels, setChannels] = useState<Channel[]>([]); // Removed: Using props
  // const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null); // Removed: Using props
  const [postedShortsCount, setPostedShortsCount] = useState<number>(0);
  const [loading, setLoading] = useState(false); // Changed to false initially as data comes from props
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Removed fetchChannels() as we rely on App.tsx to pass channels


  const { showNotification } = useNotification();

  useEffect(() => {
    if (activeChannel) {
      if (!activeChannel.statistics || Object.keys(activeChannel.statistics).length === 0) {
        handleRefreshStats();
      }
      fetchPostedShortsCount();
    }
  }, [activeChannel?.id]);

  const fetchPostedShortsCount = async () => {
    if (!activeChannel) return;
    try {
      const { count, error } = await supabase
        .from('shorts')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', activeChannel.id)
        .eq('status', 'scheduled');

      const { count: postedCount } = await supabase
        .from('shorts')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', activeChannel.id)
        .eq('status', 'posted');

      setPostedShortsCount((count || 0) + (postedCount || 0));
    } catch (err) {
      console.error('Error counting shorts:', err);
    }
  };

  const handleRefreshStats = async () => {
    if (!activeChannel) return;
    try {
      setIsRefreshing(true);
      const result = await youtubeApi.getChannelStats(activeChannel.id);

      if (result.success) {
        // Optimistically update the active channel in the parent if needed, 
        // but typically stats should be updated in the DB and then synced.
        // For now, we'll just notify success. Integrating strict sync might require App.tsx update.

        // Use the passed setter to update global state with new stats
        const updatedChannel = {
          ...activeChannel,
          statistics: result.statistics
        };
        setActiveChannel(updatedChannel);

        showNotification('success', 'Stats Updated', 'Statistics refreshed successfully');
      } else {
        throw new Error(result.error || 'Failed to refresh statistics');
      }
    } catch (error: any) {
      logger.error('stats_refresh_failed', error);
      showNotification('error', 'Update Failed', error.message || 'Failed to refresh stats');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatNumber = (num: string | number | undefined) => {
    if (!num) return '0';
    const val = typeof num === 'string' ? parseInt(num) : num;
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val);
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
              {activeChannel ? (
                <>
                  <img src={activeChannel.avatarUrl || ''} alt={activeChannel.name} className="size-6 rounded-full object-cover border border-slate-100" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{activeChannel.name}</span>
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
                      setActiveChannel(channel);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <img src={channel.avatarUrl || ''} alt={channel.name} className="size-8 rounded-full object-cover border border-slate-100" />
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
        {!activeChannel ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Subscribers */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Subscribers</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {formatNumber(activeChannel.statistics?.subscriberCount)}
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
                      {formatNumber(activeChannel.statistics?.viewCount)}
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

              {/* PostAgent Shorts */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group border-l-4 border-l-primary">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-primary uppercase tracking-widest">Shorts Posted</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {formatNumber(postedShortsCount)}
                    </h3>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Posted via PostAgent</span>
                </div>
              </div>

              {/* Total Videos */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Videos</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {formatNumber(activeChannel.statistics?.videoCount)}
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
