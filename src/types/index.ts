/**
 * types.ts
 * Shared TypeScript interfaces and types for Vortex.
 */

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';

export type MessageType = 'text' | 'file' | 'system';
export type MessageSender = 'me' | 'peer';

export interface ChatMessage {
    id: string;
    peerId: string;
    content: string;
    sender: MessageSender;
    type: MessageType;
    timestamp: number;
    status?: 'sent' | 'delivered' | 'failed';
    // For files
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    // For groups: if this message was sent to a group
    targetGroupId?: string;
    // For groups: the original sender's alias (since peerId is the relayer's ID)
    originalSenderAlias?: string;
}

export interface PeerSession {
    id: string;             // Unique peer identifier (random UUID assigned at session start)
    alias: string;          // Display name (e.g., "Peer Alpha-7")
    connectionState: ConnectionState;
    lastMessage?: ChatMessage;
    lastActivity: number;
    unreadCount: number;
    avatarColor: string;    // HSL color for avatar
    avatarIcon?: string;    // Lucide icon name (optional)
    isVideoCallActive: boolean;
    isMuted: boolean;
}

export interface GroupSession {
    id: string;             // Unique group identifier
    name: string;           // Group name
    memberIds: string[];    // Array of active peer IDs in this group
    lastMessage?: ChatMessage;
    lastActivity: number;
    unreadCount: number;
    avatarColor: string;
}

export type SignalingRole = 'caller' | 'callee' | null;

export interface UserProfile {
    name: string;
    avatarColor: string;
    avatarIcon: string;
    themeColor: string;
    hasSecurity?: boolean;
    passwordHash?: string | null;
}

export interface StorageStats {
    usageBytes: number;
    quotaBytes: number;
    percent: number;
}
