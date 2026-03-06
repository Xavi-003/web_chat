/**
 * storageService.ts
 * IndexedDB persistence layer using Dexie.
 * Implements:
 *   - Message storage (encrypted)
 *   - File metadata storage (encrypted)
 *   - Auto-cleanup: deletes data older than 24 hours OR if storage > 500MB (LRU policy)
 */

import Dexie from 'dexie';
import type { Table } from 'dexie';
import { encryptText, decryptText, getSessionKey } from './cryptoService';
import type { PeerSession, GroupSession, UserProfile } from '../types';

export interface StoredMessage {
    id?: number;
    peerId: string;
    encryptedContent: string; // AES-GCM encrypted JSON
    timestamp: number;
    lastAccessed: number; // For LRU
}

export interface StoredFileMetadata {
    id?: number;
    peerId: string;
    encryptedMeta: string; // encrypted { name, size, type }
    timestamp: number;
    lastAccessed: number;
}

export interface DecryptedMessage {
    id?: number;
    peerId: string;
    content: string;
    sender: 'me' | 'peer';
    type: 'text' | 'file' | 'system';
    timestamp: number;
    targetGroupId?: string;
    originalSenderAlias?: string;
}

export interface DecryptedFileMeta {
    id?: number;
    peerId: string;
    name: string;
    size: number;
    type: string;
    timestamp: number;
}

const MAX_STORAGE_BYTES = 500 * 1024 * 1024; // 500 MB
const MAX_AGE_MS = 24 * 60 * 60 * 1000;      // 24 hours

class VortexDB extends Dexie {
    messages!: Table<StoredMessage>;
    files!: Table<StoredFileMetadata>;
    peers!: Table<PeerSession>;
    groups!: Table<GroupSession>;
    settings!: Table<{ key: string, value: unknown }>;

    constructor() {
        super('VortexDB');
        this.version(3).stores({
            messages: '++id, peerId, timestamp, lastAccessed',
            files: '++id, peerId, timestamp, lastAccessed',
            peers: 'id, lastActivity',
            groups: 'id, lastActivity',
            settings: 'key'
        });
    }
}

const db = new VortexDB();

/**
 * Auto-cleanup: Run on startup.
 * 1. Delete anything older than 24 hours.
 * 2. If storage still exceeds 500MB, delete oldest entries (LRU).
 */
export async function autoCleanupDB(): Promise<void> {
    const now = Date.now();
    const cutoff = now - MAX_AGE_MS;

    // Step 1: Delete records older than 24 hours
    await db.messages.where('timestamp').below(cutoff).delete();
    await db.files.where('timestamp').below(cutoff).delete();

    // Step 2: Check storage usage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        let usage = estimate.usage ?? 0;

        if (usage > MAX_STORAGE_BYTES) {
            // LRU: delete least recently accessed messages first
            const allMessages = await db.messages.orderBy('lastAccessed').toArray();
            for (const msg of allMessages) {
                if (usage <= MAX_STORAGE_BYTES * 0.8) break; // target 80% threshold
                if (msg.id !== undefined) {
                    await db.messages.delete(msg.id);
                    usage -= msg.encryptedContent.length * 2; // approximate
                }
            }

            // Then files
            const allFiles = await db.files.orderBy('lastAccessed').toArray();
            for (const f of allFiles) {
                if (usage <= MAX_STORAGE_BYTES * 0.8) break;
                if (f.id !== undefined) {
                    await db.files.delete(f.id);
                    usage -= f.encryptedMeta.length * 2;
                }
            }
        }
    }
}

/** Store an encrypted message in IndexedDB */
export async function saveMessage(msg: Omit<DecryptedMessage, 'id'>): Promise<void> {
    const key = await getSessionKey();
    const payload = JSON.stringify({ content: msg.content, sender: msg.sender, type: msg.type });
    const encryptedContent = await encryptText(payload, key);
    await db.messages.add({
        peerId: msg.peerId,
        encryptedContent,
        timestamp: msg.timestamp,
        lastAccessed: Date.now(),
    });
}

/** Load and decrypt all messages for a peer, updating lastAccessed for LRU */
export async function loadMessages(peerId: string): Promise<DecryptedMessage[]> {
    const key = await getSessionKey();
    const records = await db.messages.where('peerId').equals(peerId).sortBy('timestamp');
    const now = Date.now();

    // Update lastAccessed in bulk for LRU
    await db.messages.bulkPut(records.map((r) => ({ ...r, lastAccessed: now })));

    const decrypted: DecryptedMessage[] = [];
    for (const r of records) {
        try {
            const plain = await decryptText(r.encryptedContent, key);
            const parsed = JSON.parse(plain);
            decrypted.push({
                id: r.id,
                peerId: r.peerId,
                content: parsed.content,
                sender: parsed.sender,
                type: parsed.type,
                timestamp: r.timestamp,
            });
        } catch {
            // Corrupted or key mismatch — skip
        }
    }
    return decrypted;
}

/** Get all unique peer IDs that have history */
export async function getAllPeerIds(): Promise<string[]> {
    const msgs = await db.messages.toArray();
    return [...new Set(msgs.map((m) => m.peerId))];
}

/** Get storage usage statistics */
export async function getStorageStats(): Promise<{ usageBytes: number; quotaBytes: number; percent: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const est = await navigator.storage.estimate();
        const usageBytes = est.usage ?? 0;
        const quotaBytes = Math.min(est.quota ?? MAX_STORAGE_BYTES, MAX_STORAGE_BYTES);
        return { usageBytes, quotaBytes, percent: Math.min(100, (usageBytes / quotaBytes) * 100) };
    }
    return { usageBytes: 0, quotaBytes: MAX_STORAGE_BYTES, percent: 0 };
}

/** Store peer session in IndexedDB */
export async function savePeer(peer: PeerSession): Promise<void> {
    // We strip transient state like connectionState, unreadCount, isVideoCallActive, isMuted
    // before saving to ensure we don't restore stagnant values.
    const toSave: PeerSession = {
        ...peer,
        connectionState: 'disconnected',
        unreadCount: peer.unreadCount, // actually keep unread count
        isVideoCallActive: false,
        isMuted: false,
        lastActivity: Date.now(),
    };
    await db.peers.put(toSave);
}

/** Load all peer sessions from IndexedDB */
export async function loadPeers(): Promise<PeerSession[]> {
    return db.peers.toArray();
}

/** Store group session in IndexedDB */
export async function saveGroup(group: GroupSession): Promise<void> {
    const toSave: GroupSession = {
        ...group,
        lastActivity: Date.now(),
    };
    await db.groups.put(toSave);
}

/** Load all group sessions from IndexedDB */
export async function loadGroups(): Promise<GroupSession[]> {
    return db.groups.toArray();
}

/** Save user profile */
export async function saveProfile(profile: UserProfile): Promise<void> {
    await db.settings.put({ key: 'profile', value: profile });
}

/** Load user profile */
export async function loadProfile(): Promise<UserProfile | null> {
    const entry = await db.settings.get('profile');
    return entry ? (entry.value as UserProfile) : null;
}

/** Clear all data for a specific peer */
export async function clearPeerHistory(peerId: string): Promise<void> {
    await db.messages.where('peerId').equals(peerId).delete();
    await db.files.where('peerId').equals(peerId).delete();
    await db.peers.delete(peerId);
}

export { db };
