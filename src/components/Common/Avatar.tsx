/**
 * Avatar.tsx
 * Reusable premium avatar component with support for colors, icons, and status dots.
 */
import { motion } from 'framer-motion';
import {
    User, Ghost, Bird, Dog, Zap, Flame, Star, Coffee, Users
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
    User, Ghost, Bird, Dog, Zap, Flame, Star, Coffee, Users
};

interface AvatarProps {
    avatarColor: string;
    avatarIcon?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isConnected?: boolean;
    isGroup?: boolean;
    className?: string;
}

export function Avatar({
    avatarColor,
    avatarIcon,
    size = 'md',
    isConnected,
    isGroup,
    className = ""
}: AvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-20 h-20 text-4xl',
    };

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-10 h-10',
    };

    const dotSizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-5 h-5',
    };

    const IconComp = isGroup ? Users : (ICON_MAP[avatarIcon || 'User'] || User);

    return (
        <div
            className={`relative flex-shrink-0 flex items-center justify-center rounded-2xl shadow-sm border-2 border-white/10 overflow-hidden ${sizeClasses[size]} ${className}`}
            style={{ backgroundColor: avatarColor }}
        >
            <IconComp className={`${iconSizeClasses[size]} text-white drop-shadow-md`} />

            {isConnected !== undefined && isConnected && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute bottom-0 right-0 ${dotSizeClasses[size]} bg-success rounded-full border-2 border-bg-secondary`}
                />
            )}
        </div>
    );
}
