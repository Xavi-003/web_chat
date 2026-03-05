/**
 * ActiveChat.tsx
 * Main chat window – WhatsApp Web style.
 * Shows message history with peer, handles message sending, and video call initiation.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Search, MoreVertical, Paperclip, Smile, Send, Shield, Lock, RefreshCw, ChevronLeft } from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';
import { MessageBubble } from './MessageBubble.tsx';
import { Avatar } from '../Common/Avatar';

export function ActiveChat() {
    const {
        activeChatId, peers, groups, messages,
        sendMessage, startVideoCall, openReconnectModal, setActiveChat, lockApp
    } = useVortexStore();

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const activePeer = activeChatId ? peers[activeChatId] : null;
    const activeGroup = activeChatId ? groups[activeChatId] : null;
    const chatMessages = activeChatId ? (messages[activeChatId] ?? []) : [];

    const activeEntity = activePeer || activeGroup;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length]);

    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || !activeChatId) return;
        setInputText('');
        await sendMessage(text);
        inputRef.current?.focus();
    }, [inputText, activeChatId, sendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Group messages by date
    const groupedMessages: { date: string; items: typeof chatMessages }[] = [];
    chatMessages.forEach(msg => {
        const date = new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        const last = groupedMessages[groupedMessages.length - 1];
        if (last?.date === date) last.items.push(msg);
        else groupedMessages.push({ date, items: [msg] });
    });

    if (!activeEntity) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4 p-8"
                >
                    <div className="w-24 h-24 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                        <Shield className="w-10 h-10 text-accent" />
                    </div>
                    <h2 className="text-text-primary text-2xl font-bold">Vortex</h2>
                    <p className="text-text-secondary text-sm max-w-xs">
                        End-to-end encrypted P2P messaging. No servers. No tracking. Your data stays on your device.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-text-muted text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>AES-GCM encrypted · WebRTC P2P · IndexedDB</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    const isGroup = !!activeGroup;
    const isConnected = isGroup ? activeGroup.memberIds.length > 0 : activePeer?.connectionState === 'connected';
    const statusText = isGroup
        ? `${activeGroup.memberIds.length} members`
        : isConnected
            ? 'Connected • Encrypted'
            : activePeer?.connectionState === 'failed'
                ? 'Connection failed'
                : activePeer?.connectionState === 'disconnected'
                    ? 'Disconnected'
                    : 'Connecting...';

    const avatarColor = activeEntity.avatarColor;
    const displayName = isGroup ? activeGroup.name : activePeer?.alias ?? 'Unknown';

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-primary">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border-subtle flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveChat(null)}
                        className="md:hidden btn-ghost p-1.5 -ml-2"
                        aria-label="Back to chat list"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <Avatar
                        avatarColor={avatarColor}
                        avatarIcon={activePeer?.avatarIcon}
                        size="md"
                        isConnected={isConnected}
                        isGroup={isGroup}
                    />
                    <div>
                        <p className="text-text-primary font-semibold text-sm">{displayName}</p>
                        <div className="flex items-center gap-1.5">
                            {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
                            <p className={`text-xs ${isConnected ? 'text-success' : 'text-text-muted'}`}>{statusText}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-ghost" aria-label="Search">
                        <Search className="w-5 h-5" />
                    </motion.button>
                    {!isGroup && (
                        <>
                            {activePeer?.connectionState === 'disconnected' || activePeer?.connectionState === 'failed' ? (
                                <button
                                    onClick={() => openReconnectModal(activeChatId as string)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors mr-2 border border-accent/20"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Reconnect
                                </button>
                            ) : null}
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={startVideoCall}
                                className="btn-ghost"
                                aria-label="Video call"
                                disabled={!isConnected}
                            >
                                <Video className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={startVideoCall}
                                className="btn-ghost"
                                aria-label="Voice call"
                                disabled={!isConnected}
                            >
                                <Phone className="w-5 h-5" />
                            </motion.button>
                        </>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-ghost" aria-label="More options">
                        <MoreVertical className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {chatMessages.length === 0 && (
                    <div className="flex justify-center mt-8">
                        <div className="glass-panel rounded-xl px-4 py-3 text-center max-w-sm">
                            <Lock className="w-5 h-5 text-accent mx-auto mb-2" />
                            <p className="text-text-secondary text-sm font-medium">Messages are end-to-end encrypted</p>
                            <p className="text-text-muted text-xs mt-1">No one outside of this chat can read or listen to them.</p>
                        </div>
                    </div>
                )}

                {groupedMessages.map(({ date, items }) => (
                    <div key={date}>
                        {/* Date separator */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-border-subtle/40" />
                            <span className="glass-panel rounded-full px-3 py-1 text-xs text-text-muted">{date}</span>
                            <div className="flex-1 h-px bg-border-subtle/40" />
                        </div>

                        <AnimatePresence>
                            {items.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                        </AnimatePresence>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 bg-bg-secondary border-t border-border-subtle flex-shrink-0 relative group">
                <AnimatePresence>
                    {!isConnected && !isGroup && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute inset-x-0 -top-10 flex justify-center pointer-events-none"
                        >
                            <div className="bg-bg-tertiary/90 backdrop-blur-sm border border-border-subtle px-3 py-1 rounded-full text-[10px] text-text-muted flex items-center gap-2 shadow-lg">
                                <Lock className="w-3 h-3 text-warning" />
                                <span>Disconnected. Waiting for peer link...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`flex items-end gap-3 transition-opacity duration-300 ${!isConnected && !isGroup ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}>
                    <button className="btn-ghost flex-shrink-0 mb-1" aria-label="Attach file">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="btn-ghost flex-shrink-0 mb-1" aria-label="Emoji">
                        <Smile className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!isConnected && !isGroup}
                            placeholder={isConnected || isGroup ? "Type a secure message..." : "Peer offline..."}
                            rows={1}
                            className="input-base w-full resize-none max-h-32 leading-relaxed py-2.5"
                            style={{ minHeight: '44px' }}
                            aria-label="Message input"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={!inputText.trim() || (!isConnected && !isGroup)}
                        className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 mb-0.5
              ${inputText.trim() && (isConnected || isGroup)
                                ? 'bg-accent text-bg-primary shadow-glow-accent-sm hover:bg-accent-glow'
                                : 'bg-bg-hover text-text-muted cursor-not-allowed'
                            }`}
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
