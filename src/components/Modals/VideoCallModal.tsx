/**
 * VideoCallModal.tsx
 * Full-screen video call overlay for WebRTC MediaStream.
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';
import { useState } from 'react';

export function VideoCallModal() {
    const { isVideoCallModalOpen, localStream, remoteStream, endVideoCall, activeChatId, peers, groups } = useVortexStore();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => {
        localStream?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        localStream?.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
        setIsVideoOff(!isVideoOff);
    };

    // Video calls are currently only supported for 1-on-1 chats.
    const peerName = activeChatId ? (peers[activeChatId]?.alias || groups[activeChatId]?.name) : 'Unknown Peer';

    return (
        <AnimatePresence>
            {isVideoCallModalOpen && (
                <motion.div
                    className="fixed inset-0 z-50 bg-bg-primary flex flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Remote video (main) */}
                    <div className="flex-1 relative bg-bg-secondary">
                        {remoteStream ? (
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                                        <span className="text-3xl font-bold text-accent">{peerName?.[0] ?? 'P'}</span>
                                    </div>
                                    <p className="text-text-secondary text-sm">Waiting for peer's video...</p>
                                </div>
                            </div>
                        )}

                        {/* Peer name overlay */}
                        <div className="absolute top-4 left-4 glass-panel rounded-lg px-3 py-1.5">
                            <p className="text-text-primary text-sm font-medium">{peerName}</p>
                        </div>
                    </div>

                    {/* Local video (PiP) */}
                    <div className="absolute top-4 right-4 w-32 h-44 md:w-48 md:h-64 rounded-xl overflow-hidden border border-border-subtle shadow-panel bg-bg-secondary">
                        {localStream ? (
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-text-muted" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-6 flex items-center justify-center gap-4 bg-bg-secondary/50 backdrop-blur-sm">
                        <button
                            onClick={toggleMute}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95
                ${isMuted ? 'bg-warning/20 border border-warning/40 text-warning' : 'bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary'}`}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={endVideoCall}
                            className="w-16 h-16 rounded-full bg-danger flex items-center justify-center shadow-lg hover:bg-danger/80 active:scale-95 transition-all duration-200"
                        >
                            <PhoneOff className="w-7 h-7 text-white" />
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95
                ${isVideoOff ? 'bg-warning/20 border border-warning/40 text-warning' : 'bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary'}`}
                        >
                            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
