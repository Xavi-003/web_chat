/**
 * useVortexStore.ts
 * Zustand global state store for Vortex.
 * Connects WebRTC engines, IndexedDB storage service, and UI state.
 * Implements a P2P Mesh architecture supporting groups.
 */

import { create } from 'zustand';
import { VortexRTC } from '../services/webrtcService';
import {
    saveMessage, loadMessages, getStorageStats, clearPeerHistory,
    savePeer, loadPeers, saveGroup, loadGroups,
    saveProfile, loadProfile
} from '../services/storageService';
import type { ChatMessage, PeerSession, GroupSession, SignalingRole, StorageStats, ConnectionState, UserProfile } from '../types';

const PEER_COLORS = [
    'hsl(176, 80%, 50%)', 'hsl(280, 70%, 60%)', 'hsl(38, 90%, 55%)',
    'hsl(200, 80%, 55%)', 'hsl(340, 80%, 60%)', 'hsl(145, 65%, 45%)',
];

const randomColor = () => PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)];
const randomAlias = () => `Peer ${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

interface VortexStore {
    // Peers, Groups & Sessions
    peers: Record<string, PeerSession>;
    groups: Record<string, GroupSession>;
    activeChatId: string | null;
    myProfile: UserProfile;

    // Messages (keyed by chat ID: either peerId or groupId)
    messages: Record<string, ChatMessage[]>;

    // WebRTC connections map (Mesh Topology)
    rtcEngines: Record<string, VortexRTC>;
    pendingRtcEngine: VortexRTC | null; // Engine currently being negotiated
    livePeerId: string | null;          // ID for the pending engine

    signalingRole: SignalingRole;
    connectionState: ConnectionState;

    // Signaling UI state
    isConnectModalOpen: boolean;
    isCreateGroupModalOpen: boolean;
    isSettingsModalOpen: boolean;
    reconnectPeerId: string | null;
    generatedOffer: string;
    generatedAnswer: string;

    // Video call
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isVideoCallModalOpen: boolean;

    // Storage stats
    storageStats: StorageStats;

    // Actions
    hydrate: () => Promise<void>;
    openConnectModal: () => void;
    closeConnectModal: () => void;
    openSettingsModal: () => void;
    closeSettingsModal: () => void;
    openCreateGroupModal: () => void;
    openReconnectModal: (peerId: string) => void;
    closeCreateGroupModal: () => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    setActiveChat: (chatId: string) => void;
    loadChatMessages: (chatId: string) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    refreshStorageStats: () => Promise<void>;
    clearChat: (chatId: string) => Promise<void>;
    createGroup: (name: string, members: string[]) => void;

    // WebRTC Actions
    initAsCallerAndCreateOffer: () => Promise<void>;
    submitOfferAndCreateAnswer: (offerStr: string) => Promise<void>;
    submitAnswerToFinalize: (answerStr: string) => Promise<void>;
    startVideoCall: () => Promise<void>;
    endVideoCall: () => void;
    setVideoCallModalOpen: (open: boolean) => void;

    // Internal
    _handlePeerConnected: () => void;
    _handleIncomingMessage: (data: string, senderPeerId: string) => void;
}

export const useVortexStore = create<VortexStore>((set, get) => ({
    peers: {},
    groups: {},
    activeChatId: null,
    myProfile: { name: 'Me', avatarColor: randomColor(), avatarIcon: 'User' },
    messages: {},

    rtcEngines: {},
    pendingRtcEngine: null,
    livePeerId: null,

    signalingRole: null,
    connectionState: 'idle',
    isConnectModalOpen: false,
    isSettingsModalOpen: false,
    isCreateGroupModalOpen: false,
    reconnectPeerId: null,
    generatedOffer: '',
    generatedAnswer: '',

    localStream: null,
    remoteStream: null,
    isVideoCallModalOpen: false,
    storageStats: { usageBytes: 0, quotaBytes: 500 * 1024 * 1024, percent: 0 },

    hydrate: async () => {
        const peersArr = await loadPeers();
        const groupsArr = await loadGroups();
        const profile = await loadProfile();

        const peersObj: Record<string, PeerSession> = {};
        const groupsObj: Record<string, GroupSession> = {};

        peersArr.forEach(p => peersObj[p.id] = p);
        groupsArr.forEach(g => groupsObj[g.id] = g);

        set({
            peers: peersObj,
            groups: groupsObj,
            myProfile: profile || get().myProfile
        });
    },

    openConnectModal: () => set({
        isConnectModalOpen: true,
        generatedOffer: '',
        generatedAnswer: '',
        signalingRole: null,
        livePeerId: null,
        reconnectPeerId: null,
    }),
    closeConnectModal: () => set({ isConnectModalOpen: false, reconnectPeerId: null }),

    openSettingsModal: () => set({ isSettingsModalOpen: true }),
    closeSettingsModal: () => set({ isSettingsModalOpen: false }),

    openCreateGroupModal: () => set({ isCreateGroupModalOpen: true }),
    openReconnectModal: (peerId) => set({
        isConnectModalOpen: true,
        reconnectPeerId: peerId,
        generatedOffer: '',
        generatedAnswer: '',
        signalingRole: null,
        livePeerId: peerId,
    }),
    closeCreateGroupModal: () => set({ isCreateGroupModalOpen: false }),

    updateProfile: (profile) => {
        const updated = { ...get().myProfile, ...profile };
        set({ myProfile: updated });
        saveProfile(updated);

        // Broadcast profile change to all connected peers
        const { rtcEngines } = get();
        Object.values(rtcEngines).forEach(engine => {
            engine.sendMessage(JSON.stringify({
                type: 'profile_sync',
                profile: updated
            }));
        });
    },

    setActiveChat: (chatId) => {
        set({ activeChatId: chatId });
        const { peers, groups } = get();
        if (peers[chatId]) {
            set(state => ({ peers: { ...state.peers, [chatId]: { ...state.peers[chatId], unreadCount: 0 } } }));
        } else if (groups[chatId]) {
            set(state => ({ groups: { ...state.groups, [chatId]: { ...state.groups[chatId], unreadCount: 0 } } }));
        }
        get().loadChatMessages(chatId);
        // Persist the zeroed unreadCount
        const activePeer = get().peers[chatId];
        const activeGroup = get().groups[chatId];
        if (activePeer) savePeer(activePeer);
        if (activeGroup) saveGroup(activeGroup);
    },

    loadChatMessages: async (chatId) => {
        const stored = await loadMessages(chatId);
        const messages: ChatMessage[] = stored.map(m => ({
            id: m.id?.toString() ?? Math.random().toString(),
            peerId: m.peerId,
            content: m.content,
            sender: m.sender,
            type: m.type,
            timestamp: m.timestamp,
            status: 'delivered',
            targetGroupId: (m as any).targetGroupId,
            originalSenderAlias: (m as any).originalSenderAlias,
        }));
        set(state => ({ messages: { ...state.messages, [chatId]: messages } }));
    },

    createGroup: (name, memberIds) => {
        const groupId = 'group_' + generateId();
        const group: GroupSession = {
            id: groupId,
            name,
            memberIds,
            lastActivity: Date.now(),
            unreadCount: 0,
            avatarColor: randomColor()
        };
        set(state => ({
            groups: { ...state.groups, [groupId]: group },
            messages: { ...state.messages, [groupId]: [] },
            activeChatId: groupId
        }));
        saveGroup(group);
    },

    sendMessage: async (content) => {
        const { activeChatId, rtcEngines, peers, groups } = get();
        if (!activeChatId) return;

        const timestamp = Date.now();
        const msgId = generateId();

        if (peers[activeChatId]) {
            // 1-on-1 Message
            const msg: ChatMessage = { id: msgId, peerId: activeChatId, content, sender: 'me', type: 'text', timestamp, status: 'sent' };
            set(state => ({
                messages: { ...state.messages, [activeChatId]: [...(state.messages[activeChatId] ?? []), msg] },
                peers: { ...state.peers, [activeChatId]: { ...state.peers[activeChatId], lastMessage: msg, lastActivity: timestamp } }
            }));

            const engine = rtcEngines[activeChatId];
            if (engine && peers[activeChatId].connectionState === 'connected') {
                engine.sendMessage(JSON.stringify({ type: 'text', content, id: msg.id }));
            }
            await saveMessage({ peerId: activeChatId, content, sender: 'me', type: 'text', timestamp });
            savePeer(get().peers[activeChatId]);
        }
        else if (groups[activeChatId]) {
            // Group Message
            const group = groups[activeChatId];
            const msg: ChatMessage = { id: msgId, peerId: activeChatId, content, sender: 'me', type: 'text', timestamp, status: 'sent', targetGroupId: group.id };
            set(state => ({
                messages: { ...state.messages, [activeChatId]: [...(state.messages[activeChatId] ?? []), msg] },
                groups: { ...state.groups, [activeChatId]: { ...state.groups[activeChatId], lastMessage: msg, lastActivity: timestamp } }
            }));

            // Sync via P2P Mesh: SEND to every member explicitly
            group.memberIds.forEach(memberId => {
                const engine = rtcEngines[memberId];
                if (engine && peers[memberId]?.connectionState === 'connected') {
                    engine.sendMessage(JSON.stringify({
                        type: 'text', content, id: msg.id, targetGroupId: group.id, originalSenderAlias: 'Me'
                    }));
                }
            });
            await saveMessage({ peerId: activeChatId, content, sender: 'me', type: 'text', timestamp });
            saveGroup(get().groups[activeChatId]);
        }
    },

    refreshStorageStats: async () => {
        const stats = await getStorageStats();
        set({ storageStats: stats });
    },

    clearChat: async (chatId) => {
        await clearPeerHistory(chatId);
        set(state => {
            const messages = { ...state.messages };
            delete messages[chatId];
            const peers = { ...state.peers };
            if (peers[chatId]) delete peers[chatId];
            const groups = { ...state.groups };
            if (groups[chatId]) delete groups[chatId];
            return { messages, peers, groups, activeChatId: state.activeChatId === chatId ? null : state.activeChatId };
        });
    },

    _handlePeerConnected: () => {
        const { livePeerId, peers, pendingRtcEngine, reconnectPeerId } = get();
        if (!pendingRtcEngine) return;

        const peerId = reconnectPeerId || livePeerId || generateId();

        if (peers[peerId]) {
            // Existing Peer - Update session
            set(state => ({
                peers: {
                    ...state.peers,
                    [peerId]: {
                        ...state.peers[peerId],
                        connectionState: 'connected',
                        lastActivity: Date.now()
                    }
                },
                isConnectModalOpen: false,
                connectionState: 'connected',
                rtcEngines: { ...state.rtcEngines, [peerId]: pendingRtcEngine },
                pendingRtcEngine: null,
            }));
            savePeer(get().peers[peerId]);

            // Send our profile to the reconnected peer
            pendingRtcEngine.sendMessage(JSON.stringify({
                type: 'profile_sync',
                profile: get().myProfile
            }));
            return;
        }

        const session: PeerSession = {
            id: peerId,
            alias: randomAlias(),
            connectionState: 'connected',
            lastActivity: Date.now(),
            unreadCount: 0,
            avatarColor: randomColor(),
            isVideoCallActive: false,
            isMuted: false,
        };

        const sysMsg: ChatMessage = {
            id: generateId(), peerId, content: '🔒 Secure P2P connection established.', sender: 'peer', type: 'system', timestamp: Date.now(),
        };

        // Transfer pending engine to the active engines map
        set(state => ({
            peers: { ...state.peers, [peerId]: session },
            messages: { ...state.messages, [peerId]: [...(state.messages[peerId] || []), sysMsg] },
            activeChatId: peerId,
            livePeerId: peerId,
            connectionState: 'connected',
            isConnectModalOpen: false,
            rtcEngines: { ...state.rtcEngines, [peerId]: pendingRtcEngine },
            pendingRtcEngine: null,  // clear pending
        }));

        savePeer(get().peers[peerId]);

        // Send our profile to the new peer
        pendingRtcEngine.sendMessage(JSON.stringify({
            type: 'profile_sync',
            profile: get().myProfile
        }));
    },

    _handleIncomingMessage: (data, senderPeerId) => {
        const { peers, groups, activeChatId } = get();
        try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'profile_sync') {
                const profile = parsed.profile as UserProfile;
                set(state => ({
                    peers: {
                        ...state.peers,
                        [senderPeerId]: {
                            ...state.peers[senderPeerId],
                            alias: profile.name,
                            avatarColor: profile.avatarColor,
                            avatarIcon: profile.avatarIcon
                        }
                    }
                }));
                savePeer(get().peers[senderPeerId]);
                return;
            }

            const isGroup = !!parsed.targetGroupId;
            const msgTargetId = isGroup ? parsed.targetGroupId : senderPeerId;

            // Auto-create shadow group if it doesn't exist locally
            if (isGroup && !groups[msgTargetId]) {
                const groupName = `Group (${parsed.targetGroupId.substring(0, 5)})`;
                get().createGroup(groupName, [senderPeerId]); // Minimal reconstruction
            }

            const msg: ChatMessage = {
                id: generateId(),
                peerId: msgTargetId,
                content: parsed.content,
                sender: 'peer',
                type: parsed.type ?? 'text',
                timestamp: Date.now(),
                status: 'delivered',
                targetGroupId: parsed.targetGroupId,
                originalSenderAlias: parsed.originalSenderAlias ?? peers[senderPeerId]?.alias
            };

            set(state => {
                const updatedMessages = { ...state.messages, [msgTargetId]: [...(state.messages[msgTargetId] ?? []), msg] };
                if (isGroup) {
                    return {
                        messages: updatedMessages,
                        groups: {
                            ...state.groups,
                            [msgTargetId]: {
                                ...state.groups[msgTargetId],
                                lastMessage: msg,
                                lastActivity: Date.now(),
                                unreadCount: activeChatId === msgTargetId ? 0 : (state.groups[msgTargetId]?.unreadCount ?? 0) + 1
                            }
                        }
                    };
                } else {
                    return {
                        messages: updatedMessages,
                        peers: {
                            ...state.peers,
                            [msgTargetId]: {
                                ...state.peers[msgTargetId],
                                lastMessage: msg,
                                lastActivity: Date.now(),
                                unreadCount: activeChatId === msgTargetId ? 0 : (state.peers[msgTargetId]?.unreadCount ?? 0) + 1
                            }
                        }
                    };
                }
            });
            saveMessage({ peerId: msgTargetId, content: msg.content, sender: 'peer', type: 'text', timestamp: msg.timestamp });

            // Persist the updated session (lastMessage, unreadCount)
            const updated = get();
            if (isGroup) saveGroup(updated.groups[msgTargetId]);
            else savePeer(updated.peers[msgTargetId]);
        } catch { /* skip malformed */ }
    },

    initAsCallerAndCreateOffer: async () => {
        const { pendingRtcEngine } = get();
        pendingRtcEngine?.close();

        set({ connectionState: 'connecting', signalingRole: 'caller', generatedOffer: '', livePeerId: get().reconnectPeerId || null });

        // Temporary peer ID for the upcoming connection
        const newPeerId = get().reconnectPeerId || generateId();
        set({ livePeerId: newPeerId });

        const engine = new VortexRTC({
            onStateChange: (state) => {
                set({ connectionState: state as ConnectionState });
                // If it fails/disconnects later, we could update the peer session specifically.
                // Doing this at the global store level is a bit tricky, but here it marks the UI status during connection.
                if (state === 'disconnected') {
                    set(s => {
                        if (s.peers[newPeerId]) {
                            return { peers: { ...s.peers, [newPeerId]: { ...s.peers[newPeerId], connectionState: 'disconnected' } } };
                        }
                        return {};
                    });
                }
            },
            onDataChannelOpen: () => get()._handlePeerConnected(),
            onMessage: (data) => get()._handleIncomingMessage(data, newPeerId),
            onRemoteStream: (stream) => set({ remoteStream: stream }),
        });

        set({ pendingRtcEngine: engine });
        const offer = await engine.createOffer();
        set({ generatedOffer: offer });
    },

    submitOfferAndCreateAnswer: async (offerStr) => {
        const { pendingRtcEngine } = get();
        pendingRtcEngine?.close();

        set({ connectionState: 'connecting', signalingRole: 'callee', generatedAnswer: '', livePeerId: get().reconnectPeerId || null });

        const newPeerId = get().reconnectPeerId || generateId();
        set({ livePeerId: newPeerId });

        const engine = new VortexRTC({
            onStateChange: (state) => {
                set({ connectionState: state as ConnectionState });
                if (state === 'disconnected') {
                    set(s => {
                        if (s.peers[newPeerId]) {
                            return { peers: { ...s.peers, [newPeerId]: { ...s.peers[newPeerId], connectionState: 'disconnected' } } };
                        }
                        return {};
                    });
                }
            },
            onDataChannelOpen: () => get()._handlePeerConnected(),
            onMessage: (data) => get()._handleIncomingMessage(data, newPeerId),
            onRemoteStream: (stream) => set({ remoteStream: stream }),
        });

        set({ pendingRtcEngine: engine });
        const answer = await engine.createAnswer(offerStr);
        set({ generatedAnswer: answer });
    },

    submitAnswerToFinalize: async (answerStr) => {
        const { pendingRtcEngine } = get();
        if (!pendingRtcEngine) return;
        try {
            await pendingRtcEngine.acceptAnswer(answerStr);
        } catch (err) {
            console.error('[Vortex] Failed to finalize connection:', err);
        }
    },

    startVideoCall: async () => {
        const { activeChatId, rtcEngines } = get();
        if (!activeChatId || !rtcEngines[activeChatId]) return; // Only 1-on-1 calls for now

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            set({ localStream: stream, isVideoCallModalOpen: true });
            rtcEngines[activeChatId].addStream(stream);
        } catch (err) {
            console.error('[Vortex] Camera/Mic access denied:', err);
        }
    },

    endVideoCall: () => {
        const { localStream } = get();
        localStream?.getTracks().forEach(t => t.stop());
        set({ localStream: null, remoteStream: null, isVideoCallModalOpen: false });
    },

    setVideoCallModalOpen: (open) => set({ isVideoCallModalOpen: open }),
}));
