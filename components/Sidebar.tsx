
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'upload' as View, label: 'Upload', icon: 'upload_file' },
    { id: 'shorts' as View, label: 'Shorts', icon: 'play_circle' },
    { id: 'channels' as View, label: 'Channels', icon: 'account_tree' },
    { id: 'history' as View, label: 'History', icon: 'history' },
  ];

  return (
    <aside className="w-64 fixed inset-y-0 left-0 bg-white dark:bg-[#16212c] border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none tracking-tight">PostAgent</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">Creator Pro</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
              activeView === item.id 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="mb-4 bg-primary/10 border border-primary/20 p-4 rounded-xl hidden lg:block">
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Pro Tip</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Add <span className="text-primary font-mono">#shorts</span> to your bulk titles to improve discoverability.
          </p>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
            <div 
              className="size-8 rounded-full bg-slate-300 dark:bg-slate-700 bg-cover" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAq4fFnrygiPBlwvqreUuldmdPtOGBw3muZoht9DroNlxBfx6eNROp8vl7dQgCR4dziBuVfi3UnqT3spoZIctWZHwfVGQjlhI5uiWcowIn6U_mBZHNp_1nWkH9LmCMowvQ8ALyQ4QyqdV0XDXno0N--XcNFGcnwvXtSXKSOL1XYGONJE9Fwbnr4ffN4wSXD6EjfdU3WCwyuEy4XzU5jn90HnjtfD0X2XPQSnaufmF6T1Cu4IuP9ZHZ5loOSBwc67FNP4655vvqKgTj2')" }}
            ></div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Creator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
