/**
 * ConnectModal.tsx
 * Modal for initiating a new P2P WebRTC connection.
 * Guides the user through the manual Offer/Answer signaling flow.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useVortexStore } from '../../store/useVortexStore';

export function ConnectModal() {
    const {
        isConnectModalOpen, closeConnectModal,
        generatedOffer, generatedAnswer,
        initAsCallerAndCreateOffer, submitOfferAndCreateAnswer, submitAnswerToFinalize,
    } = useVortexStore();

    const [step, setStep] = useState<'choose' | 'caller-offer' | 'caller-answer' | 'callee-offer' | 'callee-answer'>('choose');
    const [inputValue, setInputValue] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        closeConnectModal();
        setStep('choose');
        setInputValue('');
        setCopied(false);
    };

    const handleCopy = async (text: string) => {
        let success = false;
        // navigator.clipboard is blocked on non-HTTPS in Chrome
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                success = true;
            } catch { /* fall through */ }
        }
        if (!success) {
            // Fallback: create a hidden textarea, select and execCommand
            const el = document.createElement('textarea');
            el.value = text;
            el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
            document.body.appendChild(el);
            el.focus();
            el.select();
            try {
                document.execCommand('copy');
                success = true;
            } catch { /* ignore */ }
            document.body.removeChild(el);
        }
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleStartAsCaller = async () => {
        setIsLoading(true);
        setStep('caller-offer');
        await initAsCallerAndCreateOffer();
        setIsLoading(false);
    };

    const handleCallerSubmitAnswer = async () => {
        const val = inputValue.trim();
        if (!val) return;
        try {
            const parsed = JSON.parse(val);
            if (parsed.type !== 'answer') {
                alert(`Invalid input! You pasted an '${parsed.type}'. You must paste the ANSWER from your peer.`);
                return;
            }
        } catch {
            alert('Invalid JSON format. Please paste the exact text copied from your peer.');
            return;
        }

        setIsLoading(true);
        await submitAnswerToFinalize(val);
        setIsLoading(false);
    };

    const handleStartAsCallee = () => {
        setStep('callee-offer');
    };

    const handleCalleeSubmitOffer = async () => {
        const val = inputValue.trim();
        if (!val) return;
        try {
            const parsed = JSON.parse(val);
            if (parsed.type !== 'offer') {
                alert(`Invalid input! You pasted an '${parsed.type}'. You must paste the OFFER from the Caller.`);
                return;
            }
        } catch {
            alert('Invalid JSON format. Please paste the exact text copied from the Caller.');
            return;
        }

        setIsLoading(true);
        setStep('callee-answer');
        await submitOfferAndCreateAnswer(val);
        setInputValue('');
        setIsLoading(false);
    };

    if (!isConnectModalOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <motion.div
                    className="relative z-10 w-full max-w-lg glass-panel rounded-2xl p-6 shadow-panel"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-center">
                                <Wifi className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-text-primary font-semibold text-lg">New Secure Connection</h2>
                                <p className="text-text-muted text-xs">Manual WebRTC P2P Signaling</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="btn-ghost">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Step: Choose role */}
                    {step === 'choose' && (
                        <div className="space-y-3">
                            <p className="text-text-secondary text-sm mb-4">
                                Choose your role. Share Vortex with your peer and coordinate who is the Caller.
                            </p>
                            <button
                                onClick={handleStartAsCaller}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-accent/30 bg-accent/5
                           hover:bg-accent/10 transition-all duration-200 group text-left"
                            >
                                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                    <Wifi className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-semibold">I'm the Caller</p>
                                    <p className="text-text-muted text-xs">Generate an Offer and send it to your peer</p>
                                </div>
                            </button>
                            <button
                                onClick={handleStartAsCallee}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-secondary/50
                           hover:bg-bg-hover transition-all duration-200 group text-left"
                            >
                                <div className="w-10 h-10 bg-bg-hover rounded-lg flex items-center justify-center group-hover:bg-bg-selected transition-colors">
                                    <WifiOff className="w-5 h-5 text-text-secondary" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-semibold">I'm the Callee</p>
                                    <p className="text-text-muted text-xs">Paste the Offer from your peer, get an Answer</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Step: Caller - Show offer */}
                    {step === 'caller-offer' && (
                        <div className="space-y-4">
                            <p className="text-text-secondary text-sm">1. Copy the <span className="text-accent font-medium">Offer</span> below and send it to your peer.</p>
                            <div className="relative">
                                <textarea
                                    readOnly
                                    value={isLoading ? 'Generating secure offer...' : generatedOffer}
                                    className="input-base w-full h-32 resize-none font-mono text-xs text-text-muted"
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary/80 rounded-lg">
                                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                    </div>
                                )}
                            </div>
                            {!isLoading && generatedOffer && (
                                <button onClick={() => handleCopy(generatedOffer)} className="btn-primary w-full flex items-center justify-center gap-2">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy Offer'}
                                </button>
                            )}
                            {!isLoading && generatedOffer && (
                                <>
                                    <p className="text-text-secondary text-sm mt-4">2. Paste the <span className="text-accent font-medium">Answer</span> your peer sends back:</p>
                                    <textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Paste peer's Answer here..."
                                        className="input-base w-full h-28 resize-none font-mono text-xs"
                                    />
                                    <button
                                        onClick={handleCallerSubmitAnswer}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                                        Finalize Connection
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step: Callee - Paste offer */}
                    {step === 'callee-offer' && (
                        <div className="space-y-4">
                            <p className="text-text-secondary text-sm">1. Paste the <span className="text-accent font-medium">Offer</span> from your peer:</p>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Paste caller's Offer here..."
                                className="input-base w-full h-32 resize-none font-mono text-xs"
                            />
                            <button
                                onClick={handleCalleeSubmitOffer}
                                disabled={!inputValue.trim() || isLoading}
                                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Generate Answer
                            </button>
                        </div>
                    )}

                    {/* Step: Callee - Show answer */}
                    {step === 'callee-answer' && (
                        <div className="space-y-4">
                            <p className="text-text-secondary text-sm">2. Copy the <span className="text-accent font-medium">Answer</span> and send it back to the Caller:</p>
                            <div className="relative">
                                <textarea
                                    readOnly
                                    value={isLoading ? 'Generating answer...' : generatedAnswer}
                                    className="input-base w-full h-32 resize-none font-mono text-xs text-text-muted"
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary/80 rounded-lg">
                                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                    </div>
                                )}
                            </div>
                            {!isLoading && generatedAnswer && (
                                <button onClick={() => handleCopy(generatedAnswer)} className="btn-primary w-full flex items-center justify-center gap-2">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy Answer'}
                                </button>
                            )}
                            <p className="text-text-muted text-xs text-center mt-2">
                                Connection will establish automatically once the Caller pastes the answer. Waiting...
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
