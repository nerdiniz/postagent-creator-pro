
import React, { useState } from 'react';
import { MOCK_VIDEOS } from '../constants';
import { VideoFile } from '../types';

const UploadDashboard: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>(MOCK_VIDEOS);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upload Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and schedule your bulk video uploads</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-sm">publish</span>
            Schedule All Uploads
          </button>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-[1400px] w-full mx-auto pb-20">
        {/* Dropzone */}
        <section>
          <div className="relative group cursor-pointer">
            <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#16212c] px-6 py-12 hover:border-primary/50 hover:bg-primary/[0.02] transition-all">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold leading-tight">Bulk Dropzone</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Drag and drop multiple videos or click to browse (MP4, MOV supported)</p>
              </div>
              <button className="mt-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all">
                Select Files
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Video Queue */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold">Video Queue <span className="text-slate-400 font-normal ml-2 text-sm">({videos.length} files)</span></h3>
              <button className="text-sm text-primary font-medium hover:underline">Clear all</button>
            </div>
            <div className="bg-white dark:bg-[#16212c] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Thumbnail</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">File Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {videos.map((video) => (
                    <tr key={video.id} className={`${video.status === 'Scheduled' ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-primary' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'} transition-colors`}>
                      <td className="px-4 py-4">
                        <div 
                          className="size-12 rounded-lg bg-slate-200 dark:bg-slate-700 bg-cover overflow-hidden relative group/thumb"
                          style={{ backgroundImage: `url('${video.thumbnailUrl}')` }}
                        >
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-sm">visibility</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`font-medium text-sm truncate max-w-xs ${video.status === 'Scheduled' ? 'text-primary' : ''}`}>
                          {video.name}
                        </div>
                        <div className={`text-[11px] mt-1 ${video.status === 'Scheduled' ? 'text-primary/70' : 'text-slate-500'}`}>
                          {video.resolution} • {video.size}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          video.status === 'Scheduled' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {video.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                            <span className={`material-symbols-outlined text-[20px] ${video.status === 'Scheduled' ? 'text-primary' : 'text-slate-500'}`}>edit</span>
                          </button>
                          <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                            <span className="material-symbols-outlined text-[20px] text-red-400">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Metadata Panel */}
          <div className="space-y-4">
            <div className="px-2">
              <h3 className="text-lg font-bold">Metadata Config</h3>
            </div>
            <div className="bg-white dark:bg-[#16212c] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Global Title</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-primary">APPLY TO ALL</span>
                    <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
                      <div className="size-3 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <input className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:ring-primary focus:border-primary transition-all" placeholder="e.g. {filename} - Watch Now!" type="text"/>
                <p className="text-[10px] text-slate-400">Tip: Use {"{filename}"} to keep original file name.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-400">APPLY TO ALL</span>
                    <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="size-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <textarea className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:ring-primary focus:border-primary transition-all" placeholder="Standard video description..." rows={4}></textarea>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hashtags</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-primary">APPLY TO ALL</span>
                    <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
                      <div className="size-3 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-700">
                    #vlog <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-red-400">close</span>
                  </span>
                  <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-700">
                    #shorts <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-red-400">close</span>
                  </span>
                  <input className="bg-transparent border-none p-0 text-xs w-20 focus:ring-0" placeholder="Add..." type="text"/>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bulk Schedule</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-400">STAGGERED</span>
                    <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="size-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase">Start Date</span>
                    <input className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm" type="date"/>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase">Interval</span>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm">
                      <option>1 hour</option>
                      <option>24 hours</option>
                      <option>1 week</option>
                    </select>
                  </div>
                </div>
              </div>
              <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20 mt-4">
                Update Selected Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDashboard;
