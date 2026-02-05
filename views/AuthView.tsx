
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface AuthViewProps {
    onSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
    const { showNotification } = useNotification();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                showNotification('info', 'Check your email', 'Verification email sent!');
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark p-4 relative overflow-hidden transition-colors duration-300">
            {/* Abstract Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-10 rounded-3xl shadow-2xl backdrop-blur-sm">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-primary size-16 rounded-2xl flex items-center justify-center text-white mb-5 shadow-xl shadow-primary/20">
                            <Sparkles size={36} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">PostAgent</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest uppercase">{isLogin ? 'Welcome back, Creator' : 'Start your journey today'}</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-primary/20 flex items-center justify-center gap-3 group uppercase tracking-widest text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />)}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-border-dark flex flex-col gap-5 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest"
                        >
                            {isLogin ? "Join the family" : "Step inside"}
                        </button>
                        <a href="#" className="text-[10px] text-slate-400 hover:text-primary transition-colors italic font-bold">Lost your keys? Reset password</a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthView;
