/**
 * CreateGroupModal.tsx
 * Modal for creating a new P2P mesh group from active connections.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, UserPlus, Check, Shield } from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';

export function CreateGroupModal() {
    const { peers, createGroup, isCreateGroupModalOpen: isOpen, closeCreateGroupModal: onClose } = useVortexStore();
    const [groupName, setGroupName] = useState('');
    const [selectedPeers, setSelectedPeers] = useState<Set<string>>(new Set());

    const peerList = Object.values(peers).filter(p => p.connectionState === 'connected');

    const togglePeer = (id: string) => {
        const next = new Set(selectedPeers);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedPeers(next);
    };

    const handleCreate = () => {
        if (!groupName.trim() || selectedPeers.size === 0) return;
        createGroup(groupName.trim(), Array.from(selectedPeers));
        setGroupName('');
        setSelectedPeers(new Set());
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="glass-panel w-full max-w-md bg-bg-secondary rounded-2xl shadow-window overflow-hidden relative z-10 flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
                            <div className="flex items-center gap-2 text-text-primary">
                                <Users className="w-5 h-5 text-accent" />
                                <h2 className="font-bold text-lg">Create P2P Group</h2>
                            </div>
                            <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Group Name input */}
                            <div>
                                <label className="block text-text-secondary text-sm font-medium mb-1.5">Group Name</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="e.g. Secure Project Sync"
                                    className="input-base w-full py-2.5 px-3"
                                />
                            </div>

                            {/* Peer Selection */}
                            <div>
                                <label className="block text-text-secondary text-sm font-medium mb-1.5 flex items-center justify-between">
                                    <span>Select Members</span>
                                    <span className="text-xs text-text-muted">{selectedPeers.size} selected</span>
                                </label>

                                <div className="max-h-48 overflow-y-auto w-full border border-border-subtle rounded-xl bg-bg-primary/50">
                                    {peerList.length === 0 ? (
                                        <div className="p-4 flex flex-col items-center justify-center text-center">
                                            <UserPlus className="w-6 h-6 text-text-muted mb-2" />
                                            <p className="text-text-secondary text-sm">No active peers available</p>
                                            <p className="text-text-muted text-[10px] mt-1">You must establish a 1-on-1 connection before adding a peer to a group.</p>
                                        </div>
                                    ) : (
                                        peerList.map(peer => (
                                            <div
                                                key={peer.id}
                                                onClick={() => togglePeer(peer.id)}
                                                className="flex flex-row items-center justify-between p-3 border-b border-border-subtle last:border-0 hover:bg-bg-hover cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center text-bg-primary font-bold text-sm" style={{ backgroundColor: peer.avatarColor }}>
                                                        {peer.alias[0].toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-text-primary font-medium">{peer.alias}</span>
                                                </div>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedPeers.has(peer.id) ? 'bg-accent border-accent text-bg-primary' : 'border-text-muted'}`}>
                                                    {selectedPeers.has(peer.id) && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="flex items-start gap-2 text-text-muted text-xs bg-accent/5 p-3 rounded-xl border border-accent/10">
                                <Shield className="w-4 h-4 flex-shrink-0 text-accent/80" />
                                <p>Groups in Vortex are serverless P2P meshes. Messages sent to the group are individually encrypted and delivered directly to each active member.</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-border-subtle bg-bg-primary/50 flex justify-end gap-3">
                            <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={!groupName.trim() || selectedPeers.size === 0}
                                className="btn-primary px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Group
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
