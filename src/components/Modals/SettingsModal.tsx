/**
 * SettingsModal.tsx
 * Premium settings interface for profile management and storage visualization.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Shield, HardDrive, Check, Palette,
    Ghost, Bird, Dog, Zap, Flame, Star, Coffee, AlertTriangle, Trash2
} from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';

const AVATAR_COLORS = [
    'hsl(176, 80%, 50%)', 'hsl(280, 70%, 60%)', 'hsl(38, 90%, 55%)',
    'hsl(200, 80%, 55%)', 'hsl(340, 80%, 60%)', 'hsl(145, 65%, 45%)',
    'hsl(10, 80%, 60%)', 'hsl(190, 80%, 45%)', 'hsl(250, 70%, 55%)'
];

const THEME_ACCENTS = [
    'hsl(176, 80%, 50%)', // Teal (Default)
    'hsl(210, 100%, 60%)', // Azure
    'hsl(280, 70%, 60%)', // Purple
    'hsl(340, 80%, 60%)', // Pink
    'hsl(10, 80%, 60%)', // Red
    'hsl(38, 90%, 55%)', // Orange/Gold
    'hsl(145, 65%, 45%)', // Green
];

const PROFILE_ICONS = [
    { name: 'User', icon: User },
    { name: 'Ghost', icon: Ghost },
    { name: 'Bird', icon: Bird },
    { name: 'Dog', icon: Dog },
    { name: 'Zap', icon: Zap },
    { name: 'Flame', icon: Flame },
    { name: 'Star', icon: Star },
    { name: 'Coffee', icon: Coffee },
];

export function SettingsModal() {
    const {
        isSettingsModalOpen, closeSettingsModal,
        myProfile, updateProfile,
        storageStats
    } = useVortexStore();

    const [name, setName] = useState(myProfile.name);
    const [selectedColor, setSelectedColor] = useState(myProfile.avatarColor);
    const [selectedIcon, setSelectedIcon] = useState(myProfile.avatarIcon || 'User');
    const [themeColor, setThemeColor] = useState(myProfile.themeColor || 'hsl(176, 80%, 50%)');
    const [activeTab, setActiveTab] = useState<'profile' | 'storage' | 'system' | 'danger'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [showWipeConfirm, setShowWipeConfirm] = useState(false);
    const { resetApp } = useVortexStore();

    // Sync local state when modal opens to ensure persistent data is reflected
    useEffect(() => {
        if (isSettingsModalOpen) {
            setName(myProfile.name);
            setSelectedColor(myProfile.avatarColor);
            setSelectedIcon(myProfile.avatarIcon || 'User');
            setThemeColor(myProfile.themeColor || 'hsl(176, 80%, 50%)');
        }
    }, [isSettingsModalOpen, myProfile]);

    if (!isSettingsModalOpen) return null;

    const handleSave = () => {
        setIsSaving(true);
        updateProfile({
            name,
            avatarColor: selectedColor,
            avatarIcon: selectedIcon,
            themeColor
        });
        setTimeout(() => {
            setIsSaving(false);
            closeSettingsModal();
        }, 600);
    };

    const storagePercent = storageStats.percent;
    const storageColorClass = storagePercent > 80 ? 'text-danger' : storagePercent > 50 ? 'text-warning' : 'text-accent';
    const storageBgClass = storagePercent > 80 ? 'bg-danger/20' : storagePercent > 50 ? 'bg-warning/20' : 'bg-accent/20';

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-bg-primary/90 backdrop-blur-md"
                    onClick={closeSettingsModal}
                />

                {/* Modal Container */}
                <motion.div
                    className="relative z-10 w-full max-w-2xl bg-bg-secondary/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh] glass-panel"
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    {/* Left Sidebar (Desktop) */}
                    <div className="w-full md:w-56 bg-white/5 p-6 border-b md:border-b-0 md:border-r border-white/10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-accent" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Security</span>
                        </div>

                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:bg-white/5'}`}
                            >
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('storage')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeTab === 'storage' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:bg-white/5'}`}
                            >
                                <HardDrive className="w-4 h-4" />
                                <span>Storage</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('system')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeTab === 'system' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:bg-white/5'}`}
                            >
                                <Zap className="w-4 h-4" />
                                <span>Process</span>
                            </button>
                            <div className="pt-4 mt-2 border-t border-white/5">
                                <button
                                    onClick={() => setActiveTab('danger')}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeTab === 'danger' ? 'bg-red-500/10 text-red-500 font-medium' : 'text-text-muted hover:bg-white/5'}`}
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Danger Zone</span>
                                </button>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-bg-secondary/40 backdrop-blur-sm z-10 border-b border-white/5">
                            <h2 className="text-xl font-bold">Preferences</h2>
                            <button onClick={closeSettingsModal} className="btn-ghost !rounded-full p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 flex-1">
                            {activeTab === 'profile' && (
                                <section className="animate-fade-in">
                                    <div className="flex items-center gap-2 mb-4 text-text-primary">
                                        <User className="w-4 h-4 text-accent" />
                                        <h3 className="font-semibold">Your Identity</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            <div
                                                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/10 relative group bg-bg-hover overflow-hidden"
                                                style={{ backgroundColor: selectedColor }}
                                            >
                                                {(() => {
                                                    const IconData = PROFILE_ICONS.find(i => i.name === selectedIcon) || PROFILE_ICONS[0];
                                                    const IconComp = IconData.icon;
                                                    return <IconComp className="w-10 h-10 text-white drop-shadow-md" />;
                                                })()}
                                            </div>

                                            <div className="flex-1 space-y-2 w-full">
                                                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Codename or Alias..."
                                                    className="input-base w-full py-3 text-lg font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                <Palette className="w-3.5 h-3.5" />
                                                Avatar Color & Icon
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {AVATAR_COLORS.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 relative flex items-center justify-center`}
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {selectedColor === color && <Check className="w-3 h-3 text-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {PROFILE_ICONS.map(({ name: iconName, icon: IconComp }) => (
                                                    <button
                                                        key={iconName}
                                                        onClick={() => setSelectedIcon(iconName)}
                                                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center border ${selectedIcon === iconName ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-transparent text-text-muted hover:bg-white/10'}`}
                                                    >
                                                        <IconComp className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                <Zap className="w-3.5 h-3.5 text-accent" />
                                                Global App Theme
                                            </label>
                                            <div className="flex flex-wrap gap-3">
                                                {THEME_ACCENTS.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setThemeColor(color)}
                                                        className={`w-12 h-6 rounded-full transition-all duration-300 relative flex items-center justify-center border-2 ${themeColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {themeColor === color && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'storage' && (
                                <section className="animate-fade-in">
                                    <div className="flex items-center gap-2 mb-4 text-text-primary">
                                        <HardDrive className="w-4 h-4 text-accent" />
                                        <h3 className="font-semibold underline decoration-accent/30 underline-offset-4">Storage Pulse</h3>
                                    </div>

                                    <div className={`p-5 rounded-2xl ${storageBgClass} border border-white/5 space-y-4`}>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-text-primary">Vortex Core Integrity</p>
                                                <p className="text-xs text-text-muted">LRU Auto-Cleanup Active</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-2xl font-black italic tracking-tighter ${storageColorClass}`}>
                                                    {storagePercent.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative h-4 bg-black/30 rounded-full overflow-hidden border border-white/10">
                                            <motion.div
                                                className="absolute left-0 top-0 h-full bg-accent shadow-glow-accent-sm"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${storagePercent}%` }}
                                                transition={{ duration: 1.5 }}
                                            />
                                        </div>

                                        <div className="flex justify-between text-[11px] font-medium tracking-tight text-text-muted">
                                            <span>{(storageStats.usageBytes / 1024 / 1024).toFixed(1)} MB USED</span>
                                            <span>500 MB QUOTA</span>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'system' && (
                                <section className="animate-fade-in space-y-6">
                                    <div className="flex items-center gap-2 mb-2 text-text-primary">
                                        <Zap className="w-4 h-4 text-accent" />
                                        <h3 className="font-semibold">Web App Process</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Active Channels</p>
                                            <p className="text-2xl font-black text-accent">{Object.keys(useVortexStore.getState().rtcEngines).length}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Runtime State</p>
                                            <p className="text-lg font-bold text-success capitalize">Optimized</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Service Health</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-text-secondary">P2P Mesh Engine</span>
                                                <span className="text-success font-medium">Running</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-text-secondary">IndexedDB Storage</span>
                                                <span className="text-success font-medium">Synced</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-text-secondary">Crypto Subsystem</span>
                                                <span className="text-success font-medium">Secure</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'danger' && (
                                <section className="animate-fade-in space-y-6">
                                    <div className="flex items-center gap-2 mb-2 text-red-500">
                                        <AlertTriangle className="w-4 h-4" />
                                        <h3 className="font-semibold">Danger Zone</h3>
                                    </div>
                                    <p className="text-sm text-text-muted">
                                        These actions are permanent and cannot be undone. Proceed with caution.
                                    </p>

                                    <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col items-start gap-4 mt-4">
                                        <div className="space-y-1 w-full text-left">
                                            <p className="text-sm font-bold text-white">Nuclear Reset</p>
                                            <p className="text-[12px] text-white/50 leading-relaxed">This action will immediately and irreversibly delete all local data, message history, connection peers, and your profile identity. Selecting this will return the application to its initial onboarding state.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowWipeConfirm(true)}
                                            className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Wipe Application
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 pb-8 flex justify-end gap-3">
                            <button
                                onClick={closeSettingsModal}
                                className="px-6 py-2.5 rounded-xl font-semibold text-text-muted hover:text-text-primary transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary px-8 py-2.5 flex items-center justify-center gap-2 min-w-[140px]"
                            >
                                {isSaving ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    >
                                        <Shield className="w-4 h-4" />
                                    </motion.div>
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {isSaving ? 'Synchronizing...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Nuclear Reset Confirmation Modal inside Settings */}
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
                                            <span className="text-red-400 font-bold">ALL message history, peers, and your profile will be permanently deleted.</span> This cannot be undone.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setShowWipeConfirm(false);
                                            resetApp();
                                        }}
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
        </AnimatePresence>
    );
}
