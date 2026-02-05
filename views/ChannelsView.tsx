
import React from 'react';
import { MOCK_CHANNELS } from '../constants';

const ChannelsView: React.FC = () => {
  return (
    <div className="flex-1 flex justify-center py-8">
      <div className="layout-content-container flex flex-col w-full max-w-[1024px] px-6">
        <div className="flex flex-wrap justify-between items-end gap-3 pb-8">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">YouTube Channels</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Manage your connected accounts and select your default upload destination.</p>
          </div>
          <button className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">add</span>
            <span className="truncate">Add Channel</span>
          </button>
        </div>

        <div className="bg-white dark:bg-[#192633] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#202f3d] border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider w-[45%]">Channel Details</th>
                <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider text-center">Active Target</th>
                <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_CHANNELS.map((channel) => (
                <tr key={channel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700"
                        style={{ backgroundImage: `url('${channel.avatarUrl}')` }}
                      ></div>
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-semibold">{channel.name}</span>
                        <span className="text-slate-400 text-xs font-normal">{channel.handle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <span className="size-1.5 rounded-full bg-emerald-500"></span>
                      {channel.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="radio" 
                      name="active_channel" 
                      checked={channel.isActive}
                      readOnly
                      className="h-5 w-5 rounded-full border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-background-dark bg-transparent cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-bold text-sm transition-colors">
                      Disconnect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 pb-2">
          <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-tight">API Settings & Usage</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor your daily quota and integration health.</p>
        </div>

        <div className="flex flex-wrap gap-4 py-4">
          <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">API Quota Used</p>
              <span className="material-symbols-outlined text-primary text-xl">analytics</span>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">4,200</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
              <p className="text-emerald-500 text-xs font-bold">+12% from yesterday</p>
            </div>
          </div>
          <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Remaining Quota</p>
              <span className="material-symbols-outlined text-orange-500 text-xl">speed</span>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">5,800</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-orange-500 text-sm">trending_down</span>
              <p className="text-orange-500 text-xs font-bold">-8% from limit</p>
            </div>
          </div>
          <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Daily Limit</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">10,000</p>
            <p className="text-slate-400 text-xs font-medium italic">Resets in 14 hours</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
            <span className="material-symbols-outlined text-lg">key</span>
            Manage API Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelsView;
