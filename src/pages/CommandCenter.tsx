/**
 * CommandCenter.tsx
 * Main WhatsApp Web-style dual-pane layout.
 * Left: PeerList sidebar  |  Right: ActiveChat or empty state
 */
import { useEffect, useState } from 'react';
import { PeerList } from '../components/Sidebar/PeerList';
import { ActiveChat } from '../components/Chat/ActiveChat';
import { ConnectModal } from '../components/Modals/ConnectModal';
import { SettingsModal } from '../components/Modals/SettingsModal';
import { VideoCallModal } from '../components/Modals/VideoCallModal';
import { CreateGroupModal } from '../components/Modals/CreateGroupModal';
import { useVortexStore } from '../store/useVortexStore';
import { autoCleanupDB } from '../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export function CommandCenter() {
    const { refreshStorageStats, hydrate, activeChatId } = useVortexStore();
    const [isMobileShowingChat, setIsMobileShowingChat] = useState(false);

    // On startup: clean old data and refresh storage stats
    useEffect(() => {
        (async () => {
            await hydrate();
            await autoCleanupDB();
            await refreshStorageStats();
        })();
    }, []);

    // On mobile: when activePeer changes, show chat panel
    useEffect(() => {
        if (activeChatId) setIsMobileShowingChat(true);
    }, [activeChatId]);

    return (
        <div className="w-full h-screen flex overflow-hidden bg-bg-primary">
            {/* Left: Peer List (always visible on desktop, hidden on mobile when chat is open) */}
            <div
                className={`
          w-full md:w-[380px] lg:w-[420px] xl:w-[460px] flex-shrink-0
          flex flex-col h-full
          ${isMobileShowingChat ? 'hidden md:flex' : 'flex'}
        `}
            >
                <PeerList />
            </div>

            {/* Right: Chat or Empty State */}
            <div className={`flex-1 flex flex-col h-full ${!isMobileShowingChat ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile back button */}
                <AnimatePresence>
                    {isMobileShowingChat && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileShowingChat(false)}
                            className="md:hidden absolute top-3 left-3 z-20 btn-ghost"
                            aria-label="Back to peer list"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <ActiveChat />
            </div>

            {/* Modals */}
            <ConnectModal />
            <SettingsModal />
            <VideoCallModal />
            <CreateGroupModal />
        </div>
    );
}
