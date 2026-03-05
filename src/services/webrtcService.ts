/**
 * webrtcService.ts
 * WebRTC Engine for manual P2P signaling (no backend).
 * Supports:
 *  - RTCDataChannel for text/file transfer
 *  - MediaStream for Video/Voice calls
 */

export type RTCConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

export interface VortexRTCConfig {
    onMessage: (data: string) => void;
    onStateChange: (state: RTCConnectionState) => void;
    onRemoteStream: (stream: MediaStream) => void;
    onDataChannelOpen: () => void;
}

const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

/** Wait for ICE gathering to complete with a 5-second timeout fallback */
function waitForIceGathering(pc: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') {
            resolve();
            return;
        }
        const timeout = setTimeout(() => {
            // Timeout fallback: resolve anyway with whatever ICE we have
            resolve();
        }, 5000);

        pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
                clearTimeout(timeout);
                resolve();
            }
        };
    });
}

export class VortexRTC {
    private pc: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private config: VortexRTCConfig;

    constructor(config: VortexRTCConfig) {
        this.config = config;
        this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        this.setupPeerListeners();
    }

    // Guard: prevent firing onDataChannelOpen more than once
    private channelOpenFired = false;

    private fireChannelOpen() {
        if (this.channelOpenFired) return;
        this.channelOpenFired = true;
        this.config.onDataChannelOpen();
    }

    private setupPeerListeners() {
        this.pc.oniceconnectionstatechange = () => {
            const s = this.pc.iceConnectionState;
            this.config.onStateChange(s as RTCConnectionState);
            // Chrome fallback: if ICE is connected/completed AND data channel exists
            // but its onopen was already missed, fire now.
            if ((s === 'connected' || s === 'completed') && this.dataChannel?.readyState === 'open') {
                this.fireChannelOpen();
            }
        };

        this.pc.onconnectionstatechange = () => {
            this.config.onStateChange(this.pc.connectionState as RTCConnectionState);
        };

        this.pc.ontrack = (event) => {
            if (event.streams?.[0]) {
                this.config.onRemoteStream(event.streams[0]);
            }
        };

        this.pc.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannelListeners(this.dataChannel);
        };
    }

    private setupDataChannelListeners(dc: RTCDataChannel) {
        // On the callee side, ondatachannel often fires when the channel is
        // already 'open' (Safari), so dc.onopen would never trigger. Check state first.
        if (dc.readyState === 'open') {
            this.fireChannelOpen();
        } else {
            dc.onopen = () => this.fireChannelOpen();
        }

        dc.onmessage = (event) => {
            this.config.onMessage(event.data);
        };
        dc.onerror = (err) => {
            console.error('[VortexRTC] DataChannel error:', err);
        };
        dc.onclose = () => {
            this.config.onStateChange('disconnected');
        };
    }

    public isReady() {
        return this.dataChannel?.readyState === 'open';
    }

    /**
     * CALLER: Creates an offer.
     * State flow: new → have-local-offer
     */
    async createOffer(): Promise<string> {
        if (this.pc.signalingState !== 'stable') {
            throw new Error(`[VortexRTC] Cannot create offer in state: ${this.pc.signalingState}`);
        }

        this.dataChannel = this.pc.createDataChannel('vortex-chat');
        this.setupDataChannelListeners(this.dataChannel);

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        await waitForIceGathering(this.pc);
        return JSON.stringify(this.pc.localDescription);
    }

    /**
     * CALLEE: Receives the offer, returns an answer.
     * State flow: stable → have-remote-offer → stable
     */
    async createAnswer(offerStr: string): Promise<string> {
        if (this.pc.signalingState !== 'stable') {
            throw new Error(`[VortexRTC] Cannot accept offer in state: ${this.pc.signalingState}`);
        }

        const offerDesc = JSON.parse(offerStr) as RTCSessionDescriptionInit;
        if (offerDesc.type !== 'offer') {
            throw new Error(`[VortexRTC] Expected offer, got: ${offerDesc.type}`);
        }
        await this.pc.setRemoteDescription(new RTCSessionDescription(offerDesc));
        // State is now: have-remote-offer

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        // State is now: stable (callee side is complete)

        await waitForIceGathering(this.pc);
        return JSON.stringify(this.pc.localDescription);
    }

    /**
     * CALLER: Accepts the callee's answer to finalize the connection.
     * State flow: have-local-offer → stable
     * GUARD: Only valid when in 'have-local-offer' state.
     */
    async acceptAnswer(answerStr: string): Promise<void> {
        const answerDesc = JSON.parse(answerStr) as RTCSessionDescriptionInit;
        if (answerDesc.type !== 'answer') {
            throw new Error(`[VortexRTC] Expected answer, got: ${answerDesc.type}`);
        }

        if (this.pc.signalingState !== 'have-local-offer') {
            console.warn(
                `[VortexRTC] acceptAnswer called in wrong state: ${this.pc.signalingState}. Ignoring.`
            );
            return;
        }
        await this.pc.setRemoteDescription(new RTCSessionDescription(answerDesc));
        // State is now: stable
    }

    /** Send a text or JSON message over the DataChannel */
    sendMessage(data: string): boolean {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(data);
            return true;
        }
        return false;
    }

    /** Add a local media stream (video/audio) to the connection */
    addStream(stream: MediaStream): void {
        stream.getTracks().forEach((track) => {
            this.pc.addTrack(track, stream);
        });
    }

    /** Get current connection state */
    getState(): RTCConnectionState {
        return (this.pc.connectionState as RTCConnectionState) ?? 'new';
    }

    /** Get current signaling state (for debugging) */
    getSignalingState(): RTCSignalingState {
        return this.pc.signalingState;
    }

    /** Close and clean up the connection */
    close(): void {
        this.dataChannel?.close();
        this.pc.close();
    }
}
