import { describe, it, expect, beforeEach } from 'vitest';
import { useVortexStore } from './useVortexStore';

describe('useVortexStore', () => {
    beforeEach(() => {
        useVortexStore.setState({
            peers: {},
            groups: {},
            messages: {},
            activeChatId: null,
            myProfile: { name: 'Me', avatarColor: '#fff', avatarIcon: 'User', themeColor: '#fff' },
            isHydrated: false,
            isLocked: false,
            isOnboardingOpen: false,
        });
    });

    it('initializes with correct defaults', () => {
        const state = useVortexStore.getState();
        expect(state.peers).toEqual({});
        expect(state.groups).toEqual({});
        expect(state.activeChatId).toBeNull();
        expect(state.isHydrated).toBe(false);
    });

    it('can create a group', () => {
        const state = useVortexStore.getState();
        state.createGroup('Test Group', ['member1', 'member2']);

        const newState = useVortexStore.getState();
        const groupKeys = Object.keys(newState.groups);
        expect(groupKeys.length).toBe(1);

        const groupId = groupKeys[0];
        expect(newState.groups[groupId].name).toBe('Test Group');
        expect(newState.groups[groupId].memberIds).toEqual(['member1', 'member2']);
        expect(newState.activeChatId).toBe(groupId);
    });

    it('opens and closes modals properly', () => {
        useVortexStore.getState().openConnectModal();
        expect(useVortexStore.getState().isConnectModalOpen).toBe(true);

        useVortexStore.getState().closeConnectModal();
        expect(useVortexStore.getState().isConnectModalOpen).toBe(false);

        useVortexStore.getState().openSettingsModal();
        expect(useVortexStore.getState().isSettingsModalOpen).toBe(true);

        useVortexStore.getState().closeSettingsModal();
        expect(useVortexStore.getState().isSettingsModalOpen).toBe(false);
    });

    it('can set an active chat id', () => {
        useVortexStore.getState().setActiveChat('test-id-123');
        expect(useVortexStore.getState().activeChatId).toBe('test-id-123');
    });

    it('locks the app correctly', () => {
        useVortexStore.getState().lockApp();
        expect(useVortexStore.getState().isLocked).toBe(true);
    });
});
