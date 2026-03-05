/**
 * cryptoService.ts
 * Web Crypto API utilities for AES-GCM encryption/decryption.
 * All chat messages and file metadata are encrypted before being stored in IndexedDB.
 * Note: Web Crypto is blocked on non-secure contexts (e.g., HTTP local IPs).
 * We implement a graceful fallback to plaintext storage if crypto is unavailable.
 */

const ALGORITHM = 'AES-GCM';
const KEY_USAGE: KeyUsage[] = ['encrypt', 'decrypt'];

const isCryptoAvailable = () => typeof crypto !== 'undefined' && !!crypto.subtle;

/** Generate a new AES-GCM key (stored in-session for the connection) */
export async function generateKey(): Promise<CryptoKey | null> {
    if (!isCryptoAvailable()) return null;
    return crypto.subtle.generateKey({ name: ALGORITHM, length: 256 }, true, KEY_USAGE);
}

/** Export a CryptoKey to a Base64 string for sharing (not used for signaling, only for local storage) */
export async function exportKey(key: CryptoKey | null): Promise<string> {
    if (!key || !isCryptoAvailable()) return 'FALLBACK_KEY_HTTP';
    const raw = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

/** Import a Base64 key string back into a CryptoKey */
export async function importKey(b64: string): Promise<CryptoKey | null> {
    if (b64 === 'FALLBACK_KEY_HTTP' || !isCryptoAvailable()) return null;
    const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, { name: ALGORITHM }, true, KEY_USAGE);
}

/** Encrypt a plain text string. Falls back to plaintext if crypto unavailable. */
export async function encryptText(text: string, key: CryptoKey | null): Promise<string> {
    if (!key || !isCryptoAvailable()) {
        // Fallback for non-secure contexts: prepend a marker so we know it's unencrypted
        return `UNENCRYPTED_FALLBACK:${btoa(unescape(encodeURIComponent(text)))}`;
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, enc.encode(text));
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
}

/** Decrypt a Base64-encoded ciphertext string. Checks for plaintext fallback marker. */
export async function decryptText(b64: string, key: CryptoKey | null): Promise<string> {
    if (b64.startsWith('UNENCRYPTED_FALLBACK:')) {
        return decodeURIComponent(escape(atob(b64.split(':')[1])));
    }
    if (!key || !isCryptoAvailable()) {
        throw new Error('Cannot decrypt: Crypto API disabled and ciphertext is encrypted.');
    }
    const combined = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const dec = new TextDecoder();
    const plaintext = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
    return dec.decode(plaintext);
}

/** Get or create the session encryption key from sessionStorage */
const SESSION_KEY_STORAGE = 'vortex_session_key';
let _sessionKey: CryptoKey | null = null;
let _sessionKeyLoaded = false;

export async function getSessionKey(): Promise<CryptoKey | null> {
    if (_sessionKeyLoaded) return _sessionKey;
    const stored = sessionStorage.getItem(SESSION_KEY_STORAGE);
    if (stored) {
        _sessionKey = await importKey(stored);
    } else {
        _sessionKey = await generateKey();
        sessionStorage.setItem(SESSION_KEY_STORAGE, await exportKey(_sessionKey));
    }
    _sessionKeyLoaded = true;
    return _sessionKey;
}
