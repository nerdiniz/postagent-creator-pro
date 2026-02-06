import React, { useState, useCallback, useEffect } from 'react';
import {
    CloudUpload,
    Trash2,
    Send,
    Plus,
    LayoutGrid,
    List,
    FileVideo,
    AlertCircle,
    Settings2,
    CheckCircle2,
    Loader2,
    CalendarDays,
    Clock4,
    Tag,
    AlignLeft,
    Type
} from 'lucide-react';
import { VideoFile, Channel } from '../types';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { youtubeApi } from '../lib/youtube';
import { useNotification } from '../contexts/NotificationContext';

interface LocalVideoFile extends VideoFile {
    file?: File;
    scheduledDate?: string;
    ytVideoId?: string;
    description: string;
    tags: string;
}

interface VideosDashboardProps {
    onViewChange: (view: any) => void;
    activeChannel: Channel | null;
}

const VideosDashboard: React.FC<VideosDashboardProps> = ({ onViewChange, activeChannel }) => {
    const { showNotification } = useNotification();
    const [videos, setVideos] = useState<LocalVideoFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list for better editing
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    const activeChannelId = activeChannel?.id || null;
    const activeChannelName = activeChannel?.name || null;
    const [batchStartDate, setBatchStartDate] = useState<string>(new Date().toISOString().slice(0, 16));

    const [schedulingMode, setSchedulingMode] = useState<'individual' | 'interval'>('interval');
    const [intervalHours, setIntervalHours] = useState<3 | 6 | 12 | 24>(24); // Default 24h for long videos

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;

        const newVideos: LocalVideoFile[] = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            resolution: '16:9 (Landscape)',
            status: 'Ready',
            thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=300&h=169&auto=format&fit=crop', // Landscape placeholder
            duration: '00:00', // We can't easily get duration without processing
            progress: 0,
            scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            description: '',
            tags: ''
        }));

        logger.log('videos_file_upload', { count: newVideos.length, filenames: newVideos.map(v => v.name) });
        setVideos((prev) => [...prev, ...newVideos]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const clearQueue = () => {
        if (confirm('Are you sure you want to clear the entire queue?')) {
            setVideos([]);
        }
    };

    const removeVideo = (id: string) => {
        setVideos(prev => prev.filter(v => v.id !== id));
    };

    const updateVideo = (id: string, field: keyof LocalVideoFile, value: string) => {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handlePublishAll = async () => {
        if (videos.length === 0) return;
        if (!activeChannelId) {
            alert('Please connect and select an active YouTube channel first.');
            return;
        }

        setIsPublishing(true);
        setPublishError(null);
        logger.log('videos_publish_start', { queueSize: videos.length, channelId: activeChannelId });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // 1. First, create the records in the "videos" table
            const records = videos.map((v, index) => {
                let scheduledDate: string;

                if (schedulingMode === 'interval') {
                    const baseDate = batchStartDate ? new Date(batchStartDate).getTime() : Date.now();
                    const delayInMs = (index) * intervalHours * 60 * 60 * 1000;
                    scheduledDate = new Date(baseDate + delayInMs).toISOString();
                } else {
                    scheduledDate = v.scheduledDate ? new Date(v.scheduledDate).toISOString() : new Date().toISOString();
                }

                return {
                    title: v.name,
                    description: v.description,
                    tags: v.tags.split(',').map(t => t.trim()).filter(Boolean),
                    status: 'pending',
                    scheduled_date: scheduledDate,
                    file_size: v.size,
                    duration: v.duration,
                    thumbnail_url: v.thumbnailUrl,
                    user_id: user.id,
                    channel_id: activeChannelId
                };
            });

            const { data: insertedRecords, error: insertError } = await supabase
                .from('videos')
                .insert(records)
                .select();

            if (insertError) throw insertError;

            // 2. Upload each video to YouTube via Edge Function
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i];
                const record = insertedRecords[i];

                setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'Publishing' } : v));

                try {
                    const result = await youtubeApi.uploadShort({
                        title: video.name,
                        description: video.description,
                        tags: video.tags.split(','),
                        privacyStatus: 'private',
                        videoFile: video.file!,
                        channelId: activeChannelId,
                        scheduledAt: record.scheduled_date,
                        type: 'video', // Important: distinguish from shorts
                        recordId: record.id
                    });

                    if (result && result.success) {
                        // Already updated in youtube.ts, but let's update local UI
                        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'Success', ytVideoId: result.data.id } : v));
                    }
                } catch (uploadErr: any) {
                    console.error(`Failed to upload ${video.name}:`, uploadErr);
                    await supabase
                        .from('videos')
                        .update({ status: 'error' })
                        .eq('id', record.id);

                    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'Error' } : v));
                }
            }

            logger.log('videos_publish_batch_complete', { count: videos.length });
            showNotification('success', 'Batch processing complete', 'Check History view for status.');
            setVideos([]);
        } catch (err: any) {
            logger.error('videos_publish_failed', err);
            console.error('Error publishing videos:', err);
            setPublishError(err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-background-dark transition-colors duration-300">
            <div className="max-w-[1400px] w-full mx-auto p-6 md:p-10 flex flex-col gap-8">

                {/* Page Heading */}
                <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-border-dark">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Videos Manager</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Bulk publish long-form content to YouTube.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={clearQueue}
                            disabled={isPublishing}
                            className="flex items-center gap-2 rounded-xl h-11 px-5 border border-slate-200 dark:border-border-dark bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold transition-all hover:bg-slate-50 dark:hover:bg-surface-dark disabled:opacity-50"
                        >
                            <Trash2 size={18} />
                            Clear Queue
                        </button>
                        <button
                            onClick={handlePublishAll}
                            disabled={isPublishing || videos.length === 0}
                            className="flex items-center gap-2 rounded-xl h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 min-w-[140px] justify-center"
                        >
                            {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {isPublishing ? 'Publishing...' : `Publish All ${videos.length > 0 ? `(${videos.length})` : ''}`}
                        </button>
                    </div>
                </div>

                {publishError && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
                        <AlertCircle size={18} />
                        {publishError}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Main Area (Queue) */}
                    <div className="xl:col-span-2 flex flex-col gap-6">

                        {/* Upload Zone */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className={`flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer group p-12 ${isDragging
                                ? 'border-primary bg-primary/5 scale-[0.99]'
                                : 'border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark/50 hover:border-primary/50'
                                }`}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />
                            <div className="bg-primary/10 text-primary p-5 rounded-2xl group-hover:scale-110 transition-transform">
                                <CloudUpload size={32} />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-slate-900 dark:text-white text-xl font-bold">Drag & Drop Long Videos</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium text-center max-w-sm leading-relaxed">
                                    Drop your horizontal MP4/MOV files here (16:9). Individual editing is available below.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-xl shadow-slate-900/10 transition-all hover:translate-y-[-2px]">
                                <Plus size={18} />
                                Select Video Files
                            </div>
                        </div>

                        {/* Queue Management */}
                        {videos.length > 0 && (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight flex items-center gap-2">
                                        Active Queue
                                        <span className="bg-slate-200 dark:bg-border-dark px-2 py-0.5 rounded-lg text-xs">{videos.length} videos</span>
                                    </h2>
                                    <div className="flex bg-white dark:bg-card-dark rounded-xl p-1 border border-slate-200 dark:border-border-dark">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                            title="Grid View"
                                        >
                                            <LayoutGrid size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                            title="Detail/Edit View"
                                        >
                                            <List size={18} />
                                        </button>
                                    </div>
                                </div>

                                {viewMode === 'list' ? (
                                    <div className="space-y-4">
                                        {videos.map((video) => (
                                            <div key={video.id} className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark flex gap-6 items-start group hover:border-primary/20 transition-all">
                                                {/* Thumbnail & Basics */}
                                                <div className="w-48 shrink-0 flex flex-col gap-2">
                                                    <div className="aspect-video w-full bg-slate-100 dark:bg-surface-dark rounded-lg overflow-hidden border border-slate-100 dark:border-border-dark relative">
                                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${video.thumbnailUrl}')` }}></div>
                                                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-bold">{video.duration}</div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                                        <span>{video.size}</span>
                                                        <span className={`uppercase font-bold ${video.status === 'Ready' ? 'text-primary' :
                                                            video.status === 'Publishing' ? 'text-amber-500' :
                                                                video.status === 'Success' ? 'text-emerald-500' : 'text-rose-500'
                                                            }`}>{video.status}</span>
                                                    </div>
                                                </div>

                                                {/* Editable Fields */}
                                                <div className="flex-1 min-w-0 grid grid-cols-1 gap-4">
                                                    {/* Title */}
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
                                                            <Type size={12} /> Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={video.name}
                                                            onChange={(e) => updateVideo(video.id, 'name', e.target.value)}
                                                            placeholder="Video Title"
                                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                                        />
                                                    </div>

                                                    {/* Description */}
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
                                                            <AlignLeft size={12} /> Description
                                                        </label>
                                                        <textarea
                                                            value={video.description}
                                                            onChange={(e) => updateVideo(video.id, 'description', e.target.value)}
                                                            placeholder="Describe your video..."
                                                            rows={2}
                                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none resize-none"
                                                        />
                                                    </div>

                                                    <div className="flex gap-4">
                                                        {/* Tags */}
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
                                                                <Tag size={12} /> Tags (comma separated)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={video.tags}
                                                                onChange={(e) => updateVideo(video.id, 'tags', e.target.value)}
                                                                placeholder="gaming, tutorial, react..."
                                                                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none"
                                                            />
                                                        </div>

                                                        {/* Individual Scheduler */}
                                                        {schedulingMode === 'individual' && (
                                                            <div className="w-1/3 space-y-1">
                                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
                                                                    <CalendarDays size={12} /> Schedule
                                                                </label>
                                                                <input
                                                                    type="datetime-local"
                                                                    value={video.scheduledDate}
                                                                    onChange={(e) => updateVideo(video.id, 'scheduledDate', e.target.value)}
                                                                    className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <div className="flex flex-col items-end justify-between self-stretch py-2">
                                                    <button onClick={() => removeVideo(video.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Grid View (Compact)
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {videos.map((video) => (
                                            <div key={video.id} className="bg-white dark:bg-card-dark rounded-2xl p-3 border border-slate-200 dark:border-border-dark flex flex-col gap-3 group transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20">
                                                <div className="relative aspect-video w-full bg-slate-100 dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-100 dark:border-border-dark">
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center"
                                                        style={{ backgroundImage: `url('${video.thumbnailUrl}')` }}
                                                    ></div>

                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => removeVideo(video.id)}
                                                            className="size-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>

                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${video.status === 'Ready' ? 'bg-black/50 text-white' : 'bg-amber-500 text-white'}`}>{video.status}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-0.5 px-1">
                                                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white" title={video.name}>{video.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{video.tags || 'No tags'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {videos.length === 0 && !isDragging && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                                <FileVideo size={64} strokeWidth={1} className="opacity-20" />
                                <p className="text-sm font-medium">Your queue is empty. Upload some long videos.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area (Settings) */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                                    <Settings2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Publish Settings</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Videos Config Code</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                        <FileVideo size={16} />
                                        Target Channel
                                    </label>
                                    {activeChannelName ? (
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{activeChannelName}</span>
                                                <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Verified & Active</span>
                                            </div>
                                            <button
                                                onClick={() => onViewChange('channels')}
                                                className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 hover:underline"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl">
                                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mb-1">
                                                No active channel selected.
                                            </p>
                                            <button
                                                onClick={() => onViewChange('channels')}
                                                className="w-full py-2 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm"
                                            >
                                                Connect Channel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <CalendarDays size={16} /> Scheduling Mode
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setSchedulingMode('interval')}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${schedulingMode === 'interval'
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                    : 'bg-slate-50 dark:bg-surface-dark border-slate-200 dark:border-slate-800 text-slate-500'
                                                    }`}
                                            >
                                                Interval
                                            </button>
                                            <button
                                                onClick={() => setSchedulingMode('individual')}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${schedulingMode === 'individual'
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                    : 'bg-slate-50 dark:bg-surface-dark border-slate-200 dark:border-slate-800 text-slate-500'
                                                    }`}
                                            >
                                                Individual
                                            </button>
                                        </div>
                                    </div>

                                    {schedulingMode === 'interval' && (
                                        <div className="flex flex-col gap-3 pt-2">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Clock4 size={16} /> Interval Hours
                                            </p>
                                            <div className="grid grid-cols-4 gap-1.5">
                                                {[3, 6, 12, 24].map((h) => (
                                                    <button
                                                        key={h}
                                                        onClick={() => setIntervalHours(h as any)}
                                                        className={`py-2 rounded-lg text-[10px] font-black tracking-widest transition-all border ${intervalHours === h
                                                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                            : 'bg-slate-50 dark:bg-surface-dark border-slate-200 dark:border-slate-800 text-slate-500'
                                                            }`}
                                                    >
                                                        {h}h
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium italic">
                                                Videos spread by {intervalHours}h each, starting from the chose date.
                                            </p>
                                        </div>
                                    )}

                                    {schedulingMode === 'interval' && (
                                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <CalendarDays size={16} /> Batch Start Date
                                            </p>
                                            <input
                                                type="datetime-local"
                                                value={batchStartDate}
                                                onChange={(e) => setBatchStartDate(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                            <p className="text-[10px] text-slate-500 font-medium italic">
                                                The first video in the queue will be scheduled for this time.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideosDashboard;
