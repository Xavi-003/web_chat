/**
 * MessageBubble.tsx
 * Individual chat message bubble component.
 * Handles: text messages, system messages, file messages.
 */
import { motion } from 'framer-motion';
import { Check, CheckCheck, ShieldCheck, FileIcon } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { formatFullTime } from '../../utils/formatters';

interface Props {
    message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
    const { sender, type, content, timestamp, status, fileName, fileSize } = message;

    if (type === 'system') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-2"
            >
                <div className="flex items-center gap-1.5 glass-panel rounded-full px-4 py-1.5 text-xs text-text-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span>{content}</span>
                </div>
            </motion.div>
        );
    }

    const isMe = sender === 'me';

    function StatusIcon() {
        if (!isMe) return null;
        if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-accent" />;
        if (status === 'sent') return <Check className="w-3.5 h-3.5 text-text-muted" />;
        if (status === 'failed') return <Check className="w-3.5 h-3.5 text-danger" />;
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}
        >
            <div className={isMe ? 'message-bubble-out' : 'message-bubble-in'}>
                {type === 'file' ? (
                    <div className="flex items-center gap-3 min-w-[160px]">
                        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <FileIcon className="w-4 h-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-text-primary text-xs font-medium truncate">{fileName ?? 'File'}</p>
                            {fileSize !== undefined && (
                                <p className="text-text-muted text-xs">
                                    {fileSize < 1024 * 1024 ? `${(fileSize / 1024).toFixed(1)} KB` : `${(fileSize / 1024 / 1024).toFixed(1)} MB`}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{content}</p>
                )}

                {/* Timestamp + status */}
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-text-muted text-[10px] leading-none">{formatFullTime(timestamp)}</span>
                    <StatusIcon />
                </div>
            </div>
        </motion.div>
    );
}
