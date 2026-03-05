/**
 * SettingsModal.tsx
 * Premium settings interface for profile management and storage visualization.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Shield, HardDrive, Check, Palette, Info,
    Ghost, Bird, Dog, Zap, Flame, Star, Coffee
} from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';

const AVATAR_COLORS = [
    'hsl(176, 80%, 50%)', 'hsl(280, 70%, 60%)', 'hsl(38, 90%, 55%)',
    'hsl(200, 80%, 55%)', 'hsl(340, 80%, 60%)', 'hsl(145, 65%, 45%)',
    'hsl(10, 80%, 60%)', 'hsl(190, 80%, 45%)', 'hsl(250, 70%, 55%)'
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
    const [isSaving, setIsSaving] = useState(false);

    if (!isSettingsModalOpen) return null;

    const handleSave = () => {
        setIsSaving(true);
        updateProfile({ name, avatarColor: selectedColor, avatarIcon: selectedIcon });
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
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent/10 text-accent font-medium">
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:bg-white/5 transition-colors">
                                <HardDrive className="w-4 h-4" />
                                <span>Storage</span>
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

                        <div className="p-6 space-y-8">
                            {/* Profile Section */}
                            <section>
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
                                            <p className="text-[10px] text-text-muted italic flex items-center gap-1">
                                                <Info className="w-3 h-3" />
                                                Visible to peers and group members.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                            <Palette className="w-3.5 h-3.5" />
                                            Signature Color & Icon
                                        </label>

                                        {/* Color Grid */}
                                        <div className="flex flex-wrap gap-3">
                                            {AVATAR_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 relative flex items-center justify-center`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {selectedColor === color && (
                                                        <motion.div layoutId="checkColor" className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm border border-white/20">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Icon Grid */}
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {PROFILE_ICONS.map(({ name: iconName, icon: IconComp }) => (
                                                <button
                                                    key={iconName}
                                                    onClick={() => setSelectedIcon(iconName)}
                                                    className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 flex items-center justify-center border-2 border-transparent
                                                        ${selectedIcon === iconName ? 'bg-accent/20 border-accent/40' : 'bg-white/5 hover:bg-white/10'}`}
                                                >
                                                    <IconComp className={`w-5 h-5 ${selectedIcon === iconName ? 'text-accent' : 'text-text-muted'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-white/5" />

                            {/* Storage Pulse Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-text-primary">
                                    <HardDrive className="w-4 h-4 text-accent" />
                                    <h3 className="font-semibold underline decoration-accent/30 underline-offset-4">Storage Pulse</h3>
                                </div>

                                <div className={`p-5 rounded-2xl ${storageBgClass} border border-white/5 space-y-4`}>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                                                <div className={`w-2/ h-2/ rounded-full animate-pulse ${storageColorClass.replace('text-', 'bg-')}`} />
                                                Vortex Core Integrity
                                            </p>
                                            <p className="text-xs text-text-muted">LRU Auto-Cleanup Active</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-2xl font-black italic tracking-tighter ${storageColorClass}`}>
                                                {storagePercent.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Advanced Progress Bar */}
                                    <div className="relative h-4 bg-black/30 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            className={`absolute left-0 top-0 h-full rounded-r-full bg-gradient-to-r from-accent/50 to-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${storagePercent}%` }}
                                            transition={{ duration: 1.5, type: 'spring' }}
                                        />
                                        <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                                            <div className="w-full flex justify-between opacity-20 border-x border-white h-full" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-[11px] font-medium tracking-tight text-text-muted">
                                        <span>{(storageStats.usageBytes / 1024 / 1024).toFixed(1)} MB CONSUMED</span>
                                        <span>500 MB TOTAL CAPACITY</span>
                                    </div>
                                </div>
                            </section>

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
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
