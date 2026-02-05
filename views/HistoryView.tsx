
import React from 'react';
import { MOCK_HISTORY } from '../constants';

const HistoryView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark">
      <div className="px-8 pt-8 pb-4">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Upload History</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base">Track and manage your automated YouTube video schedules.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined text-lg">file_download</span>
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="relative block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input className="block w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm text-slate-900 dark:text-white" placeholder="Search by video name or channel..." type="text"/>
            </label>
          </div>
          <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
            <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium whitespace-nowrap">
              All Statuses <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <button className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-medium whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Success
            </button>
            <button className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-medium whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 flex-1">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Video Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Channel</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scheduled Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {MOCK_HISTORY.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-11 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0 relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.thumbnailColor}`}></div>
                          <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded font-bold">{item.duration}</div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">{item.type === 'Video' ? 'movie' : 'bolt'}</span> YouTube {item.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 bg-cover"
                          style={{ backgroundImage: `url('${item.channelAvatar}')` }}
                        ></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.channel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${item.status === 'Failed' ? 'text-rose-500/70 italic' : 'text-slate-700 dark:text-slate-300'}`}>{item.scheduledDate}</span>
                        <span className={`text-xs ${item.status === 'Failed' ? 'text-rose-500/70' : 'text-slate-500 dark:text-slate-500'}`}>{item.scheduledTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        item.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        item.status === 'Failed' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Published' ? 'bg-emerald-500' :
                          item.status === 'Scheduled' ? 'bg-amber-500' :
                          item.status === 'Failed' ? 'bg-rose-500' : 'bg-slate-500'
                        }`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status === 'Failed' ? (
                          <button className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">refresh</span> Retry
                          </button>
                        ) : (
                          <>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                              <span className="material-symbols-outlined text-lg">{item.status === 'Published' ? 'open_in_new' : 'calendar_month'}</span>
                            </button>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="px-8 py-4 text-center border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500">PostAgent • Automated with simplicity. No paid plans, just productivity.</p>
      </footer>
    </div>
  );
};

export default HistoryView;
