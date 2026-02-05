import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (type: NotificationType, title: string, message?: string, duration?: number) => void;
    dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((type: NotificationType, title: string, message?: string, duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, type, title, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                dismissNotification(id);
            }, duration);
        }
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification }}>
            {children}
            <NotificationContainer notifications={notifications} onDismiss={dismissNotification} />
        </NotificationContext.Provider>
    );
};

const NotificationContainer: React.FC<{ notifications: Notification[]; onDismiss: (id: string) => void }> = ({
    notifications,
    onDismiss,
}) => {
    return (
        <div className="fixed top-24 right-8 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`
            pointer-events-auto
            flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-right-full duration-300
            ${notification.type === 'success' ? 'bg-white/90 dark:bg-slate-800/90 border-green-200 dark:border-green-900' : ''}
            ${notification.type === 'error' ? 'bg-white/90 dark:bg-slate-800/90 border-red-200 dark:border-red-900' : ''}
            ${notification.type === 'warning' ? 'bg-white/90 dark:bg-slate-800/90 border-amber-200 dark:border-amber-900' : ''}
            ${notification.type === 'info' ? 'bg-white/90 dark:bg-slate-800/90 border-blue-200 dark:border-blue-900' : ''}
          `}
                >
                    <div className="shrink-0 mt-0.5">
                        {notification.type === 'success' && <CheckCircle2 size={20} className="text-green-500" />}
                        {notification.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
                        {notification.type === 'warning' && <AlertTriangle size={20} className="text-amber-500" />}
                        {notification.type === 'info' && <Info size={20} className="text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold ${notification.type === 'success' ? 'text-green-900 dark:text-green-100' :
                                notification.type === 'error' ? 'text-red-900 dark:text-red-100' :
                                    notification.type === 'warning' ? 'text-amber-900 dark:text-amber-100' :
                                        'text-blue-900 dark:text-blue-100'
                            }`}>
                            {notification.title}
                        </h4>
                        {notification.message && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                {notification.message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => onDismiss(notification.id)}
                        className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
