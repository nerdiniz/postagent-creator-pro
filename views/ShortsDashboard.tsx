
import React from 'react';
import { MOCK_SHORTS } from '../constants';

const ShortsDashboard: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b1218]">
      <div className="max-w-[1200px] w-full mx-auto p-6 md:p-10 flex flex-col gap-10">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Shorts Batch Management</p>
            <p className="text-slate-500 dark:text-[#92adc9] text-base font-normal">Process multiple vertical videos. Optimal for 9:16 mobile-first content.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-slate-200 dark:bg-[#233648] text-slate-900 dark:text-white text-sm font-bold transition-all hover:bg-slate-300 dark:hover:bg-slate-700">
              Clear Queue
            </button>
            <button className="flex min-w-[120px] items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:translate-y-[-1px] transition-all">
              Publish All ({MOCK_SHORTS.length})
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-[#324d67] bg-white dark:bg-background-dark/50 px-6 py-12 transition-colors hover:border-primary/50 cursor-pointer group">
          <div className="bg-primary/10 text-primary p-4 rounded-full group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-4xl">cloud_upload</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-900 dark:text-white text-xl font-bold text-center">Batch Upload Shorts</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal text-center max-w-md">
              Drag and drop vertical (9:16) MP4 or MOV files here. Maximum 50 files per batch.
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            Select Files
          </button>
        </div>

        {/* Section Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Active Queue ({MOCK_SHORTS.length} videos)</h2>
            <div className="flex gap-2">
              <button className="p-2 text-primary">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {MOCK_SHORTS.map((short) => (
              <div key={short.id} className="flex flex-col gap-3 group">
                <div className={`relative aspect-shorts w-full bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border-2 transition-all ${short.status === 'Ready' ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary'}`}>
                  <div 
                    className={`absolute inset-0 bg-cover bg-center ${short.status === 'Pending' ? 'opacity-80' : ''}`}
                    style={{ backgroundImage: `url('${short.thumbnailUrl}')` }}
                  ></div>
                  
                  {short.status === 'Uploading' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-8 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        <span className="text-white text-[10px] font-bold uppercase">Uploading {short.progress}%</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex w-full justify-around bg-black/40 backdrop-blur-md py-2 rounded-lg text-white">
                      <span className="material-symbols-outlined cursor-pointer hover:text-primary">edit</span>
                      <span className="material-symbols-outlined cursor-pointer hover:text-primary">visibility</span>
                      <span className="material-symbols-outlined cursor-pointer hover:text-red-500">delete</span>
                    </div>
                  </div>

                  {short.status !== 'Uploading' && (
                    <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold text-white rounded uppercase ${
                      short.status === 'Ready' ? 'bg-primary' : 'bg-slate-500'
                    }`}>
                      {short.status}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-700">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${short.progress || 0}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold truncate dark:text-white">{short.name}</p>
                  <p className="text-xs text-slate-500">{short.duration} • {short.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsDashboard;
