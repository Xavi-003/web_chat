import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, AlertTriangle, Trash2, X } from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';

export function LockScreen() {
    const { isLocked, unlock, myProfile, resetApp } = useVortexStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showWipeConfirm, setShowWipeConfirm] = useState(false);

    if (!isLocked) return null;

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUnlocking(true);
        setError(false);

        const success = await unlock(password);
        if (!success) {
            setError(true);
            setPassword('');
        }
        setIsUnlocking(false);
    };

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#0B0F1A]"
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative w-full max-w-sm px-6 py-8 space-y-8 flex flex-col items-center max-h-[100dvh] overflow-y-auto">
                {/* User Info */}
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white/5 border border-white/10 shadow-2xl overflow-hidden relative group"
                        style={{ boxShadow: `0 0 30px -10px ${myProfile.avatarColor}40` }}
                    >
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{ background: myProfile.avatarColor }}
                        />
                        <ShieldCheck className="w-10 h-10 relative z-10" style={{ color: myProfile.avatarColor }} />
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold text-white">{myProfile.name}</h2>
                        <p className="text-white/50 text-xs font-medium uppercase tracking-[0.2em]">Session Encrypted</p>
                    </div>
                </div>

                {/* Password Input */}
                <form onSubmit={handleUnlock} className="w-full space-y-4">
                    <div className="space-y-2">
                        <div className="relative group">
                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${error ? 'text-red-400' : 'text-white/40 group-focus-within:text-accent'}`} />
                            <input
                                autoFocus
                                type="password"
                                placeholder="Enter Security Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`
                                    w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none transition-all font-medium
                                    ${error ? 'border-red-400/50 focus:ring-red-400/20 shadow-lg shadow-red-400/5' : 'border-white/20 focus:ring-accent/20 focus:border-accent/50'}
                                `}
                            />
                        </div>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-[10px] font-bold uppercase tracking-wider text-center"
                            >
                                Invalid Password
                            </motion.p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button
                            disabled={isUnlocking || !password}
                            className="w-full bg-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-glow text-bg-primary py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-accent/10"
                        >
                            {isUnlocking ? (
                                <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                            ) : (
                                <>
                                    Unlock Session
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowWipeConfirm(true)}
                            className="w-full py-2 text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-white/40 uppercase tracking-widest font-medium">
                        Your identity is stored locally and securely
                    </p>
                </form>
            </div>

            {/* Nuclear Reset Confirmation */}
            <AnimatePresence>
                {showWipeConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-[#1A0B0B] border border-red-500/20 rounded-3xl p-8 space-y-6 shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Nuclear Reset?</h3>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        Forgot your password? We can reset the app, but <span className="text-red-400 font-bold">ALL message history, peers, and your profile will be permanently deleted.</span> This cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => resetApp()}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Everything
                                </button>
                                <button
                                    onClick={() => setShowWipeConfirm(false)}
                                    className="w-full py-4 text-white/40 hover:text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
