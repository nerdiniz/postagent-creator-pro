import React, { useEffect, useState } from 'react';
import {
  Download,
  Search,
  ChevronDown,
  Video,
  Zap,
  RefreshCw,
  ExternalLink,
  Calendar,
  MoreVertical,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Loader2,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { youtubeApi } from '../lib/youtube';

interface ShortRecord {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'posted' | 'removed' | 'error' | 'pending';
  upload_date: string;
  scheduled_date: string | null;
  thumbnail_url: string | null;
  file_size: string | null;
  duration: string | null;
  created_at: string;
  yt_video_id?: string;
  channel_id?: string;
}

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<ShortRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // CRUD state
  const [editingItem, setEditingItem] = useState<ShortRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} videos? This action cannot be undone.`)) return;

    // Create a temporary deleting state for UI feedback
    // We reuse isDeleting but cast it to any to bypass string type constraint if needed, 
    // or better, we create a isBulkDeleting state. 
    // For simplicity, let's just use generic loading or iterate.
    const videosToDelete = history.filter(h => selectedIds.includes(h.id));

    for (const video of videosToDelete) {
      setIsDeleting(video.id); // Show spinner on current item
      try {
        if (video.yt_video_id && video.channel_id) {
          try {
            await youtubeApi.deleteVideo(video.yt_video_id, video.channel_id);
          } catch (e) {
            console.error(`Failed to delete YT video ${video.id}`, e);
          }
        }
        await supabase.from('shorts').delete().eq('id', video.id);
      } catch (e) {
        console.error(`Failed to delete video ${video.id}`, e);
      }
    }
    setIsDeleting(null);
    setSelectedIds([]);
    fetchHistory(); // Refresh list
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('shorts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpdate = async (id: string, updates: Partial<ShortRecord>) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('shorts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      logger.log('shorts_record_updated', { id, updates });
      setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      setEditingItem(null);
    } catch (err: any) {
      logger.error('shorts_update_failed', err);
      alert('Failed to update record: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (record: ShortRecord) => {
    if (!confirm('Are you sure you want to delete this video? It will be removed from YouTube if synced.')) return;

    setIsDeleting(record.id);
    try {
      // 1. Delete from YouTube if we have the ID and Channel
      if (record.yt_video_id && record.channel_id) {
        try {
          await youtubeApi.deleteVideo(record.yt_video_id, record.channel_id);
          logger.log('youtube_video_deleted', { ytId: record.yt_video_id });
        } catch (ytError: any) {
          console.error('YouTube deletion failed:', ytError);
          alert('Warning: Could not delete from YouTube: ' + ytError.message + '. Deleting from database only.');
        }
      }

      // 2. Delete from Supabase
      const { error } = await supabase
        .from('shorts')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      logger.log('shorts_record_deleted', { id: record.id });
      setHistory(prev => prev.filter(item => item.id !== record.id));
    } catch (err: any) {
      logger.error('shorts_delete_failed', err);
      alert('Failed to delete record: ' + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'scheduled': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'removed': return 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400';
      case 'error': return 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400';
      default: return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-emerald-500';
      case 'scheduled': return 'bg-amber-500';
      case 'removed': return 'bg-slate-500';
      case 'error': return 'bg-rose-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark transition-colors duration-300">
      <div className="px-8 pt-8 pb-4 max-w-[1400px] w-full mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-6 mb-8 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-border-dark">
          <div className="flex flex-col gap-1">
            <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Upload History</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Track and manage your automated YouTube video schedules.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Download size={18} />
              Export History
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="relative block group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <Search size={18} />
              </span>
              <input
                className="block w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl py-3 pl-12 pr-4 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-900 dark:text-white transition-all shadow-sm"
                placeholder="Search by video name..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
            <button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              <Filter size={14} /> All Statuses <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 flex-1 max-w-[1400px] w-full mx-auto">
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-card-dark/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          )}

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="absolute top-0 left-0 right-0 z-20 bg-primary text-white px-6 py-2 flex items-center justify-between animate-in slide-in-from-top-2">
              <div className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                {selectedIds.length} video{selectedIds.length > 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={!!isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-white text-primary hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-border-dark">
                  <th className="px-6 py-4 w-[50px]">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={filteredHistory.length > 0 && selectedIds.length === filteredHistory.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredHistory.map(i => i.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Video Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Scheduled For</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!loading && filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Zap size={48} strokeWidth={1} className="opacity-20" />
                        <p className="text-sm font-medium">No upload history found.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredHistory.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group ${selectedIds.includes(item.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, item.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== item.id));
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-14 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-200 dark:border-slate-600">
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                              <Zap size={18} />
                            </div>
                          )}
                          {item.duration && (
                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-bold">{item.duration}</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[300px]">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
                            Uploaded {new Date(item.upload_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.scheduled_date ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {new Date(item.scheduled_date).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {new Date(item.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`}></div>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={!!isDeleting && isDeleting === item.id}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          {isDeleting === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                        <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-8 mb-8 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-bold">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <footer className="px-8 py-6 text-center border-t border-slate-200 dark:border-slate-800 transition-colors">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">PostAgent • Professional Content Scaling • Open Source Productivity</p>
      </footer>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col scale-in-center">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-xl">
                  <Edit2 size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Scheduled Short</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Video Title</label>
                <input
                  type="text"
                  defaultValue={editingItem.title}
                  id="edit-title"
                  className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</label>
                <textarea
                  defaultValue={editingItem.description}
                  id="edit-description"
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  defaultValue={editingItem.scheduled_date ? new Date(editingItem.scheduled_date).toISOString().slice(0, 16) : ''}
                  id="edit-date"
                  className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={() => {
                  const title = (document.getElementById('edit-title') as HTMLInputElement).value;
                  const description = (document.getElementById('edit-description') as HTMLTextAreaElement).value;
                  const scheduled_date = (document.getElementById('edit-date') as HTMLInputElement).value;
                  handleUpdate(editingItem.id, {
                    title,
                    description,
                    scheduled_date: scheduled_date ? new Date(scheduled_date).toISOString() : null
                  });
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
