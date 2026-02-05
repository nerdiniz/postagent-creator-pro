import React from 'react';
import {
  Plus,
  Trash2,
  ExternalLink,
  Zap,
  Loader2,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { youtubeApi } from '../lib/youtube';
import { useNotification } from '../contexts/NotificationContext';

interface ChannelRecord {
  id: string;
  name: string;
  user_id: string;
  handle?: string;
  avatar_url?: string;
  status: 'Connected' | 'Disconnected';
  is_active: boolean;
  youtube_credentials?: any;
}

interface ChannelsViewProps {
  onChannelUpdate?: () => void;
}

const ChannelsView: React.FC<ChannelsViewProps> = ({ onChannelUpdate }) => {
  const { showNotification } = useNotification();
  const [channels, setChannels] = React.useState<ChannelRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('name');

      if (error) throw error;
      setChannels(data || []);
    } catch (err: any) {
      logger.error('channels_fetch_failed', err);
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchChannels();

    // Check for OAuth code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
      const pendingName = sessionStorage.getItem('pending_channel_name') || 'YouTube Channel';
      const tokens = await youtubeApi.exchangeCode(code);
      const details = tokens.channelDetails || {};

      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: details.title || pendingName,
          youtube_channel_id: details.id,
          handle: details.handle,
          avatar_url: details.avatarUrl,
          youtube_credentials: {
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expiry_date: Date.now() + (tokens.expires_in * 1000)
          },
          status: 'Connected',
          is_active: channels.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      logger.log('channel_oauth_success', { name: pendingName });
      setChannels(prev => [...prev, data]);
      sessionStorage.removeItem('pending_channel_name');
    } catch (err: any) {
      logger.error('channel_oauth_failed', err);
      showNotification('error', 'Connection Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBeginOAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    sessionStorage.setItem('pending_channel_name', name);
    window.location.href = youtubeApi.getAuthUrl();
  };

  const handleDeleteChannel = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;

    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logger.log('channel_deleted', { id, name });
      setChannels(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      logger.error('channel_delete_failed', err);
      showNotification('error', 'Delete Failed', err.message);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Deactivate others
      await supabase.from('channels').update({ is_active: false }).neq('id', id);
      // Activate this one
      const { error } = await supabase.from('channels').update({ is_active: true }).eq('id', id);

      if (error) throw error;
      setChannels(prev => prev.map(c => ({ ...c, is_active: c.id === id })));
    } catch (err) {
      console.error('Error toggling active channel:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark transition-colors duration-300 relative">
      <div className="max-w-[1200px] w-full mx-auto p-6 md:p-10 flex flex-col gap-10">
        <div className="flex flex-wrap justify-between items-center gap-6 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-border-dark">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">YouTube Channels</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium">Manage your connected accounts and select your destination.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span className="truncate">Add Channel</span>
          </button>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-card-dark/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest w-[45%]">Channel Details</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">Active Target</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {channels.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">No channels connected yet.</td>
                </tr>
              )}
              {channels.map((channel) => (
                <tr key={channel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {channel.avatar_url ? (
                        <div
                          className="size-12 rounded-xl bg-cover bg-center border border-slate-200 dark:border-slate-700 shadow-sm"
                          style={{ backgroundImage: `url('${channel.avatar_url}')` }}
                        ></div>
                      ) : (
                        <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Zap size={20} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-bold">{channel.name}</span>
                        <span className="text-slate-500 text-xs font-medium">{channel.handle || '@channel'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${channel.status === 'Connected'
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                        <span className={`size-1.5 rounded-full ${channel.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        {channel.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div
                        onClick={() => toggleActive(channel.id, channel.is_active)}
                        className={`size-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${channel.is_active
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                          : 'border-slate-300 dark:border-slate-700 hover:border-primary/50'
                          }`}>
                        {channel.is_active && <div className="size-2.5 bg-white rounded-full"></div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteChannel(channel.id, channel.name)}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-end gap-2 ml-auto"
                    >
                      <Trash2 size={16} />
                      Disconnect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col scale-in-center">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-xl">
                  <Plus size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connect YouTube Channel</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBeginOAuth}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Channel Display Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Bible in Shorts"
                    className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4 text-center">
                  <div className="size-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <img src="https://www.google.com/favicon.ico" className="size-6" alt="Google" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">YouTube Authorization</p>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                      You will be redirected to Google to authorize PostAgent to upload videos to your channel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ExternalLink size={18} />
                  Authorize with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsView;
