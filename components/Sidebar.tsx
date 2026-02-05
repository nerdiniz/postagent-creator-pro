
import React, { useState } from 'react';
import { View } from '../types';
import { User } from '@supabase/supabase-js';
import {
  Upload,
  PlayCircle,
  Network,
  History,
  ChevronLeft,
  LogOut,
  Settings,
  Zap,
  LayoutDashboard,
  Sun,
  Moon,
  FileVideo
} from 'lucide-react';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  user: User;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onLogout,
  user,
  theme,
  onToggleTheme,
  isCollapsed,
  setIsCollapsed
}) => {

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'shorts' as View, label: 'Shorts Generator', icon: <PlayCircle size={20} /> },
    { id: 'videos' as View, label: 'Long Videos', icon: <FileVideo size={20} /> },
    { id: 'channels' as View, label: 'Channel Manager', icon: <Network size={20} /> },
    { id: 'history' as View, label: 'Post History', icon: <History size={20} /> },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} fixed inset-y-0 left-0 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-border-dark flex flex-col z-30 transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          <div className="bg-primary size-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Zap size={20} fill="white" />
          </div>
          <div className="shrink-0">
            <h1 className="text-base font-bold leading-none tracking-tight text-slate-900 dark:text-white">PostAgent</h1>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        <p className={`px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isCollapsed ? 'hidden' : 'block'}`}>Main Menu</p>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${activeView === item.id
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-slate-400 hover:text-white hover:bg-surface-dark'
              }`}
          >
            <div className={`${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 mt-auto space-y-1">
        <div className="pt-2 border-t border-slate-200 dark:border-border-dark space-y-1">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark transition-all group relative"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {!isCollapsed && <span className="text-sm font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
            )}
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all group relative"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-red-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                Log out
              </div>
            )}
          </button>
        </div>

        <div className={`mt-2 p-2 rounded-2xl bg-slate-50 dark:bg-surface-dark/50 border border-slate-200 dark:border-border-dark flex items-center gap-3  ${isCollapsed ? 'justify-center border-none bg-transparent' : ''}`}>
          <div className="size-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-700 dark:text-white shrink-0 shadow-inner">
            <span className="text-sm font-bold">{user.email?.charAt(0).toUpperCase()}</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Standard Account</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

