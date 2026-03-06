/**
 * PeerList.tsx
 * Left sidebar component - WhatsApp Web style peer/chat list.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Settings, MessageSquare, Shield, Trash2, Users, Lock
} from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';
import { Avatar } from '../Common/Avatar';
import type { PeerSession, GroupSession, ChatMessage } from '../../types';
import { formatTimestamp } from '../../utils/formatters';

import type { UserProfile } from '../../types';

function MyProfileHeader({ profile, openSettings }: { profile: UserProfile, openSettings: () => void }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/5 group cursor-pointer hover:bg-white/10 transition-colors" onClick={openSettings}>
            <Avatar
                avatarColor={profile.avatarColor}
                avatarIcon={profile.avatarIcon}
                size="md"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{profile.name}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold text-accent/80">Active Operator</p>
            </div>
            <Settings className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:rotate-45 transition-all duration-300" />
        </div>
    );
}

function PeerAvatar({ peer }: { peer: PeerSession | (GroupSession & { connectionState?: string }) }) {
    const isConnected = peer.connectionState === 'connected' || ('memberIds' in peer);
    const isGroup = 'memberIds' in peer;

    return (
        <Avatar
            avatarColor={peer.avatarColor}
            avatarIcon={(peer as PeerSession).avatarIcon}
            size="lg"
            isConnected={isConnected}
            isGroup={isGroup}
        />
    );
}

function formatMessage(msg?: ChatMessage) {
    if (!msg) return '';
    if (msg.type === 'system') return '🔒 Secure connection';
    if (msg.type === 'file') return `📎 ${msg.fileName ?? 'File'}`;
    return msg.content.length > 40 ? msg.content.slice(0, 40) + '...' : msg.content;
}

export function PeerList() {
    const {
        peers, groups, activeChatId, myProfile,
        setActiveChat, openConnectModal, openCreateGroupModal,
        clearChat, openSettingsModal, lockApp
    } = useVortexStore();
    const [search, setSearch] = useState('');

    const peerList = Object.values(peers).map(p => ({ ...p, displayName: p.alias, type: 'peer' }));
    const groupList = Object.values(groups).map(g => ({ ...g, displayName: g.name, type: 'group' }));

    const combinedList = [...peerList, ...groupList]
        .filter(item => item.displayName.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b.lastActivity - a.lastActivity);



    return (
        <div className="flex flex-col h-full bg-bg-secondary border-r border-border-subtle">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-accent-sm">
                        <Shield className="w-4 h-4 text-bg-primary" />
                    </div>
                    <h1 className="text-text-primary font-bold text-lg tracking-tight">Vortex</h1>
                </div>
                <div className="flex items-center gap-1">
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={openCreateGroupModal}
                        className="btn-ghost text-accent"
                        aria-label="New group"
                    >
                        <Users className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={openConnectModal}
                        className="btn-ghost text-accent"
                        aria-label="New connection"
                    >
                        <Plus className="w-5 h-5" />
                    </motion.button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => lockApp()}
                        className="btn-ghost text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        aria-label="Lock Session"
                    >
                        <Lock className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* My Profile Header */}
            <MyProfileHeader profile={myProfile} openSettings={openSettingsModal} />



            {/* Search */}
            <div className="px-3 py-3 border-b border-border-subtle">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-base w-full !pl-10 py-2 text-sm"
                        aria-label="Search peers"
                    />
                </div>
            </div>

            {/* Peer & Group list */}
            <div className="flex-1 overflow-y-auto">
                {combinedList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-bg-hover flex items-center justify-center mb-4">
                            <MessageSquare className="w-7 h-7 text-text-muted" />
                        </div>
                        <p className="text-text-secondary font-medium text-sm">No connections yet</p>
                        <p className="text-text-muted text-xs mt-1">Tap <span className="text-accent">+</span> to create a secure P2P link</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {combinedList.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div
                                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer group relative transition-colors duration-150
                    ${activeChatId === item.id ? 'bg-bg-selected' : 'hover:bg-bg-hover'}`}
                                    onClick={() => setActiveChat(item.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && setActiveChat(item.id)}
                                    aria-label={`Open chat with ${item.displayName}`}
                                >
                                    <PeerAvatar peer={item as unknown as PeerSession} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-text-primary font-medium text-sm truncate">
                                                {item.type === 'group' ? `👥 ${item.displayName}` : item.displayName}
                                            </p>
                                            <p className="text-text-muted text-xs flex-shrink-0 ml-2">
                                                {formatTimestamp(item.lastMessage?.timestamp ?? item.lastActivity)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-text-muted text-xs truncate flex-1">
                                                {formatMessage(item.lastMessage) || (item.type === 'group' ? `${(item as unknown as GroupSession).memberIds?.length} members` : ((item as unknown as PeerSession).connectionState === 'connected' ? 'Connection active' : 'Disconnected'))}
                                            </p>
                                            <div className="flex items-center gap-1 ml-2">
                                                {item.unreadCount > 0 && (
                                                    <span className="bg-accent text-bg-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); clearChat(item.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-danger transition-all duration-150 rounded"
                                                    aria-label={`Clear history for ${item.displayName}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px bg-border-subtle/30 mx-4" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
