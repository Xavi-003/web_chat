import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Ghost, Bird, Dog, Zap, Flame, Star, Coffee,
    ArrowRight, Shield, Lock
} from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';

const ICONS = {
    User, Ghost, Bird, Dog, Zap, Flame, Star, Coffee
};

export function OnboardingModal() {
    const { isOnboardingOpen, closeOnboarding, setPassword, updateProfile } = useVortexStore();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('User');
    const [password, setPasswordInput] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOnboardingOpen) return null;

    const handleNext = async () => {
        if (step === 1) {
            if (!name.trim()) return setError('Please enter your name');
            setError('');
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            if (password.length < 4) return setError('Password must be at least 4 characters');
            if (password !== confirmPassword) return setError('Passwords do not match');

            await setPassword(password);
            updateProfile({
                name,
                avatarIcon: selectedIcon,
                avatarColor: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
            closeOnboarding();
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#0B0F1A]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
            >
                <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Welcome to Vortex</h2>
                                    <p className="text-white/40">Choose your display name to get started.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="text"
                                            placeholder="Your Display Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                    {error && <p className="text-red-400 text-sm pl-2">{error}</p>}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Your Identity</h2>
                                    <p className="text-white/40">Select an icon that represents you.</p>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {Object.entries(ICONS).map(([key, Icon]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedIcon(key)}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-2xl border transition-all
                                                ${selectedIcon === key
                                                    ? 'bg-accent/20 border-accent text-accent'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'}
                                            `}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Secure Your Link</h2>
                                    <p className="text-white/40">Set a password to lock your chat history. This is mandatory for your privacy.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error && !password ? 'text-red-400' : 'text-white/40'}`} />
                                        <input
                                            type="password"
                                            placeholder="Set Password (min. 4 chars)"
                                            value={password}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            className={`
                                                w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all font-medium
                                                ${error && !password ? 'border-red-400/50 focus:ring-red-400/20' : 'border-white/10 focus:ring-accent-primary/50'}
                                            `}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error && password !== confirmPassword ? 'text-red-400' : 'text-white/40'}`} />
                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`
                                                w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all font-medium
                                                ${error && password !== confirmPassword ? 'border-red-400/50 focus:ring-red-400/20' : 'border-white/10 focus:ring-accent-primary/50'}
                                            `}
                                        />
                                    </div>
                                    {error && <p className="text-red-400 text-xs font-bold uppercase tracking-wider pl-2">{error}</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-10 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-accent' : 'w-2 bg-white/10'}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="bg-accent hover:bg-accent-glow text-bg-primary px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 group shadow-lg shadow-accent/20"
                        >
                            {step === 3 ? 'Finish' : 'Next'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
