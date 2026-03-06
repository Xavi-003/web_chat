import { describe, it, expect } from 'vitest';
import { encryptText, decryptText, exportKey, importKey } from './cryptoService';

describe('cryptoService', () => {
    describe('Fallback mode (no crypto.subtle)', () => {
        it('encrypts and decrypts text correctly using fallback', async () => {
            const originalText = 'Hello World! 😊';
            const encrypted = await encryptText(originalText, null);
            expect(encrypted.startsWith('UNENCRYPTED_FALLBACK:')).toBe(true);

            const decrypted = await decryptText(encrypted, null);
            expect(decrypted).toBe(originalText);
        });

        it('returns fallback string for exportKey when key is null', async () => {
            const exported = await exportKey(null);
            expect(exported).toBe('FALLBACK_KEY_HTTP');
        });

        it('returns null for importKey when string is FALLBACK_KEY_HTTP', async () => {
            const imported = await importKey('FALLBACK_KEY_HTTP');
            expect(imported).toBeNull();
        });
    });
});
